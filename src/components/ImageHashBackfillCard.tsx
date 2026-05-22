import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { computeAHashFromDataUrl, unsignedToSignedBigIntString } from "@/utils/imageHash";
import { sanitizeImageUrl } from "@/utils/imageUrlHelper";

// Client-side backfill: browser canvas does the decode/hash → zero edge CPU cost.
const BATCH_SIZE = 50;

// Route through weserv.nl: adds CORS headers + resizes to tiny 32px (fast download).
function proxiedUrl(raw: string): string {
  const clean = raw.replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=32&h=32&fit=cover&output=jpg`;
}

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(proxiedUrl(url));
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}


const ImageHashBackfillCard = () => {
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<{ success: number; failed: number; remaining: number } | null>(null);

  const runBatch = async () => {
    setRunning(true);
    try {
      const { data: rows, error } = await supabase
        .from("products")
        .select("id, first_image")
        .is("image_phash", null)
        .not("first_image", "is", null)
        .limit(BATCH_SIZE);
      if (error) throw error;

      let success = 0;
      let failed = 0;
      for (const row of rows || []) {
        try {
          const url = sanitizeImageUrl(row.first_image!) || row.first_image!;
          const dataUrl = await urlToDataUrl(url);
          const unsigned = await computeAHashFromDataUrl(dataUrl);
          const signed = unsignedToSignedBigIntString(unsigned);
          const { error: upErr } = await supabase
            .from("products")
            .update({ image_phash: signed as any })
            .eq("id", row.id);
          if (upErr) { failed++; console.error(upErr); }
          else success++;
        } catch (e) {
          failed++;
          console.warn("hash failed", row.id, e);
        }
      }

      const { count: remaining } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .is("image_phash", null)
        .not("first_image", "is", null);

      setStats({ success, failed, remaining: remaining ?? 0 });
      toast.success(`Hashed ${success}. ${remaining ?? 0} remaining.`);
    } catch (e: any) {
      toast.error(e.message || "Backfill failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-purple-400" />
          <div>
            <h2 className="text-lg font-semibold">Image Search Index</h2>
            <p className="text-sm text-muted-foreground">
              Generate perceptual hashes so users can reverse-search products by image.
            </p>
            {stats && (
              <p className="text-xs mt-2 text-muted-foreground">
                Last batch: {stats.success} hashed, {stats.failed} failed · {stats.remaining} remaining
              </p>
            )}
          </div>
        </div>
        <Button onClick={runBatch} disabled={running}>
          {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Hashing…</> : `Run Backfill (${BATCH_SIZE})`}
        </Button>
      </div>
    </Card>
  );
};

export default ImageHashBackfillCard;
