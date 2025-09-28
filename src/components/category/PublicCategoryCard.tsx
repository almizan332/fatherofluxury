import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "./types";

interface PublicCategoryCardProps {
  category: Category;
}

const PublicCategoryCard = ({ category }: PublicCategoryCardProps) => {
  return (
    <Link to={`/category/${encodeURIComponent(category.name)}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-purple-300">
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80`}></div>
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
          </div>
          <div className="p-4 bg-gradient-to-br from-white to-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-300 line-clamp-1">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PublicCategoryCard;