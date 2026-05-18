import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.445.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const DO_SPACES_KEY = Deno.env.get("DO_SPACES_KEY") ?? "";
const DO_SPACES_SECRET = Deno.env.get("DO_SPACES_SECRET") ?? "";
const DO_SPACES_ENDPOINT = Deno.env.get("DO_SPACES_ENDPOINT") || "https://nyc3.digitaloceanspaces.com";
const DO_SPACES_BUCKET = "shadow-copy-portal";
const DO_SPACES_REGION = "nyc3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const s3 = new S3Client({
  endpoint: DO_SPACES_ENDPOINT,
  region: DO_SPACES_REGION,
  credentials: { accessKeyId: DO_SPACES_KEY, secretAccessKey: DO_SPACES_SECRET },
  forcePathStyle: false,
});

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function absUrl(u: string, base: string) {
  if (!u) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http")) return u;
  try { return new URL(u, base).toString(); } catch { return u; }
}

// upscale yupoo thumbnail -> big/original
function toOriginal(u: string) {
  return u
    .replace(/\/small\.(jpg|jpeg|png|webp|gif)/i, "/big.$1")
    .replace(/\/medium\.(jpg|jpeg|png|webp|gif)/i, "/big.$1")
    .replace(/\/square\.(jpg|jpeg|png|webp|gif)/i, "/big.$1");
}

function parseSetCookie(headers: Headers): string {
  // Deno fetch Headers: getSetCookie() returns string[]
  // @ts-ignore
  const list: string[] = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  return list.map((c) => c.split(";")[0]).join("; ");
}

function mergeCookies(a: string, b: string) {
  const map = new Map<string, string>();
  for (const part of (a + "; " + b).split(";")) {
    const p = part.trim();
    if (!p) continue;
    const i = p.indexOf("=");
    if (i > 0) map.set(p.slice(0, i), p.slice(i + 1));
  }
  return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function fetchAlbum(url: string, cookie = ""): Promise<{ html: string; cookie: string; status: number }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    redirect: "follow",
  });
  const setCookie = parseSetCookie(res.headers);
  const newCookie = mergeCookies(cookie, setCookie);
  const html = await res.text();
  return { html, cookie: newCookie, status: res.status };
}

function needsPassword(html: string): boolean {
  return /password|密\s*码|输入密码|name=["']password["']/i.test(html) &&
         /album.*password|showalbum__passwordform|输入密码/i.test(html);
}

function extractAlbumId(html: string, url: string): string | null {
  const m1 = html.match(/album[_-]?id["']?\s*[:=]\s*["']?(\d+)/i);
  if (m1) return m1[1];
  const m2 = url.match(/\/albums?\/(\d+)/i);
  if (m2) return m2[1];
  return null;
}

async function submitPassword(albumUrl: string, password: string, cookie: string): Promise<string> {
  // find album base e.g. https://xxx.x.yupoo.com
  const u = new URL(albumUrl);
  const origin = `${u.protocol}//${u.host}`;
  const { html } = await fetchAlbum(albumUrl, cookie);
  const albumId = extractAlbumId(html, albumUrl);
  if (!albumId) throw new Error("Could not detect album id for password submission");

  const form = new URLSearchParams();
  form.set("password", password);
  form.set("albumid", albumId);

  const endpoints = [
    `${origin}/album/password?albumid=${albumId}`,
    `${origin}/manage/album/password`,
  ];
  let lastCookie = cookie;
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          "User-Agent": UA,
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": albumUrl,
          "X-Requested-With": "XMLHttpRequest",
          ...(lastCookie ? { Cookie: lastCookie } : {}),
        },
        body: form.toString(),
        redirect: "manual",
      });
      lastCookie = mergeCookies(lastCookie, parseSetCookie(res.headers));
      if (res.status < 500) break;
    } catch { /* try next */ }
  }
  return lastCookie;
}

function extractTitle(html: string): string {
  const m = html.match(/<h3[^>]*showalbumheader__gallerytitle[^>]*>([\s\S]*?)<\/h3>/i)
        || html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return "Yupoo Product";
  return m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}

