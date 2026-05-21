import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ImageHashBackfillCard = () => {
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<{ processed: number; success: number; failed: number; remaining: number } | null>(null);

  const runBatch = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("image-search", {
        body: { action: "backfill", limit: 200 },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStats(data as any);
      toast.success(`Hashed ${(data as any).success} images. ${(data as any).remaining} remaining.`);
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
                Last batch: {stats.success} hashed, {stats.failed} failed · {stats.remaining} products remaining
              </p>
            )}
          </div>
        </div>
        <Button onClick={runBatch} disabled={running}>
          {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Hashing…</> : "Run Backfill (200)"}
        </Button>
      </div>
    </Card>
  );
};

export default ImageHashBackfillCard;
