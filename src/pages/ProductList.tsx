import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, FileSpreadsheet, Download } from "lucide-react";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  name: string;
  link: string;
  category: string;
  description: string;
  previewImage: string;
  galleryImages: string[];
}

const ProductList = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        const productsData: Product[] = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',');
          if (values.length === headers.length) {
            productsData.push({
              name: values[0],
              link: values[1],
              category: values[2],
              description: values[3],
              previewImage: values[4],
              galleryImages: values[5].split(';')
            });
          }
        }

        setProducts(productsData);
        toast({
          title: "File processed successfully",
          description: `Imported ${productsData.length} products`,
        });
      };
      reader.readAsText(file);
    }
  };

  const downloadExcelTemplate = () => {
    const csvRows = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => [
        row['Product Name'],
        row['Product Link'],
        row['Category'],
        row['Description'],
        row['Preview Image URL'],
        row['Gallery Image URLs (comma separated)']
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "You can now fill in the template and import it back",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex gap-2">
          <Button onClick={downloadExcelTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import from CSV
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6">
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Preview Image</TableHead>
                <TableHead>Gallery Images</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.link}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    <img 
                      src={product.previewImage} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {product.galleryImages.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`${product.name} gallery ${idx + 1}`} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No products imported yet. Download the template and import your products.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductList;