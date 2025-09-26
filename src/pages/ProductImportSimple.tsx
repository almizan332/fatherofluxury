import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Download, Upload, FileText, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { fixCsvFormat } from '@/utils/csvProcessor'

interface ImportResult {
  totalRows: number
  insertedCount: number
  skippedCount: number
  errors: string[]
}

const ProductImportSimple = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResults, setImportResults] = useState<ImportResult | null>(null)

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return

    if (!uploadedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      })
      return
    }

    setFile(uploadedFile)
    setImportResults(null)
  }

  // Download sample CSV template
  const downloadTemplate = () => {
    const headers = ['Product Name', 'FlyLink', 'Alibaba URL', 'DHgate URL', 'Category', 'Description', 'First Image', 'Media Links']
    const sampleRows = [
      [
        'Premium Designer Handbag',
        'https://example-flylink.com/handbag-123',
        'https://example-alibaba.com/handbag',
        'https://example-dhgate.com/handbag',
        'Fashion',
        'Beautiful premium handbag with genuine leather construction',
        'https://example.com/images/handbag-main.jpg',
        'https://example.com/images/handbag-1.jpg;https://example.com/images/handbag-2.jpg'
      ],
      [
        'Luxury Watch Collection',
        '',
        'https://example-alibaba.com/watch',
        '',
        'Accessories',
        '',
        'https://example.com/images/watch-main.jpg',
        'https://example.com/images/watch-detail1.jpg;https://example.com/images/watch-detail2.jpg'
      ]
    ]
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'product-import-template.csv'
    link.click()
    URL.revokeObjectURL(link.href)
    
    toast({
      title: 'Template downloaded',
      description: 'Use this template to format your product data'
    })
  }

  // Fix CSV format for multi-line issues
  const fixCsvFile = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to fix",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const correctedContent = fixCsvFormat(text);
      
      // Download the corrected file
      const blob = new Blob([correctedContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'corrected-' + file.name;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast({
        title: "CSV Fixed",
        description: "Downloaded corrected CSV file. Use this file for import.",
      });
    } catch (error) {
      console.error('CSV fix failed:', error);
      toast({
        title: "Fix Failed",
        description: "Could not fix the CSV file format",
        variant: "destructive",
      });
    }
  };

  // Perform import
  const performImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: result, error } = await supabase.functions.invoke('bulk-import-products', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Import failed');
      }

      if (!result) {
        throw new Error('No response from server');
      }

      setImportResults(result);
      
      if (result.insertedCount > 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.insertedCount} products`,
        });
      }

      if (result.errors && result.errors.length > 0) {
        toast({
          title: "Import Completed with Warnings",
          description: `${result.insertedCount} products imported, ${result.skippedCount} skipped`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred during import",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Bulk Product Import</h1>
            <p className="text-muted-foreground">Import products from CSV file with exact header order: Product Name, FlyLink, Alibaba URL, DHgate URL, Category, Description, First Image, Media Links</p>
          </div>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Upload a CSV file with your product data. Use the template below for proper formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              {file && (
                <Button variant="outline" onClick={fixCsvFile}>
                  <Settings className="h-4 w-4 mr-2" />
                  Fix CSV Format
                </Button>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="default">
                  <FileText className="h-4 w-4 mr-2" />
                  Choose CSV File
                </Button>
              </div>
            </div>
            {file && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  File loaded: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Controls */}
        {file && (
          <Card>
            <CardHeader>
              <CardTitle>Import Products</CardTitle>
              <CardDescription>Ready to import your products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={performImport}
                  disabled={isProcessing || !file}
                  className="min-w-[120px]"
                >
                  {isProcessing ? 'Processing...' : 'Import Products'}
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">Processing products...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResults && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Rows:</span>
                  <span className="font-medium">{importResults.totalRows || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Products Imported:</span>
                  <span className="font-medium text-green-600">{importResults.insertedCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skipped:</span>
                  <span className="font-medium text-yellow-600">{importResults.skippedCount || 0}</span>
                </div>
                
                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-600 mb-2">First 3 Errors:</h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-40 overflow-y-auto">
                      {importResults.errors.slice(0, 3).map((error, index) => (
                        <div key={index} className="text-sm text-red-700">{error}</div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.insertedCount > 0 && (
                  <div className="mt-4">
                    <Button onClick={() => navigate('/dashboard/products')}>
                      View Products
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProductImportSimple