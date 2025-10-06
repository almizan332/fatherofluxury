import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MessageCircle, ShoppingCart, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

function BuyButtons({ product }: { product: Product }) {
  const handleButtonClick = (url?: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasAnyUrl = product.flylink || product.alibaba_url || product.dhgate_url;

  if (!hasAnyUrl) {
    return null;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Purchase Options</h3>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
        {product.flylink && (
          <Button
            onClick={() => handleButtonClick(product.flylink)}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl active:scale-95 md:hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Buy via FlyLink
          </Button>
        )}
        {product.alibaba_url && (
          <Button
            onClick={() => handleButtonClick(product.alibaba_url)}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl active:scale-95 md:hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Buy via Alibaba
          </Button>
        )}
        {product.dhgate_url && (
          <Button
            onClick={() => handleButtonClick(product.dhgate_url)}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl active:scale-95 md:hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Buy via DHgate
          </Button>
        )}
      </div>
    </div>
  );
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [webContents, setWebContents] = useState<any>(null);

  useEffect(() => {
    const fetchWebContents = async () => {
      const { data } = await supabase.from('web_contents').select('*').single();
      setWebContents(data);
    };
    fetchWebContents();
  }, []);

  const whatsappUrl = "https://wa.me/8801609966905";
  const youtubeHowToBuyUrl = "https://youtube.com/watch?v=I-5asuZ1d4U&feature=youtu.be";

  const handleButtonClick = (url?: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Product Header with Glass Effect */}
      <div className="space-y-3 md:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
          {product.category ? (
            <span className="text-xs md:text-sm font-medium text-primary">{product.category}</span>
          ) : (
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Uncategorized</span>
          )}
        </div>
        
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text leading-tight">
          {product.product_name}
        </h1>
        
        {product.description ? (
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        ) : (
          <p className="text-sm md:text-base text-muted-foreground italic">No description provided.</p>
        )}
      </div>

      <BuyButtons product={product} />

      {/* Additional Info Cards with Modern Glass Effect */}
      <div className="grid gap-4">
        <Card className="border-primary/10 bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              How to Order
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click on any purchase button above to be redirected to the seller's page. 
              Follow their ordering process to complete your purchase.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/10 bg-gradient-to-br from-background to-blue-500/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </div>
              Delivery Time
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Delivery times vary by seller and location. Please check with the seller for specific delivery estimates.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons with Better Design */}
      <div className="space-y-3">
        <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Need Help?</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => handleButtonClick(whatsappUrl)}
            className="w-full sm:w-auto group border-green-500/50 text-green-600 hover:bg-green-500 hover:text-white transition-all duration-300 active:scale-95 md:hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            onClick={() => handleButtonClick(webContents?.chat_with_us_link)}
            className="w-full sm:w-auto group border-blue-500/50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-95 md:hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Chat with Us
          </Button>

          <Button
            variant="outline"
            onClick={() => handleButtonClick(youtubeHowToBuyUrl)}
            className="w-full sm:w-auto group border-red-500/50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95 md:hover:scale-105"
          >
            <Youtube className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            How to Buy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;