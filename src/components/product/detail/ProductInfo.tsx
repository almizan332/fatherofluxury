
import { Button } from "@/components/ui/button";
import { MessageSquare, ShoppingCart, HelpCircle, Store, Clock, Truck } from "lucide-react";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const [webContents, setWebContents] = useState<{
    how_to_buy_link?: string | null;
    chat_with_us_link?: string | null;
  } | null>(null);

  useEffect(() => {
    // Fetch web contents for links
    const fetchWebContents = async () => {
      const { data, error } = await supabase
        .from('web_contents')
        .select('how_to_buy_link, chat_with_us_link')
        .eq('id', 'default')
        .single();
      
      if (!error && data) {
        setWebContents(data);
      }
    };

    fetchWebContents();
  }, []);

  const handleButtonClick = (url?: string | null) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500 mb-1">
          {product.categories?.name || "Product"} / {product.name}
        </div>
        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
        <div className="text-gray-400 whitespace-pre-wrap mb-3">
          <p className="mb-4">{product.description}</p>
          
          {/* Additional product details based on the image */}
          <div className="space-y-2 text-sm">
            {product.name.includes("LV") && (
              <>
                <p>1:1 AAA Quality Shoe</p>
                <p>Upper material: Denim</p>
                <p>Insole material: Cowhide</p>
                <p>Rubber antiskid sole</p>
                <p>Packed in an original box</p>
                <p>Size: 34-41</p>
                <p>Code number: 103257</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* How to Order Section */}
      <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
        <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
          <Store size={18} /> How to Order
        </div>
        <ol className="list-decimal list-inside text-sm text-gray-700 pl-1 space-y-1">
          <li>Choose a Code from the Photo</li>
          <li>Select payment link and Size(if Needed)</li>
          <li>OR</li>
          <li>If you don't have a selection option, send "Code + Size(if Needed)" with a Message to the Seller.</li>
        </ol>
      </div>

      {/* Delivery Information */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
          <Clock size={18} /> Delivery Time
        </div>
        <div className="text-sm text-gray-700 pl-1 space-y-1">
          <p>• Order Processing: 3-5 working days</p>
          <p>• Delivery: 15-20 working days</p>
          <p className="flex items-center gap-1 mt-2">
            <Truck size={16} /> Track your parcel with the provided logistics tracking number at www.17track.net
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {/* Add new Flylink Button at the top */}
        <Button 
          className="w-full bg-purple-500 hover:bg-purple-600 h-12 text-base" 
          size="lg"
          onClick={() => handleButtonClick('https://flylink.io')}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy On Flylink
        </Button>

        {product.dhgate_url && (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 h-12 text-base" 
            size="lg"
            onClick={() => handleButtonClick(product.dhgate_url)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy On DHgate
          </Button>
        )}
        
        {product.alibaba_url && (
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base" 
            size="lg"
            onClick={() => handleButtonClick(product.alibaba_url)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy On Alibaba
          </Button>
        )}
        
        <Button 
          variant="secondary" 
          className="w-full h-12 text-base bg-emerald-100 hover:bg-emerald-200 text-emerald-800" 
          size="lg"
          onClick={() => handleButtonClick('https://wa.link/q2et60')}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full h-12 text-base" 
          size="lg"
          onClick={() => handleButtonClick(webContents?.chat_with_us_link)}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          Chat With Us
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full h-12 text-base" 
          size="lg"
          onClick={() => handleButtonClick(webContents?.how_to_buy_link)}
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          How To Buy
        </Button>
      </div>
    </div>
  );
};

