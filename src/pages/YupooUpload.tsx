import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Upload, Video, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";

interface FetchResult {
  title: string;
  images: string[];
  videos: string[];
  sourceUrl: string;
}

const YupooUpload = () => {
  const { toast } = useToast();
  const { categories } = useCategories();

  const [yupooUrl, setYupooUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);

  // form fields for product
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [flylink, setFlylink] = useState("");
  const [alibabaUrl, setAlibabaUrl] = useState("");
  const [dhgateUrl, setDhgateUrl] = useState("");

  // password dialog
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [savePassword, setSavePassword] = useState(true);

  const callImport = async (pw?: string, save?: boolean, force?: boolean) => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("yupoo-import", {
        body: { url: yupooUrl, password: pw, savePassword: save ?? false, forcePassword: !!force },
      });
      if (error) throw error;

      if (data?.passwordRequired) {
        setPwDialogOpen(true);
        toast({
          title: "Password required",
          description: data.error || "This Yupoo album is password-protected.",
        });
        return;
      }
      if (data?.error) throw new Error(data.error);

      setResult(data as FetchResult);
      setProductName(data.title || "");
      setPwDialogOpen(false);
      setPassword("");
      toast({
        title: "Fetched successfully",
        description: `${data.images?.length || 0} images, ${data.videos?.length || 0} videos uploaded to storage.`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Failed to import",
        description: e.message || "Unable to fetch Yupoo album",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yupooUrl.trim()) {
      toast({ title: "Enter a Yupoo URL", variant: "destructive" });
      return;
    }
    setResult(null);
    await callImport();
  };

  const openPasswordManually = () => {
    if (!yupooUrl.trim()) {
      toast({ title: "Enter a Yupoo URL first", variant: "destructive" });
      return;
    }
    setPwDialogOpen(true);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      toast({ title: "Enter password", variant: "destructive" });
      return;
    }
    await callImport(password.trim(), savePassword, true);
  };

  const handlePublish = async () => {
    if (!result) return;
    if (!productName.trim()) {
      toast({ title: "Product name required", variant: "destructive" });
      return;
    }
    setIsPublishing(true);
    try {
      const allMedia = [...result.images, ...result.videos];
      const firstImage = result.images[0] || allMedia[0] || "";

      const slug = `${productName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)}-${Date.now().toString(36)}`;

      const { error } = await supabase.from("products").insert({
        product_name: productName.trim(),
        title: productName.trim(),
        slug,
        description: description.trim(),
        category: category || "Uncategorized",
        first_image: firstImage,
        thumbnail: firstImage,
        media_links: allMedia,
        flylink: flylink.trim() || null,
        alibaba_url: alibabaUrl.trim() || null,
        dhgate_url: dhgateUrl.trim() || null,
        status: "published",
      });
      if (error) throw error;

      toast({ title: "Published!", description: "Product is now live." });
      // reset
      setYupooUrl("");
      setResult(null);
      setProductName("");
      setDescription("");
      setFlylink("");
      setAlibabaUrl("");
      setDhgateUrl("");
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Failed to publish",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload from Yupoo</h1>
        <p className="text-muted-foreground">
          Paste a Yupoo album link — all images & videos will auto-download in full size and upload to your storage.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleFetch} className="space-y-4">
          <div>
            <Label htmlFor="yupooUrl">Yupoo Album URL</Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="yupooUrl"
                placeholder="https://xxx.x.yupoo.com/albums/123456789"
                value={yupooUrl}
                onChange={(e) => setYupooUrl(e.target.value)}
                disabled={isFetching}
              />
              <Button type="submit" disabled={isFetching} className="gap-2 min-w-[140px]">
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isFetching ? "Fetching..." : "Fetch Album"}
              </Button>
              <Button type="button" variant="outline" onClick={openPasswordManually} disabled={isFetching}>
                Enter Password
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Password-protected? Click "Enter Password" to provide it manually. Saved passwords are reused automatically.
            </p>
          </div>
        </form>
      </Card>

      {result && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Preview & Publish</h2>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><ImageIcon className="h-4 w-4" />{result.images.length}</span>
              <span className="flex items-center gap-1"><Video className="h-4 w-4" />{result.videos.length}</span>
            </div>
          </div>

          {/* Media preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
            {result.images.map((url, i) => (
              <img key={i} src={url} alt={`img-${i}`} className="aspect-square object-cover rounded border" loading="lazy" />
            ))}
            {result.videos.map((url, i) => (
              <video key={`v-${i}`} src={url} className="aspect-square object-cover rounded border" muted />
            ))}
          </div>

          {/* Form */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="pname">Product Name</Label>
              <Input id="pname" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="cat">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="cat"><SelectValue placeholder="Uncategorized" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fl">FlyLink URL</Label>
              <Input id="fl" value={flylink} onChange={(e) => setFlylink(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="ali">Alibaba URL</Label>
              <Input id="ali" value={alibabaUrl} onChange={(e) => setAlibabaUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="dh">DHgate URL</Label>
              <Input id="dh" value={dhgateUrl} onChange={(e) => setDhgateUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setResult(null)} disabled={isPublishing}>Cancel</Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="gap-2">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isPublishing ? "Publishing..." : "Publish Product"}
            </Button>
          </div>
        </Card>
      )}

      {/* Password Dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Album Password Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This Yupoo album is password-protected. Enter the password to continue.
            </p>
            <Input
              type="text"
              placeholder="Album password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="savepw"
                checked={savePassword}
                onCheckedChange={(c) => setSavePassword(c === true)}
              />
              <Label htmlFor="savepw" className="text-sm font-normal cursor-pointer">
                Save password for this album (won't ask again)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwDialogOpen(false)} disabled={isFetching}>Cancel</Button>
            <Button onClick={handlePasswordSubmit} disabled={isFetching} className="gap-2">
              {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YupooUpload;
