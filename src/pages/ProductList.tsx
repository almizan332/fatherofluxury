
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, FileSpreadsheet, Download, Trash2, Edit } from "lucide-react";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/components/category/types";

interface Product {
  name: string;
  category: string;
  description: string;
  previewImage: string;
  galleryImages: string[];
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [editingProduct, setEditingProduct] = useState<{ index: number; product: Product } | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    category: "",
    description: "",
    previewImage: "",
    galleryImages: [],
  });

  // Add categories state
  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Smartphones",
      image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      gradient: "from-purple-500 to-pink-500",
      product_count: 156,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Laptops",
      image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      gradient: "from-blue-500 to-cyan-500",
      product_count: 89,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const { toast } = useToast();
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);

  const handlePreviewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setNewProduct({ ...newProduct, previewImage: imageUrl });
    }
  };

  const handleGalleryImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGalleryImageFiles(files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewProduct({ ...newProduct, galleryImages: imageUrls });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n');
          const headers = rows[0].split(',');
          const productsData: Product[] = [];

          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            const values = rows[i].split(',');
            if (values.length === headers.length) {
              const galleryImagesStr = values[4].trim();
              const galleryImages = galleryImagesStr ? galleryImagesStr.split(';').map(url => url.trim()) : [];
              
              productsData.push({
                name: values[0].trim(),
                category: values[1].trim(),
                description: values[2].trim(),
                previewImage: values[3].trim(),
                galleryImages
              });
            }
          }

          setProducts((prevProducts) => [...prevProducts, ...productsData]);
          toast({
            title: "File processed successfully",
            description: `Imported ${productsData.length} products`,
          });
        } catch (error) {
          toast({
            title: "Error processing file",
            description: "Please make sure the file format is correct",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadExcelTemplate = () => {
    const csvRows = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => [
        row['Product Name'],
        row['Category'],
        row['Description'],
        row['Preview Image URL'],
        row['Gallery Image URLs (comma separated)']
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((_, index) => index));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, index]);
    } else {
      setSelectedProducts(selectedProducts.filter(i => i !== index));
    }
  };

  const handleDeleteSelected = () => {
    const newProducts = products.filter((_, index) => !selectedProducts.includes(index));
    setProducts(newProducts);
    setSelectedProducts([]);
    toast({
      title: "Products deleted",
      description: `${selectedProducts.length} products have been deleted`,
    });
  };

  const handleEdit = (index: number) => {
    setEditingProduct({ index, product: { ...products[index] } });
    setNewProduct({ ...products[index] });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!newProduct.name || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in at least the product name and category",
        variant: "destructive",
      });
      return;
    }

    try {
      const productToSave = {
        ...newProduct,
      };

      if (editingProduct !== null) {
        const updatedProducts = [...products];
        updatedProducts[editingProduct.index] = productToSave;
        setProducts(updatedProducts);
        toast({
          title: "Product updated",
          description: "The product has been updated successfully",
        });
      } else {
        setProducts((prevProducts) => [...prevProducts, productToSave]);
        toast({
          title: "Product added",
          description: "The new product has been added successfully",
        });
      }
      
      setNewProduct({
        name: "",
        category: "",
        description: "",
        previewImage: "",
        galleryImages: [],
      });
      setPreviewImageFile(null);
      setGalleryImageFiles([]);
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the product. Please try again.",
        variant: "destructive",
      });
    }
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
          {selectedProducts.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingProduct(null);
                setNewProduct({
                  name: "",
                  category: "",
                  description: "",
                  previewImage: "",
                  galleryImages: [],
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="previewImage">Preview Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="previewImage"
                      type="file"
                      accept="image/*"
                      onChange={handlePreviewImageUpload}
                      className="flex-1"
                    />
                    {newProduct.previewImage && (
                      <img
                        src={newProduct.previewImage}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="galleryImages">Gallery Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="galleryImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesUpload}
                      className="flex-1"
                    />
                  </div>
                  {newProduct.galleryImages.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {newProduct.galleryImages.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  {editingProduct ? "Save Changes" : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedProducts.length === products.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Preview Image</TableHead>
                <TableHead>Gallery Images</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(index)}
                      onCheckedChange={(checked) => handleSelectProduct(index, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    {product.previewImage && (
                      <img 
                        src={product.previewImage} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {product.galleryImages.map((img, idx) => (
                        img && (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`${product.name} gallery ${idx + 1}`} 
                            className="w-12 h-12 object-cover rounded"
                          />
                        )
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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

