
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";

const TemplateDownload = () => {
  const { toast } = useToast();

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Create CSV content with proper escaping
    const escapeCSVField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    // Create CSV rows
    const csvRows = [
      productExcelHeaders.map(escapeCSVField).join(','),
      ...sampleExcelData.map(row => [
        escapeCSVField(row['Product Name']),
        escapeCSVField(row['Flylink URL'] || ''),
        escapeCSVField(row['Alibaba URL'] || ''),
        escapeCSVField(row['DHgate URL'] || ''),
        escapeCSVField(row['Category']),
        escapeCSVField(row['Description']),
        escapeCSVField(row['Preview Image URL']),
        escapeCSVField(row['Gallery Image URLs (semicolon separated)'])
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
      description: "Fill in the template and import it back. Note: URLs can be left empty if not needed. Use semicolons (;) to separate multiple gallery image URLs.",
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
