
import { Button } from "@/components/ui/button";
import { MessageSquare, ShoppingCart, HelpCircle, Store, Clock, Truck, AlertCircle } from "lucide-react";
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
        <div className="text-gray-700 whitespace-pre-wrap mb-3">
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
          onClick={() => handleButtonClick('https://wa.me/your_whatsapp_number')}
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

      {/* Discord information */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
          Our Discord Channel
        </div>
        <div className="text-sm text-gray-700">
          <a href="https://discord.gg/F4PUYV9RB" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            https://discord.gg/F4PUYV9RB
          </a>
        </div>
      </div>

      {/* Yupoo link */}
      <div className="text-sm text-gray-700">
        <a href="https://yupoall.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          More Items at yupoall.com
        </a>
      </div>
    </div>
  );
};
