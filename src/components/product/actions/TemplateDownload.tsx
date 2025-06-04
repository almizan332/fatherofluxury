
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";

const TemplateDownload = () => {
  const { toast } = useToast();

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Create CSV content with proper escaping for tab-separated format
    const escapeCSVField = (field: string) => {
      if (field.includes('\t') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    // Create CSV rows using tab separation
    const csvRows = [
      productExcelHeaders.map(escapeCSVField).join('\t'),
      ...sampleExcelData.map(row => [
        escapeCSVField(row['Product Name']),
        escapeCSVField(row['Flylinking URL'] || ''),
        escapeCSVField(row['Alibaba URL'] || ''),
        escapeCSVField(row['DHgate URL'] || ''),
        escapeCSVField(row['Category']),
        escapeCSVField(row['Description'] || ''),
        escapeCSVField(row['First Image']),
        escapeCSVField(row['Media Links'])
      ].join('\t'))
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
      title: "Template downloaded successfully",
      description: "Required: Product Name, Flylinking URL, Category, First Image, Media Links. Optional: Alibaba URL, DHgate URL, Description. Use semicolons (;) to separate multiple media links.",
    });
  };

  return (
    <Button onClick={downloadExcelTemplate} variant="outline" className="bg-white/50">
      <Download className="h-4 w-4 mr-2" />
      Template
    </Button>
  );
};

export default TemplateDownload;
