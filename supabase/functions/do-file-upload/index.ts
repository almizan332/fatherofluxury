import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.445.0";

const DO_SPACES_KEY = Deno.env.get("DO_SPACES_KEY");
const DO_SPACES_SECRET = Deno.env.get("DO_SPACES_SECRET");
const DO_SPACES_ENDPOINT = Deno.env.get("DO_SPACES_ENDPOINT") || "https://nyc3.digitaloceanspaces.com";
const DO_SPACES_BUCKET = "shadow-copy-portal";
const DO_SPACES_REGION = "nyc3";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed domains for file fetching (SSRF protection)
const ALLOWED_DOMAINS = [
  'yupoo.com',
  'wsrv.nl',
  'photobucket.com',
  'imgur.com',
  'imagecdn.app',
  'alihiddenproduct.com',
  'supabase.co'
];

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Create S3 client (Digital Ocean Spaces uses S3 compatible API)
const s3Client = new S3Client({
  endpoint: DO_SPACES_ENDPOINT,
  region: DO_SPACES_REGION,
  credentials: {
    accessKeyId: DO_SPACES_KEY || "",
    secretAccessKey: DO_SPACES_SECRET || "",
  },
  forcePathStyle: false,
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, fileType } = await req.json();

    // Input validation
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: "Valid URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SSRF protection: Check if domain is allowed
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: "Domain not allowed for security reasons" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the file from the provided URL
    const fileResponse = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch file: ${fileResponse.statusText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate content type
    const contentType = fileType || fileResponse.headers.get("Content-Type") || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: "File type not allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check file size
    const contentLength = fileResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large (max 50MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileData = await fileResponse.arrayBuffer();
    
    // Additional size check after download
    if (fileData.byteLength > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large (max 50MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileBuffer = new Uint8Array(fileData);

    // Generate a unique filename
    const fileExtension = getFileExtension(url, contentType);
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    const filePath = `uploads/${filename}`;

    // Upload to Digital Ocean Spaces
    await s3Client.send(new PutObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: filePath,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: contentType,
    }));

    // Generate the public URL
    const publicUrl = `${DO_SPACES_ENDPOINT}/${DO_SPACES_BUCKET}/${filePath}`;

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to extract file extension from URL or fallback to fileType
function getFileExtension(url: string, contentType: string): string {
  // Try to get extension from URL
  const urlExtension = url.split(/[#?]/)[0].split('.').pop()?.trim().toLowerCase();
  if (urlExtension && urlExtension.length <= 5) {
    return `.${urlExtension}`;
  }

  // Fallback to content type
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov'
  };
  
  return mimeToExt[contentType] || '';
}
