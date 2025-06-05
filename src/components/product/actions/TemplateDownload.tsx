
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";

const TemplateDownload = () => {
  const { toast } = useToast();

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Create CSV content with proper tab separation
    const escapeCSVField = (field: string) => {
      // For tab-separated values, we need to handle tabs and quotes
      if (field.includes('\t') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    // Create header row with tabs
    const headerRow = productExcelHeaders.map(escapeCSVField).join('\t');
    
    // Create data rows with tabs
    const dataRows = sampleExcelData.map(row => [
      escapeCSVField(row['Product Name']),
      escapeCSVField(row['Flylinking URL'] || ''),
      escapeCSVField(row['Alibaba URL'] || ''),
      escapeCSVField(row['DHgate URL'] || ''),
      escapeCSVField(row['Category']),
      escapeCSVField(row['Description'] || ''),
      escapeCSVField(row['First Image']),
      escapeCSVField(row['Media Links'])
    ].join('\t'));

    // Combine header and data rows
    const csvContent = [headerRow, ...dataRows].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
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
      description: "Format: Product Name, Flylinking URL, Alibaba URL (optional), DHgate URL (optional), Category (required), Description (optional), First Image (required), Media Links (required - use semicolons to separate multiple URLs)",
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
