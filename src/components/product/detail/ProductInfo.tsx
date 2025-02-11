
import { Button } from "@/components/ui/button";
import { MessageSquare, ShoppingCart, HelpCircle } from "lucide-react";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  // Fetch web contents for the chat and how to buy links
  const { data: webContents } = useQuery({
    queryKey: ['webContents'],
    queryFn: async () => {
      const { data } = await supabase
        .from('web_contents')
        .select('*')
        .eq('id', 'default')
        .single();
      return data;
    },
  });

  const handleChatClick = () => {
    if (webContents?.chat_with_us_link) {
      window.open(webContents.chat_with_us_link, '_blank');
    }
  };

  const handleHowToBuyClick = () => {
    if (webContents?.how_to_buy_link) {
      window.open(webContents.how_to_buy_link, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <div className="space-y-4">
          {/* Shipping & Customer Assurance Section */}
          <div>
            <h2 className="text-lg font-semibold">Shipping & Customer Assurance</h2>
            <div className="text-gray-400 space-y-2">
              <p>
                <span className="font-medium">Delivery Time:</span> Orders are processed within 3-5 working days, and the product will be delivered to you within 15-20 working days.
              </p>
              <p>
                <span className="font-medium">Quality Assurance:</span><br />
                If there are quality issues with the product, please contact our customer service team. We will provide a free replacement to ensure your satisfaction. However, if there are any remaining defects, we guarantee a free refund or resend of the product.
              </p>
              <p>
                <span className="font-medium">Track Your Order:</span><br />
                Easily monitor your shipment's status by visiting https://www.17track.net.
              </p>
              <p>
                We are committed to providing you with a smooth shopping experience and top-quality service. Please feel free to reach out for any assistance!
              </p>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <h2 className="text-lg font-semibold">Product Description</h2>
            <p className="text-gray-400 whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {product.flylink_url && (
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600" 
            size="lg"
            onClick={() => window.open(product.flylink_url, '_blank')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy on Flylink
          </Button>
        )}
        
        {product.alibaba_url && (
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600" 
            size="lg"
            onClick={() => window.open(product.alibaba_url, '_blank')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy on Alibaba
          </Button>
        )}
        
        {product.dhgate_url && (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600" 
            size="lg"
            onClick={() => window.open(product.dhgate_url, '_blank')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy on DHgate
          </Button>
        )}
        
        <Button 
          variant="secondary" 
          className="w-full" 
          size="lg"
          onClick={handleChatClick}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat With Us
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          size="lg"
          onClick={handleHowToBuyClick}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          How To Buy
        </Button>
      </div>
    </div>
  );
};
