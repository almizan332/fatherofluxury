
import { Card } from "@/components/ui/card";
import { Boxes } from "lucide-react";

interface CategoryItem {
  id: string | number;
  name: string;
  product_count?: number;
}

interface CategoriesOverviewProps {
  categories: CategoryItem[];
}

const CategoriesOverview = ({ categories }: CategoriesOverviewProps) => {
  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Categories Overview</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Boxes className="h-5 w-5 text-muted-foreground" />
              <span>{category.name}</span>
            </div>
            <span className="font-semibold">{category.product_count || 0} products</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CategoriesOverview;
