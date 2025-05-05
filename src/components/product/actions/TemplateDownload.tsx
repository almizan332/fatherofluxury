
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { productExcelHeaders, sampleExcelData } from "@/utils/excelTemplate";

const TemplateDownload = () => {
  const { toast } = useToast();

  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const csvRows = [
      productExcelHeaders.join(','),
      ...sampleExcelData.map(row => [
        row['Product Name'],
        row['Flylink URL'],
        row['Alibaba URL'],
        row['DHgate URL'],
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

  return (
    <Button onClick={downloadExcelTemplate} variant="outline" className="bg-white/50">
      <Download className="h-4 w-4 mr-2" />
      Template
    </Button>
  );
};

export default TemplateDownload;