function extractMedia(html: string, baseUrl: string): { images: string[]; videos: string[] } {
  const images = new Set<string>();
  const videos = new Set<string>();

  // image candidates from data-* attributes
  const imgRegex = /<img\b[^>]*?(?:data-origin-src|data-src|src)\s*=\s*["']([^"']+\.(?:jpe?g|png|webp|gif))(?:\?[^"']*)?["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null) {
    const raw = m[1];
    if (/avatar|logo|emoji|placeholder/i.test(raw)) continue;
    images.add(toOriginal(absUrl(raw, baseUrl)));
  }
  // also catch data-origin-src not on <img>
  const orig = /data-origin-src\s*=\s*["']([^"']+)["']/gi;
  while ((m = orig.exec(html)) !== null) {
    images.add(toOriginal(absUrl(m[1], baseUrl)));
  }

  // videos
  const vidRegex = /(?:data-src|src)\s*=\s*["']([^"']+\.(?:mp4|webm|mov))(?:\?[^"']*)?["']/gi;
  while ((m = vidRegex.exec(html)) !== null) {
    videos.add(absUrl(m[1], baseUrl));
  }

  return { images: Array.from(images), videos: Array.from(videos) };
}

function extFromUrl(url: string, ct: string): string {
  const u = url.split(/[#?]/)[0].split(".").pop()?.toLowerCase() ?? "";
  if (u && u.length <= 5 && /^[a-z0-9]+$/.test(u)) return "." + u;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
    "image/gif": ".gif", "video/mp4": ".mp4", "video/webm": ".webm",
  };
  return map[ct] ?? "";
}

function safeSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "product";
}

async function uploadToDO(buf: Uint8Array, ct: string, folder: string, url: string): Promise<string> {
  const ext = extFromUrl(url, ct);
  const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: DO_SPACES_BUCKET,
    Key: key,
    Body: buf,
    ACL: "public-read",
    ContentType: ct,
  }));
  return `${DO_SPACES_ENDPOINT}/${DO_SPACES_BUCKET}/${key}`;
}

async function downloadAndUpload(url: string, cookie: string, referer: string, folder: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Referer": referer,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      redirect: "follow",
    });
    if (!res.ok) {
      // fallback: try without "big" upscale
      return null;
    }
    const ct = res.headers.get("content-type") || "application/octet-stream";
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 1024) return null; // too small, probably placeholder
    return await uploadToDO(new Uint8Array(ab), ct, folder, url);
  } catch (e) {
    console.error("downloadAndUpload failed", url, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // auth: require admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const url: string = body.url;
    let password: string | undefined = body.password;
    const savePassword: boolean = !!body.savePassword;

    if (!url || !/^https?:\/\/.+yupoo\.com/i.test(url)) {
      return new Response(JSON.stringify({ error: "Valid Yupoo URL required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // try saved password if none provided
    if (!password) {
      const { data: savedPw } = await supabase
        .from("yupoo_passwords")
        .select("password")
        .eq("album_url", url)
        .maybeSingle();
      if (savedPw?.password) password = savedPw.password;
    }

    let { html, cookie } = await fetchAlbum(url);

    if (needsPassword(html)) {
      if (!password) {
        return new Response(JSON.stringify({ passwordRequired: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      cookie = await submitPassword(url, password, cookie);
      const second = await fetchAlbum(url, cookie);
      html = second.html;
      cookie = second.cookie;
      if (needsPassword(html)) {
        return new Response(JSON.stringify({ passwordRequired: true, error: "Wrong password" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (savePassword) {
        await supabase.from("yupoo_passwords").upsert({ album_url: url, password }, { onConflict: "album_url" });
      }
    }

    const title = extractTitle(html);
    const { images, videos } = extractMedia(html, url);

    if (images.length === 0 && videos.length === 0) {
      return new Response(JSON.stringify({ error: "No media found in album" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const folder = `yupoo/${safeSlug(title)}-${Date.now()}`;

    // upload in parallel with concurrency limit
    const limit = 5;
    async function runPool<T>(items: T[], fn: (i: T) => Promise<string | null>): Promise<string[]> {
      const out: string[] = [];
      let idx = 0;
      const workers = Array(Math.min(limit, items.length)).fill(0).map(async () => {
        while (idx < items.length) {
          const i = idx++;
          const r = await fn(items[i]);
          if (r) out.push(r);
        }
      });
      await Promise.all(workers);
      return out;
    }

    const uploadedImages = await runPool(images, (u) => downloadAndUpload(u, cookie, url, folder));
    const uploadedVideos = await runPool(videos, (u) => downloadAndUpload(u, cookie, url, folder));

    return new Response(JSON.stringify({
      title,
      images: uploadedImages,
      videos: uploadedVideos,
      sourceUrl: url,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("yupoo-import error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
