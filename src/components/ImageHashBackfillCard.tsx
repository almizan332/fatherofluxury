import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { computeAHashFromDataUrl, unsignedToSignedBigIntString } from "@/utils/imageHash";
import { sanitizeImageUrl } from "@/utils/imageUrlHelper";

// Client-side backfill: browser canvas does the decode/hash → zero edge CPU cost.
const BATCH_SIZE = 50;
const AUTO_DELAY_MS = 1500;
const AUTO_STORAGE_KEY = "imageHashBackfill.auto";

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
  const [auto, setAuto] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTO_STORAGE_KEY) === "1";
  });
  const [stats, setStats] = useState<{ success: number; failed: number; remaining: number; totalDone: number } | null>(null);
  const autoRef = useRef(auto);
  const totalDoneRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => { autoRef.current = auto; }, [auto]);

  const runBatch = async (silent = false): Promise<number> => {
    if (runningRef.current) return 0;
    runningRef.current = true;
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

      totalDoneRef.current += success;
      setStats({ success, failed, remaining: remaining ?? 0, totalDone: totalDoneRef.current });
      if (!silent) toast.success(`Hashed ${success}. ${remaining ?? 0} remaining.`);
      return rows?.length || 0;
    } catch (e: any) {
      toast.error(e.message || "Backfill failed");
      return 0;
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  };

  // Auto-run loop: keeps batching while auto is on and rows remain.
  useEffect(() => {
    if (!auto) return;
    let cancelled = false;
    let timer: number | undefined;

    const loop = async () => {
      while (!cancelled && autoRef.current) {
        const processed = await runBatch(true);
        if (cancelled || !autoRef.current) break;
        if (processed === 0) {
          toast.success("Image hash backfill complete.");
          setAuto(false);
          localStorage.setItem(AUTO_STORAGE_KEY, "0");
          break;
        }
        await new Promise<void>((r) => { timer = window.setTimeout(r, AUTO_DELAY_MS); });
      }
    };
    loop();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [auto]);

  const toggleAuto = (next: boolean) => {
    setAuto(next);
    localStorage.setItem(AUTO_STORAGE_KEY, next ? "1" : "0");
    if (next) totalDoneRef.current = 0;
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
                {auto ? `Auto-running · ${stats.totalDone} hashed this run · ` : "Last batch: "}
                {stats.success} hashed, {stats.failed} failed · {stats.remaining} remaining
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="auto-backfill" checked={auto} onCheckedChange={toggleAuto} />
            <Label htmlFor="auto-backfill" className="text-sm cursor-pointer">Auto</Label>
          </div>
          <Button onClick={() => runBatch(false)} disabled={running || auto}>
            {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Hashing…</> : `Run Batch (${BATCH_SIZE})`}
          </Button>
        </div>
      </div>
      {auto && (
        <p className="text-xs mt-3 text-muted-foreground">
          Auto mode keeps processing batches until all images are hashed. Keep this tab open.
        </p>
      )}
    </Card>
  );
};

export default ImageHashBackfillCard;
