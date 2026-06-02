import { useState, useRef } from "react";
import { Search, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeImageUrl, FALLBACK_IMAGE_URL } from "@/utils/imageUrlHelper";
import { toast } from "sonner";

interface MatchResult {
  id: string;
  slug: string | null;
  product_name: string | null;
  first_image: string | null;
  distance: number;
  similarity: number;
}

const ImageSearchBar = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setOpen(true);
      setLoading(true);
      setResults(null);
      try {
        const { computeAHashFromDataUrl, unsignedToSignedBigIntString } = await import("@/utils/imageHash");
        const unsignedHash = await computeAHashFromDataUrl(base64);
        const signedHash = unsignedToSignedBigIntString(unsignedHash);
        const { data, error } = await supabase.rpc("search_products_by_image_hash", {
          _query_hash: signedHash as any,
          _limit: 12,
        });
        if (error) throw error;
        setResults((data as any) || []);
        if (!data || (data as any).length === 0) {
          toast.info("No matching product found. Try a clearer image.");
        }
      } catch (e: any) {
        toast.error(e.message || "Search failed");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-purple-200 flex items-center gap-2 justify-center sm:justify-start">
                <Search className="h-4 w-4" /> Search by Image
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload any product photo to find a matching album
              </p>
            </div>
            <Button
              onClick={() => inputRef.current?.click()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload Image
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Search Results</DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <img src={preview} alt="Uploaded product image preview" className="w-20 h-20 object-cover rounded" />
              <p className="text-sm text-muted-foreground">Your uploaded image</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
              <p className="mt-3 text-sm text-muted-foreground">Searching across all products…</p>
            </div>
          )}

          {!loading && results && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((r) => (
                <Link
                  key={r.id}
                  to={`/product/${r.id}`}
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  <Card className="overflow-hidden hover:border-purple-500 transition-colors">
                    <div className="aspect-square">
                      <img
                        src={sanitizeImageUrl(r.first_image || "") || FALLBACK_IMAGE_URL}
                        alt={r.product_name || ""}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE_URL)}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-2">{r.product_name}</p>
                      <p className="text-[10px] text-purple-300 mt-1">{r.similarity}% match</p>
                    </div>
                  </Card>
                </Link>
              ))}
              {results.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  No matches found.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageSearchBar;
