import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SellerFilterProps {
  sellers: string[];
  selectedSeller: string;
  onSellerChange: (seller: string) => void;
  onDeleteAllBySeller: () => void;
}

const SellerFilter = ({ sellers, selectedSeller, onSellerChange, onDeleteAllBySeller }: SellerFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedSeller} onValueChange={onSellerChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by seller" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sellers</SelectItem>
          {sellers.map((seller) => (
            <SelectItem key={seller} value={seller}>
              {seller}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedSeller !== "all" && (
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDeleteAllBySeller}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All by {selectedSeller}
        </Button>
      )}
    </div>
  );
};

export default SellerFilter;
