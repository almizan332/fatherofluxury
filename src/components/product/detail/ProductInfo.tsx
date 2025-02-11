
import { Button } from "@/components/ui/button";
import { MessageSquare, ShoppingCart, HelpCircle } from "lucide-react";
import { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-400 whitespace-pre-wrap">{product.description}</p>
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
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat With Us
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          size="lg"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          How To Buy
        </Button>
      </div>
    </div>
  );
};
