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

const ProductList = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File uploaded",
        description: "Processing " + file.name,
      });
    }
  };

  const downloadExcelTemplate = () => {
    // Create CSV content
    const csvContent = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => 
        productExcelHeaders.map(header => row[header as keyof typeof row]).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

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
          <Button onClick={() => downloadExcelTemplate()}>
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
              accept=".xlsx,.xls,.csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import from Excel
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <Input placeholder="Enter product name" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Link
              </label>
              <Input placeholder="Enter product URL" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category1">Category 1</SelectItem>
                  <SelectItem value="category2">Category 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea placeholder="Enter product description" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Preview Image
              </label>
              <Card className="p-4 border-dashed">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop your image here or click to upload
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </Card>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Gallery Images
              </label>
              <Card className="p-4 border-dashed">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop your images here or click to upload
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>Save Product</Button>
        </div>
      </Card>
    </div>
  );
};

export default ProductList;