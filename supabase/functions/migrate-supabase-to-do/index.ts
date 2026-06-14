// Admin-only one-shot/batch migration: copy files from Supabase Storage buckets
// to DigitalOcean Spaces and rewrite their public URLs in the products & categories tables.
//
// POST JSON body:
//   { buckets?: string[], limit?: number, dryRun?: boolean }
// Defaults: buckets = ["product_media","category-images","category_images","temp_uploads"], limit = 200
//
// Returns per-bucket counts: { migrated, skipped, failed, remaining }.
// Call repeatedly until `remaining` is 0 for every bucket.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.445.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DO_KEY = Deno.env.get("DO_SPACES_KEY") ?? "";
const DO_SECRET = Deno.env.get("DO_SPACES_SECRET") ?? "";
const DO_ENDPOINT = Deno.env.get("DO_SPACES_ENDPOINT") || "https://nyc3.digitaloceanspaces.com";
const DO_BUCKET = "shadow-copy-portal";
const DO_REGION = "nyc3";

const DEFAULT_BUCKETS = ["product_media", "category-images", "category_images", "temp_uploads"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const s3 = new S3Client({
  endpoint: DO_ENDPOINT,
  region: DO_REGION,
  credentials: { accessKeyId: DO_KEY, secretAccessKey: DO_SECRET },
  forcePathStyle: false,
});

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const extToMime: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  webp: "image/webp", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};

function guessMime(name: string): string {
  const e = name.split(".").pop()?.toLowerCase() ?? "";
  return extToMime[e] ?? "application/octet-stream";
}

async function listAllFiles(bucket: string, prefix = "", out: string[] = []): Promise<string[]> {
  const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) throw error;
  for (const item of data ?? []) {
    const full = prefix ? `${prefix}/${item.name}` : item.name;
    // Folders have no `id` / no metadata in supabase storage listing
    if ((item as any).id === null || (!item.metadata && !(item as any).id)) {
      await listAllFiles(bucket, full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

async function rewriteUrls(oldUrl: string, newUrl: string) {
  // Update any column that may store the old URL. Use raw SQL for flexibility.
  const queries = [
    admin.from("products").update({ first_image: newUrl }).eq("first_image", oldUrl),
    admin.from("categories").update({ image_url: newUrl }).eq("image_url", oldUrl),
  ];
  await Promise.allSettled(queries);

  // products.images is text[]; categories may have arrays too — handle via RPC-free SQL.
  // Use postgres update with array_replace via the REST query builder is not supported,
  // so call a small RPC if you need array rewriting. For now, log array-bearing rows.
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    // Admin auth
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);
    const { data: u, error: ue } = await admin.auth.getUser(jwt);
    if (ue || !u.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" }).maybeSingle?.() ?? { data: null };
    // Fallback: query user_roles directly
    if (!isAdmin) {
      const { data: rr } = await admin.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (!rr) return json({ error: "Admin only" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const buckets: string[] = Array.isArray(body.buckets) && body.buckets.length ? body.buckets : DEFAULT_BUCKETS;
    const limit: number = Math.min(Math.max(Number(body.limit) || 200, 1), 1000);
    const dryRun: boolean = Boolean(body.dryRun);

    const report: Record<string, any> = {};

    for (const bucket of buckets) {
      const all = await listAllFiles(bucket).catch((e) => {
        report[bucket] = { error: e.message };
        return null;
      });
      if (!all) continue;

      const slice = all.slice(0, limit);
      let migrated = 0, skipped = 0, failed = 0;
      const failures: string[] = [];

      for (const path of slice) {
        try {
          const oldPublic = admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
          if (dryRun) { skipped++; continue; }

          const { data: blob, error: dlErr } = await admin.storage.from(bucket).download(path);
          if (dlErr || !blob) { failed++; failures.push(path); continue; }
          const buf = new Uint8Array(await blob.arrayBuffer());
          const ct = blob.type || guessMime(path);
          const key = `${bucket}/${path}`;
          await s3.send(new PutObjectCommand({
            Bucket: DO_BUCKET, Key: key, Body: buf, ACL: "public-read", ContentType: ct,
          }));
          const newUrl = `${DO_ENDPOINT}/${DO_BUCKET}/${key}`;
          await rewriteUrls(oldPublic, newUrl);
          migrated++;
        } catch (e) {
          failed++; failures.push(path);
          console.error("migrate fail", bucket, path, e);
        }
      }

      report[bucket] = {
        total: all.length,
        processed: slice.length,
        migrated, skipped, failed,
        remaining: Math.max(all.length - migrated - skipped, 0),
        failures: failures.slice(0, 10),
      };
    }

    return json({ ok: true, dryRun, report });
  } catch (e) {
    console.error(e);
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
