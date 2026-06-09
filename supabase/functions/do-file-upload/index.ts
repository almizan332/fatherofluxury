import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.445.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const DO_SPACES_KEY = Deno.env.get("DO_SPACES_KEY");
const DO_SPACES_SECRET = Deno.env.get("DO_SPACES_SECRET");
const DO_SPACES_ENDPOINT = Deno.env.get("DO_SPACES_ENDPOINT") || "https://nyc3.digitaloceanspaces.com";
const DO_SPACES_BUCKET = "shadow-copy-portal";
const DO_SPACES_REGION = "nyc3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Allowed domains for URL-based file fetching (SSRF protection)
const ALLOWED_DOMAINS = [
  'yupoo.com',
  'wsrv.nl',
  'photobucket.com',
  'imgur.com',
  'imagecdn.app',
  'alihiddenproduct.com',
];

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const s3Client = new S3Client({
  endpoint: DO_SPACES_ENDPOINT,
  region: DO_SPACES_REGION,
  credentials: {
    accessKeyId: DO_SPACES_KEY || "",
    secretAccessKey: DO_SPACES_SECRET || "",
  },
  forcePathStyle: false,
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extFromMime(ct: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
    'image/gif': '.gif', 'image/webp': '.webp',
    'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
  };
  return map[ct] || '';
}

function extFromUrl(url: string, ct: string): string {
  const u = url.split(/[#?]/)[0].split('.').pop()?.trim().toLowerCase();
  if (u && u.length <= 5) return `.${u}`;
  return extFromMime(ct);
}

async function uploadBufferToDO(buf: Uint8Array, contentType: string, ext: string, folder = "uploads"): Promise<string> {
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}${ext}`;
  const filePath = `${folder}/${filename}`;
  await s3Client.send(new PutObjectCommand({
    Bucket: DO_SPACES_BUCKET,
    Key: filePath,
    Body: buf,
    ACL: "public-read",
    ContentType: contentType,
  }));
  return `${DO_SPACES_ENDPOINT}/${DO_SPACES_BUCKET}/${filePath}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: require a valid Supabase JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const contentType = req.headers.get("content-type") || "";

    // === Mode 1: multipart/form-data direct file upload ===
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const folder = (form.get("folder") as string) || "uploads";
      if (!(file instanceof File)) return json({ error: "Missing file field" }, 400);
      const ct = file.type || "application/octet-stream";
      if (!ALLOWED_MIME_TYPES.includes(ct)) return json({ error: "File type not allowed" }, 400);
      if (file.size > MAX_FILE_SIZE) return json({ error: "File too large (max 50MB)" }, 400);
      const buf = new Uint8Array(await file.arrayBuffer());
      const ext = extFromUrl(file.name || "", ct);
      const url = await uploadBufferToDO(buf, ct, ext, folder);
      return json({ url });
    }

    // === Mode 2: JSON { url, fileType } — fetch remote then upload ===
    const { url, fileType } = await req.json();
    if (!url || typeof url !== 'string') return json({ error: "Valid URL is required" }, 400);

    let parsedUrl: URL;
    try { parsedUrl = new URL(url); } catch { return json({ error: "Invalid URL format" }, 400); }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
    if (!isAllowed) return json({ error: "Domain not allowed for security reasons" }, 403);

    const fileResponse = await fetch(url, {
      method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!fileResponse.ok) return json({ error: `Failed to fetch file: ${fileResponse.statusText}` }, 400);

    const ct = fileType || fileResponse.headers.get("Content-Type") || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.includes(ct)) return json({ error: "File type not allowed" }, 400);

    const contentLength = fileResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) return json({ error: "File too large (max 50MB)" }, 400);

    const fileData = await fileResponse.arrayBuffer();
    if (fileData.byteLength > MAX_FILE_SIZE) return json({ error: "File too large (max 50MB)" }, 400);

    const buf = new Uint8Array(fileData);
    const ext = extFromUrl(url, ct);
    const publicUrl = await uploadBufferToDO(buf, ct, ext);
    return json({ url: publicUrl });
  } catch (error) {
    console.error("do-file-upload error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
