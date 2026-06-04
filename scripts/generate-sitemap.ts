// Runs before `vite dev` and `vite build` via predev/prebuild hooks.
// Writes public/sitemap.xml with static routes + dynamic blog/category/product entries.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://fatherofluxury.lovable.app";
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://zsptshspjdzvhgjmnjtl.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcHRzaHNwamR6dmhnam1uanRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjcwNDYsImV4cCI6MjA1NDgwMzA0Nn0.Esrr86sLCB_938MG4l-cz9GGCBrmNeB3uAFpdaw3Cmg";

interface SitemapEntry {
  path: string;
  changefreq?: string;
  priority?: string;
}

async function rest<T>(table: string, query: string): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    console.warn(`[sitemap] fetch ${table} failed: ${res.status}`);
    return [];
  }
  return (await res.json()) as T[];
}

async function fetchAll<T>(table: string, select: string): Promise<T[]> {
  const pageSize = 1000;
  const out: T[] = [];
  let from = 0;
  for (;;) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${from}-${from + pageSize - 1}`,
        "Range-Unit": "items",
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] fetch ${table} failed: ${res.status}`);
      break;
    }
    const rows = (await res.json()) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  const entries: SitemapEntry[] = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/categories", changefreq: "weekly", priority: "0.8" },
    { path: "/blog", changefreq: "weekly", priority: "0.8" },
    { path: "/reviews", changefreq: "weekly", priority: "0.7" },
  ];

  try {
    const blogs = await rest<{ slug: string }>("blog_posts", "select=slug");
    for (const b of blogs)
      if (b.slug) entries.push({ path: `/blog/${b.slug}`, changefreq: "monthly", priority: "0.6" });

    const cats = await rest<{ name: string }>("categories", "select=name");
    for (const c of cats) {
      if (!c.name) continue;
      // Skip malformed/legacy category names that contain slashes or excessive length —
      // those produce broken URLs and 404s when crawled.
      if (c.name.includes("/") || c.name.length > 80) continue;
      entries.push({
        path: `/category/${encodeURIComponent(c.name.trim())}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }

    const products = await fetchAll<{ id: string }>("products", "id");
    for (const p of products)
      if (p.id) entries.push({ path: `/product/${p.id}`, changefreq: "monthly", priority: "0.5" });
  } catch (err) {
    console.warn(`[sitemap] dynamic fetch error:`, err);
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${xmlEscape(`${BASE_URL}${e.path}`)}</loc>`,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
        e.priority ? `    <priority>${e.priority}</priority>` : "",
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main();
