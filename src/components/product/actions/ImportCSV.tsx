import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Category } from "@/components/category/types";

interface ImportCSVProps {
  categories: Category[];
  onProductSave: () => void;
}

const ImportCSV = ({ categories, onProductSave }: ImportCSVProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      onClick={() => navigate('/admin/import')}
    >
      <Upload className="h-4 w-4 mr-2" />
      Import CSV
    </Button>
  );
};

export default ImportCSV;