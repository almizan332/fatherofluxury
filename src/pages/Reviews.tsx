import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, Upload, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sanitizeImageUrl } from "@/utils/imageUrlHelper";
import { uploadFileToVPS } from "@/utils/vpsFileUpload";
import SEO from "@/components/SEO";
import burberryChat from "@/assets/review-burberry-chat.png.asset.json";
import pradaChat from "@/assets/review-prada-chat.png.asset.json";
import gucciChat from "@/assets/review-gucci-chat.png.asset.json";
import amiriChat from "@/assets/review-amiri-chat.png.asset.json";
import balenciagaChat from "@/assets/review-balenciaga-chat.png.asset.json";
import saintLaurentChat from "@/assets/review-saint-laurent-chat.png.asset.json";
import lvWalletChat from "@/assets/review-lv-wallet-chat.png.asset.json";
import heronChat from "@/assets/review-heron-chat.png.asset.json";

interface Review {
  id: string;
  user_name: string;
  product_name: string;
  product_link: string;
  review_text: string;
  screenshot_url: string;
  rating: number;
  created_at: string;
}

const featuredChatReviews = [
  {
    id: "chat-burberry",
    buyer: "Verified buyer A",
    product: "Burberry hoodie",
    image: burberryChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Burberry hoodie order",
    quote: "Customer said the hoodie felt premium, the packaging was 10/10, and the fit was perfect.",
  },
  {
    id: "chat-prada",
    buyer: "Verified buyer B",
    product: "Prada hoodie",
    image: pradaChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Prada hoodie order",
    quote: "Customer reported the package arrived safely, praised the quality, and said the fit was perfect.",
  },
  {
    id: "chat-gucci",
    buyer: "Verified buyer C",
    product: "Gucci hoodie",
    image: gucciChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Gucci hoodie order",
    quote: "Customer called the quality insane, said it felt worth it, and thanked the seller after receiving it.",
  },
  {
    id: "chat-amiri",
    buyer: "Verified buyer D",
    product: "Amiri hoodie",
    image: amiriChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for an Amiri hoodie order",
    quote: "Customer said the quality was crazy good, the fit was perfect, and they were very happy with the order.",
  },
  {
    id: "chat-balenciaga",
    buyer: "Verified buyer E",
    product: "Balenciaga hoodie",
    image: balenciagaChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Balenciaga hoodie order",
    quote: "Customer shared that the hoodie arrived that day and described the quality as insane.",
  },
  {
    id: "chat-saint-laurent",
    buyer: "Verified buyer F",
    product: "Saint Laurent hoodie",
    image: saintLaurentChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Saint Laurent hoodie order",
    quote: "Customer confirmed the package was received and said they were really satisfied with the quality.",
  },
  {
    id: "chat-lv-wallet",
    buyer: "Verified buyer G",
    product: "Louis Vuitton wallet",
    image: lvWalletChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Louis Vuitton wallet order",
    quote: "Customer said the wallet was perfect, loved it, and thanked the seller right after receiving the package.",
  },
  {
    id: "chat-heron",
    buyer: "Verified buyer H",
    product: "Heron hoodie",
    image: heronChat.url,
    alt: "Anonymized customer chat screenshot showing feedback for a Heron hoodie order",
    quote: "Customer said the item arrived and described it as very nice in the shared chat proof.",
  },
];

const Reviews = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    review_text: "",
    screenshot_url: "",
    rating: 5,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let uploadedUrl = formData.screenshot_url;

    if (selectedFile) {
      try {
        const result = await uploadFileToVPS(selectedFile);
        if (result?.url) {
          uploadedUrl = result.url;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
    }

    if (!uploadedUrl) {
      toast({
        title: "Error",
        description: "Please upload an image or provide a URL",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        user_name: formData.user_name,
        user_email: formData.user_email || null,
        review_text: formData.review_text,
        screenshot_url: uploadedUrl,
        rating: formData.rating,
        product_name: "Customer Review",
        status: "pending",
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Review submitted! It will appear after admin approval.",
    });

    setOpen(false);
    setFormData({
      user_name: "",
      user_email: "",
      review_text: "",
      screenshot_url: "",
      rating: 5,
    });
    setSelectedFile(null);
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Customer Reviews — FlyLink Hidden Links & Yupoo"
        description="Real customer reviews of FlyLink hidden links and Yupoo replica purchases. See photos, ratings, and seller experiences from verified buyers."
        canonical="/reviews"
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-2">Customer Reviews</h1>
            <p className="text-muted-foreground">Real buyer feedback, shared photos, and chat proof from recent orders.</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Submit Your Review</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Name *</label>
                  <Input
                    required
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email (optional)</label>
                  <Input
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Upload Photo/Video *</label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {selectedFile.name}
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
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={formData.screenshot_url}
                    onChange={(e) => setFormData({ ...formData, screenshot_url: e.target.value })}
                    placeholder="https://example.com/your-image.jpg"
                    type="url"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rating *</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        role="button"
                        tabIndex={0}
                        aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setFormData({ ...formData, rating: star })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Your Review *</label>
                  <Textarea
                    required
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    placeholder="Share your experience..."
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <section className="mb-12 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold">Customer chat proof</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                These are anonymized screenshots shared by buyers. Each caption summarizes what is visible in the chat instead of adding made-up testimonials.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Anonymized real screenshots
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredChatReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={review.image}
                    alt={review.alt}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{review.product}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{review.buyer}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-6">{review.quote}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">More approved reviews</h2>
            <p className="text-sm text-muted-foreground mt-1">Public reviews approved from customer submissions.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-48 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => {
                const isVideo = isVideoUrl(review.screenshot_url);

                return (
                  <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {isVideo ? (
                        <div className="relative w-full h-64 bg-black">
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
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{review.product_name}</h3>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {review.review_text}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          by {review.user_name || "Anonymous"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No approved reviews yet</h3>
              <p className="text-muted-foreground">Be the first to submit a review!</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;

