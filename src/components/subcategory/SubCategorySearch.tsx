
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SubCategorySearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productCount: number;
  categoryName?: string;
}

export const SubCategorySearch = ({
  searchQuery,
  onSearchChange,
  productCount,
  categoryName
}: SubCategorySearchProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          {categoryName} Products
        </h1>
        <p className="text-muted-foreground mt-2">
          {productCount} products found
        </p>
      </div>

      <div className="relative w-full md:w-[300px]">
        <input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full bg-white/50 backdrop-blur-sm border border-purple-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
        />
        <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3">
          <Search className="h-4 w-4 text-purple-500" />
        </Button>
      </div>
    </div>
  );
};
