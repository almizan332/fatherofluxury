import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Upload, Star, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileToVPS } from "@/utils/vpsFileUpload";
import { sanitizeImageUrl } from "@/utils/imageUrlHelper";

interface Review {
  id: string;
  user_name: string;
  user_email: string;
  product_name: string;
  product_link: string;
  review_text: string;
  screenshot_url: string;
  rating: number;
  status: string;
  created_at: string;
}

const ReviewManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkData, setBulkData] = useState({
    product_name: "",
    screenshots: "",
    rating: 5,
    review_text: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Success", description: "Review status updated" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);
      
      // Handle file uploads
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        try {
          const result = await uploadFileToVPS(file);
          if (result?.url) {
            uploadedUrls.push(result.url);
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }

      // Handle URL inputs
      const urlsFromText = bulkData.screenshots
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const allUrls = [...uploadedUrls, ...urlsFromText];

      const reviews = allUrls.map((url) => ({
        product_name: bulkData.product_name,
        screenshot_url: url,
        rating: bulkData.rating,
        review_text: bulkData.review_text,
        status: "approved",
        user_name: "Admin",
      }));

      const { error } = await supabase.from("reviews").insert(reviews);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Success", description: "Bulk upload completed" });
      setBulkOpen(false);
      setBulkData({ product_name: "", screenshots: "", rating: 5, review_text: "" });
      setSelectedFiles([]);
      setIsUploading(false);
    },
    onError: () => {
      setIsUploading(false);
    },
  });

  const pending = reviews?.filter((r) => r.status === "pending") || [];
  const approved = reviews?.filter((r) => r.status === "approved") || [];
  const rejected = reviews?.filter((r) => r.status === "rejected") || [];

  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const ReviewCard = ({ review }: { review: Review }) => {
    const isVideo = isVideoUrl(review.screenshot_url);
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {isVideo ? (
              <div className="relative w-32 h-32 rounded overflow-hidden bg-black">
                <video
                  src={sanitizeImageUrl(review.screenshot_url)}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <img
                src={sanitizeImageUrl(review.screenshot_url)}
                alt={review.product_name}
                className="w-32 h-32 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{review.product_name}</h3>
              <div className="flex gap-1 my-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                by {review.user_name || "Anonymous"}
              </p>
              {review.review_text && (
                <p className="text-sm mb-2 line-clamp-2">{review.review_text}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {review.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: review.id, status: "approved" })}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ id: review.id, status: "rejected" })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review Management</h1>
        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bulk Upload Reviews</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={bulkData.product_name}
                  onChange={(e) => setBulkData({ ...bulkData, product_name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Upload Files (Images/Videos)</label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFiles.length} file(s) selected
                  </p>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Media URLs (one per line)</label>
                <Textarea
                  value={bulkData.screenshots}
                  onChange={(e) => setBulkData({ ...bulkData, screenshots: e.target.value })}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/video1.mp4"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Review Text</label>
                <Textarea
                  value={bulkData.review_text}
                  onChange={(e) => setBulkData({ ...bulkData, review_text: e.target.value })}
                  placeholder="Optional review text..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer ${
                        star <= bulkData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setBulkData({ ...bulkData, rating: star })}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={() => bulkUploadMutation.mutate()}
                disabled={
                  !bulkData.product_name || 
                  (selectedFiles.length === 0 && !bulkData.screenshots) ||
                  isUploading
                }
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending reviews</p>
          ) : (
            pending.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approved.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejected.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewManagement;
