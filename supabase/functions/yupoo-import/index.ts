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

function parseAlbum(url: string): { origin: string; host: string; albumId: string } | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/albums?\/(\d+)/);
    if (!m) return null;
    return { origin: `${u.protocol}//${u.host}`, host: u.host, albumId: m[1] };
  } catch { return null; }
}

function parseSetCookie(headers: Headers): string {
  // @ts-ignore
  const list: string[] = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  return list.map((c) => c.split(";")[0]).join("; ");
}

async function fetchAlbumTitle(origin: string, albumId: string): Promise<string> {
  try {
    const res = await fetch(`${origin}/albums/${albumId}?uid=1`, {
      headers: { "User-Agent": UA },
    });
    const html = await res.text();
    const m =
      html.match(/<h3[^>]*showalbumheader__gallerytitle[^>]*>([\s\S]*?)<\/h3>/i) ||
      html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!m) return "Yupoo Product";
    return m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 200) || "Yupoo Product";
  } catch { return "Yupoo Product"; }
}

// Calls Yupoo's real JSON API used by showalbum.js:
//   GET {origin}/api/web/albums/{albumId}/show?uid=1&password=PW
// Returns { code, message, data: { list: [...] } } on success.
async function fetchAlbumData(origin: string, albumId: string, password: string): Promise<
  { ok: true; list: any[]; cookie: string } |
  { ok: false; passwordRequired: boolean; status: number; message: string }
> {
  const url = `${origin}/api/web/albums/${albumId}/show?uid=1&password=${encodeURIComponent(password ?? "")}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "application/json, text/plain, */*",
      "Referer": `${origin}/albums/${albumId}`,
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  const cookie = parseSetCookie(res.headers);
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }

  if (res.ok && json?.data?.list && Array.isArray(json.data.list)) {
    return { ok: true, list: json.data.list, cookie };
  }
  const msg = (json?.message || text || "").toString();
  // Heuristics for password-required responses
  const passwordRequired =
    res.status === 401 || res.status === 403 ||
    /password|密码|lock/i.test(msg) ||
    json?.code === 401 || json?.code === 403;
  return { ok: false, passwordRequired, status: res.status, message: msg.slice(0, 200) };
}

function bestPhotoUrl(item: any): { url: string; ext: string } | null {
  // item.path like "/cyborg77/65d7013b03/b8d6a5d2.png"
  // item.attribute.type like "png" | "jpeg"
  const path: string = item?.path || "";
  const type: string = (item?.attribute?.type || "").toLowerCase();
  if (!path) return null;
  const ext = type === "jpeg" ? "jpg" : (type || path.split(".").pop() || "jpg").toLowerCase();
  // Directory containing the file, then big.<ext>
  const dir = path.replace(/\/[^/]+$/, "");
  return { url: `https://photo.yupoo.com${dir}/big.${ext}`, ext };
}

function bestVideoUrl(item: any): { url: string; ext: string } | null {
  const path: string = item?.path || item?.videoPath || "";
  if (!path) return null;
  const ext = (item?.attribute?.type || path.split(".").pop() || "mp4").toLowerCase();
  return { url: `https://uvd.yupoo.com${path}`, ext };
}

async function downloadAndUpload(
  supabase: any,
  url: string,
  referer: string,
  folder: string,
  ext: string,
  errors: string[],
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Referer": referer,
        "Accept": "image/*,video/*,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      // Fallback: try /orig.<ext> if /big failed
      if (url.includes("/big.")) {
        const alt = url.replace("/big.", "/orig.");
        const r2 = await fetch(alt, { headers: { "User-Agent": UA, "Referer": referer } });
        if (r2.ok) return await uploadBuf(supabase, await r2.arrayBuffer(), r2.headers.get("content-type") || "", folder, ext, errors);
      }
      errors.push(`fetch ${res.status}: ${url.slice(0, 100)}`);
      return null;
    }
    const ct = res.headers.get("content-type") || "application/octet-stream";
    const ab = await res.arrayBuffer();
    return await uploadBuf(supabase, ab, ct, folder, ext, errors);
  } catch (e) {
    errors.push(`exc: ${(e as Error).message}`);
    return null;
  }
}

async function uploadBuf(
  supabase: any, ab: ArrayBuffer, ct: string, folder: string, ext: string, errors: string[],
): Promise<string | null> {
  if (ab.byteLength < 200) { errors.push(`tiny ${ab.byteLength}b`); return null; }
  const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(key, new Uint8Array(ab), { contentType: ct, upsert: true });
  if (error) { errors.push(`upload: ${error.message}`); return null; }
  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  return pub.publicUrl;
}

function safeSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "product";
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
      .from("user_roles").select("role")
      .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const url: string = body.url;
    let password: string | undefined = body.password;
    const savePassword: boolean = !!body.savePassword;

    const parsed = parseAlbum(url || "");
    if (!parsed) {
      return new Response(JSON.stringify({ error: "Provide a valid Yupoo album URL (e.g. https://xxx.x.yupoo.com/albums/12345)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reuse stored password if user didn't pass one
    if (!password) {
      const { data: savedPw } = await supabase
        .from("yupoo_passwords").select("password")
        .eq("album_url", url).maybeSingle();
      if (savedPw?.password) password = savedPw.password;
    }

    // First try with whatever password we have (may be empty)
    let data = await fetchAlbumData(parsed.origin, parsed.albumId, password ?? "");

    if (!data.ok) {
      if (data.passwordRequired || !password) {
        return new Response(JSON.stringify({
          passwordRequired: true,
          error: password ? "Wrong password for this album." : "This album is password-protected.",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        error: `Yupoo API returned ${data.status}: ${data.message}`,
      }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (password && savePassword) {
      await supabase.from("yupoo_passwords").upsert(
        { album_url: url, password },
        { onConflict: "album_url" },
      );
    }

    const title = await fetchAlbumTitle(parsed.origin, parsed.albumId);
    const folder = `yupoo/${safeSlug(title)}-${Date.now()}`;
    const referer = `${parsed.origin}/albums/${parsed.albumId}`;

    const photoItems = data.list.filter((it) => it?.type !== "video");
    const videoItems = data.list.filter((it) => it?.type === "video");

    const errors: string[] = [];
    const uploadedImages: string[] = [];
    for (const it of photoItems) {
      const p = bestPhotoUrl(it);
      if (!p) continue;
      const u = await downloadAndUpload(supabase, p.url, referer, folder, p.ext, errors);
      if (u) uploadedImages.push(u);
    }
    const uploadedVideos: string[] = [];
    for (const it of videoItems) {
      const v = bestVideoUrl(it);
      if (!v) continue;
      const u = await downloadAndUpload(supabase, v.url, referer, folder, v.ext, errors);
      if (u) uploadedVideos.push(u);
    }

    if (uploadedImages.length === 0 && uploadedVideos.length === 0) {
      return new Response(JSON.stringify({
        error: `Album returned ${data.list.length} items but all downloads failed.`,
        details: errors.slice(0, 10),
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      title, images: uploadedImages, videos: uploadedVideos, sourceUrl: url,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("yupoo-import error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
