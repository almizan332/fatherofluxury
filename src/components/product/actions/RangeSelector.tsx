import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface RangeSelectorProps {
  totalProducts: number;
  onRangeSelect: (indices: number[]) => void;
}

const RangeSelector = ({ totalProducts, onRangeSelect }: RangeSelectorProps) => {
  const [rangeInput, setRangeInput] = useState("");
  const { toast } = useToast();

  const parseRange = (input: string): number[] => {
    const indices: number[] = [];
    const parts = input.split(",").map(p => p.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end)) continue;
        
        for (let i = Math.max(1, start); i <= Math.min(end, totalProducts); i++) {
          if (!indices.includes(i)) indices.push(i);
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= totalProducts && !indices.includes(num)) {
          indices.push(num);
        }
      }
    }

    return indices.sort((a, b) => a - b);
  };

  const handleSelect = () => {
    if (!rangeInput.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter a range (e.g., 1-500 or 1,5,10-20)",
        variant: "destructive",
      });
      return;
    }

    const indices = parseRange(rangeInput);
    
    if (indices.length === 0) {
      toast({
        title: "Invalid range",
        description: "Please enter a valid range (e.g., 1-500 or 1,5,10-20)",
        variant: "destructive",
      });
      return;
    }

    onRangeSelect(indices);
    toast({
      title: "Products selected",
      description: `${indices.length} products selected`,
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="e.g., 1-500 or 1,5,10-20"
        value={rangeInput}
        onChange={(e) => setRangeInput(e.target.value)}
        className="w-64"
      />
      <Button onClick={handleSelect} variant="outline">
        Select Range
      </Button>
    </div>
  );
};

export default RangeSelector;
