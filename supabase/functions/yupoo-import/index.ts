import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STORAGE_BUCKET = "product_media";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function absUrl(u: string, base: string) {
  if (!u) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http")) return u;
  try { return new URL(u, base).toString(); } catch { return u; }
}

function toOriginal(u: string) {
  return u
    .replace(/\/small\.(jpg|jpeg|png|webp|gif)/i, "/big.$1")
    .replace(/\/medium\.(jpg|jpeg|png|webp|gif)/i, "/big.$1")
    .replace(/\/square\.(jpg|jpeg|png|webp|gif)/i, "/big.$1");
}

function parseSetCookie(headers: Headers): string {
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

// More lenient password detection
function needsPassword(html: string): boolean {
  const patterns = [
    /showalbum__passwordform/i,
    /album.*password/i,
    /输入密码/,
    /请输入密码/,
    /密\s*码/,
    /name=["']password["']/i,
    /id=["']password["']/i,
    /placeholder=["'][^"']*password[^"']*["']/i,
  ];
  let hits = 0;
  for (const p of patterns) if (p.test(html)) hits++;
  // also check there is NO actual gallery content present
  const hasGallery = /showalbum__children|showalbum__gallery|data-origin-src/i.test(html);
  return hits >= 1 && !hasGallery;
}

function extractAlbumId(html: string, url: string): string | null {
  const m1 = html.match(/album[_-]?id["']?\s*[:=]\s*["']?(\d+)/i);
  if (m1) return m1[1];
  const m2 = url.match(/\/albums?\/(\d+)/i);
  if (m2) return m2[1];
  return null;
}

async function submitPassword(albumUrl: string, password: string, cookie: string): Promise<string> {
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

  const imgRegex = /<img\b[^>]*?(?:data-origin-src|data-src|src)\s*=\s*["']([^"']+\.(?:jpe?g|png|webp|gif))(?:\?[^"']*)?["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null) {
    const raw = m[1];
    if (/avatar|logo|emoji|placeholder|policeIcon|yupoo\.com\/website/i.test(raw)) continue;
    images.add(toOriginal(absUrl(raw, baseUrl)));
  }
  const orig = /data-origin-src\s*=\s*["']([^"']+)["']/gi;
  while ((m = orig.exec(html)) !== null) {
    if (/avatar|logo|emoji|placeholder|policeIcon|yupoo\.com\/website/i.test(m[1])) continue;
    images.add(toOriginal(absUrl(m[1], baseUrl)));
  }

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

async function downloadAndUpload(
  supabase: any,
  url: string,
  cookie: string,
  referer: string,
  folder: string,
  errors: string[],
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Referer": referer,
        "Accept": "image/*,video/*,*/*",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      redirect: "follow",
    });
    if (!res.ok) {
      errors.push(`fetch ${res.status}: ${url.slice(0, 100)}`);
      return null;
    }
    const ct = res.headers.get("content-type") || "application/octet-stream";
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 200) {
      errors.push(`tiny ${ab.byteLength}b ct=${ct}: ${url.slice(0, 100)}`);
      return null;
    }

    const ext = extFromUrl(url, ct);
    const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(key, new Uint8Array(ab), { contentType: ct, upsert: true });
    if (error) {
      errors.push(`upload: ${error.message}`);
      console.error("storage upload error", url, error.message);
      return null;
    }
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
    return pub.publicUrl;
  } catch (e) {
    console.error("downloadAndUpload failed", url, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
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
    const forcePassword: boolean = !!body.forcePassword;

    if (!url || !/^https?:\/\/.+yupoo\.com/i.test(url)) {
      return new Response(JSON.stringify({ error: "Valid Yupoo URL required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!password) {
      const { data: savedPw } = await supabase
        .from("yupoo_passwords")
        .select("password")
        .eq("album_url", url)
        .maybeSingle();
      if (savedPw?.password) password = savedPw.password;
    }

    let { html, cookie } = await fetchAlbum(url);

    const detected = needsPassword(html);
    if ((detected || forcePassword) && !password) {
      return new Response(JSON.stringify({ passwordRequired: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((detected || forcePassword) && password) {
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
      return new Response(JSON.stringify({
        error: "No media found. If this album is password-protected, click 'Enter Password' and try again.",
        passwordRequired: false,
      }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const folder = `yupoo/${safeSlug(title)}-${Date.now()}`;

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

    const uploadedImages = await runPool(images, (u) => downloadAndUpload(supabase, u, cookie, url, folder));
    const uploadedVideos = await runPool(videos, (u) => downloadAndUpload(supabase, u, cookie, url, folder));

    if (uploadedImages.length === 0 && uploadedVideos.length === 0) {
      return new Response(JSON.stringify({
        error: `Found ${images.length} images & ${videos.length} videos but all uploads failed. Check storage bucket '${STORAGE_BUCKET}' permissions.`,
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
