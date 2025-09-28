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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Purchase Options</h3>
      <div className="flex flex-wrap gap-3">
        {product.flylink && (
          <Button
            onClick={() => handleButtonClick(product.flylink)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy (FlyLink)
          </Button>
        )}
        {product.alibaba_url && (
          <Button
            onClick={() => handleButtonClick(product.alibaba_url)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy (Alibaba)
          </Button>
        )}
        {product.dhgate_url && (
          <Button
            onClick={() => handleButtonClick(product.dhgate_url)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy (DHgate)
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
  const youtubeHowToBuyUrl = "https://youtu.be/9xkFJeWaLEA?si=p6v2pqQjhEPGOGjt";

  const handleButtonClick = (url?: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
        <p className="text-sm text-muted-foreground mb-4">{product.category}</p>
        
        {product.description ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No description provided.</p>
        )}
      </div>

      <BuyButtons product={product} />

      {/* Additional Info Cards */}
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              How to Order
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on any purchase button above to be redirected to the seller's page. 
              Follow their ordering process to complete your purchase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Delivery Time</h3>
            <p className="text-sm text-muted-foreground">
              Delivery times vary by seller and location. Please check with the seller for specific delivery estimates.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => handleButtonClick(whatsappUrl)}
          className="border-green-500 text-green-600 hover:bg-green-50"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>

        <Button
          variant="outline"
          onClick={() => handleButtonClick(webContents?.chat_with_us_link)}
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with Us
        </Button>

        <Button
          variant="outline"
          onClick={() => handleButtonClick(youtubeHowToBuyUrl)}
          className="border-red-500 text-red-600 hover:bg-red-50"
        >
          <Youtube className="w-4 h-4 mr-2" />
          How to Buy
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;