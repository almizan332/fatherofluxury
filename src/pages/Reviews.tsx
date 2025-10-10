import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("reviews").insert([
      {
        user_name: formData.user_name,
        user_email: formData.user_email || null,
        review_text: formData.review_text,
        screenshot_url: formData.screenshot_url,
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Customer Reviews</h1>
            <p className="text-muted-foreground">See what our customers say</p>
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
                  <label className="text-sm font-medium">Image URL *</label>
                  <Input
                    required
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
                
                <Button type="submit" className="w-full">Submit Review</Button>
              </form>
            </DialogContent>
          </Dialog>
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
                          src={review.screenshot_url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <img
                        src={review.screenshot_url}
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
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">Be the first to submit a review!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
