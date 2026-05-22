// Reverse image search via average-hash (aHash) Hamming distance.
// search: client sends precomputed 64-bit hash string (no decode in Deno → no CPU limit)
// backfill: admin-only, decodes product images in small batches

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decode, Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function toSignedBigInt(u: bigint): bigint {
  const MAX = 1n << 63n;
  return u >= MAX ? u - (1n << 64n) : u;
}
function fromSignedBigInt(s: bigint): bigint {
  return s < 0n ? s + (1n << 64n) : s;
}
function hammingDistance(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x) {
    x &= x - 1n;
    count++;
  }
  return count;
}

async function computeAHash(buffer: Uint8Array): Promise<bigint | null> {
  try {
    const img = await decode(buffer);
    if (!(img instanceof Image)) return null;
    const small = img.resize(8, 8);
    let total = 0;
    const grays: number[] = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = small.getPixelAt(x + 1, y + 1);
        const r = (pixel >> 24) & 0xff;
        const g = (pixel >> 16) & 0xff;
        const b = (pixel >> 8) & 0xff;
        const gray = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
        grays.push(gray);
        total += gray;
      }
    }
    const avg = total / 64;
    let hash = 0n;
    for (let i = 0; i < 64; i++) {
      if (grays[i] >= avg) hash |= 1n << BigInt(63 - i);
    }
    return hash;
  } catch (e) {
    console.error("aHash decode error:", (e as Error).message);
    return null;
  }
}

async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "search";
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    if (action === "search") {
      // Accept precomputed hash from client (preferred) or legacy base64 fallback.
      let queryHash: bigint | null = null;
      if (body.queryHash) {
        try { queryHash = BigInt(body.queryHash); } catch { queryHash = null; }
      } else if (body.imageBase64) {
        const raw = body.imageBase64.includes(",") ? body.imageBase64.split(",")[1] : body.imageBase64;
        const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
        queryHash = await computeAHash(bytes);
      }
      if (queryHash === null) {
        return new Response(JSON.stringify({ error: "queryHash required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const all: { id: string; product_name: string | null; slug: string | null; first_image: string | null; image_phash: number | string }[] = [];
      let from = 0;
      const PAGE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("products")
          .select("id, product_name, slug, first_image, image_phash")
          .not("image_phash", "is", null)
          .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
      }

      const matches = all
        .map((p) => {
          const stored = fromSignedBigInt(BigInt(p.image_phash as any));
          return { ...p, distance: hammingDistance(queryHash!, stored) };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 12);

      return new Response(
        JSON.stringify({
          totalScanned: all.length,
          results: matches.map((m) => ({
            id: m.id,
            slug: m.slug,
            product_name: m.product_name,
            first_image: m.first_image,
            distance: m.distance,
            similarity: Math.round((1 - m.distance / 64) * 100),
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "backfill") {
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) {
        return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });
      }

      const limit = Math.min(Number(body.limit) || 25, 50);
      const { data: rows, error } = await supabase
        .from("products")
        .select("id, first_image")
        .is("image_phash", null)
        .not("first_image", "is", null)
        .limit(limit);
      if (error) throw error;

      let success = 0;
      let failed = 0;
      for (const row of rows || []) {
        const bytes = await fetchImage(row.first_image!);
        if (!bytes) { failed++; continue; }
        const h = await computeAHash(bytes);
        if (h === null) { failed++; continue; }
        const signed = toSignedBigInt(h);
        const { error: upErr } = await supabase
          .from("products")
          .update({ image_phash: signed.toString() })
          .eq("id", row.id);
        if (upErr) { console.error(upErr); failed++; } else success++;
      }

      const { count: remaining } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .is("image_phash", null)
        .not("first_image", "is", null);

      return new Response(
        JSON.stringify({ processed: rows?.length || 0, success, failed, remaining }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("image-search error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
