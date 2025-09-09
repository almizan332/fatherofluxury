import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { ArrowLeft, Download, Upload, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { transformCsvRowToProduct, validateProductRow, generateSampleCsv, type ProductData, type ProductValidationError } from '@/utils/csvImportUtils'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ValidationResult {
  rowIndex: number
  errors: ProductValidationError[]
  warnings: ProductValidationError[]
}

interface ImportResult {
  created: number
  updated: number
  failed: number
  errors: Array<{ rowIndex: number; reason: string }>
}

const ProductImport = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [parsedProducts, setParsedProducts] = useState<ProductData[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [publishOnImport, setPublishOnImport] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // Handle file upload and parsing
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Parse CSV file
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parsed CSV:', results)
        setCsvData(results.data as any[])
        
        if (results.errors.length > 0) {
          toast({
            title: 'CSV parsing errors',
            description: `${results.errors.length} errors found while parsing`,
            variant: 'destructive'
          })
        }
        
        // Validate and transform data
        validateAndTransformData(results.data as any[])
      },
      error: (error) => {
        toast({
          title: 'Failed to parse CSV',
          description: error.message,
          variant: 'destructive'
        })
      }
    })
  }, [toast])

  // Validate and transform CSV data
  const validateAndTransformData = useCallback((data: any[]) => {
    const validationResults: ValidationResult[] = []
    const products: ProductData[] = []
    
    data.forEach((row, index) => {
      const errors = validateProductRow(row, index)
      const warnings: ProductValidationError[] = []
      
      // Check for warnings (non-blocking issues)
      if (!row['FlyLink']?.trim()) {
        warnings.push({ field: 'FlyLink', message: 'No affiliate link provided' })
      }
      if (!row['First Image']?.trim() && !row['Media Links']?.trim()) {
        warnings.push({ field: 'Images', message: 'No images provided' })
      }
      
      validationResults.push({ rowIndex: index, errors, warnings })
      
      // Transform valid rows
      if (errors.length === 0) {
        const product = transformCsvRowToProduct(row)
        products.push(product)
      }
    })
    
    setValidationResults(validationResults)
    setParsedProducts(products)
    
    const errorCount = validationResults.filter(r => r.errors.length > 0).length
    const warningCount = validationResults.filter(r => r.warnings.length > 0).length
    
    toast({
      title: 'CSV processed',
      description: `${products.length} valid products, ${errorCount} errors, ${warningCount} warnings`
    })
  }, [publishOnImport, toast])

  // Download sample CSV template
  const downloadTemplate = useCallback(() => {
    const csvContent = generateSampleCsv()
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
  }, [toast])

  // Perform import
  const performImport = useCallback(async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true)
    setProgress(0)
    setImportResult(null)

    try {
      const formData = new FormData();
      formData.append('file', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      setImportResult({
        created: result.insertedCount || 0,
        updated: 0,
        failed: result.skippedCount || 0,
        errors: result.errors ? result.errors.map((error: string, index: number) => ({ 
          rowIndex: index, 
          reason: error 
        })) : []
      });
      setProgress(100);
      
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
      if (error.name === 'AbortError') {
        toast({
          title: "Import Timeout",
          description: "Import took too long and was cancelled. Try with a smaller file.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Failed",
          description: error.message || "An error occurred during import",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }, [file, toast])

  const errorRows = validationResults.filter(r => r.errors.length > 0)
  const warningRows = validationResults.filter(r => r.warnings.length > 0)
  const validRows = validationResults.filter(r => r.errors.length === 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Bulk Product Import</h1>
            <p className="text-muted-foreground">Import products from CSV file</p>
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

        {/* Validation Results */}
        {csvData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
              <CardDescription>
                Review data validation before importing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{validRows.length} Valid</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{warningRows.length} Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">{errorRows.length} Errors</span>
                </div>
              </div>

              {/* Show first few rows with issues */}
              {(errorRows.length > 0 || warningRows.length > 0) && (
                <ScrollArea className="h-[300px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...errorRows, ...warningRows].slice(0, 50).map((result) => (
                        <TableRow key={result.rowIndex}>
                          <TableCell>{result.rowIndex + 1}</TableCell>
                          <TableCell>{csvData[result.rowIndex]?.['Product Name'] || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {result.errors.map((error, idx) => (
                                <Badge key={idx} variant="destructive" className="mr-1">
                                  {error.field}: {error.message}
                                </Badge>
                              ))}
                              {result.warnings.map((warning, idx) => (
                                <Badge key={idx} variant="secondary" className="mr-1">
                                  {warning.field}: {warning.message}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import Controls */}
        {parsedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>Configure your import options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish-on-import"
                  checked={publishOnImport}
                  onCheckedChange={setPublishOnImport}
                />
                <label htmlFor="publish-on-import" className="font-medium">
                  Import as published (default: draft)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dry-run"
                  checked={dryRun}
                  onCheckedChange={(checked) => setDryRun(checked === true)}
                />
                <label htmlFor="dry-run" className="font-medium">
                  Dry run (validate only, don't save to database)
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={performImport}
                  disabled={isProcessing || !file}
                  className="min-w-[120px]"
                >
                  {isProcessing ? 'Processing...' : 'Import Products'}
                </Button>
                
                {parsedProducts.length > 0 && (
                  <Badge variant="outline">
                    {parsedProducts.length} products ready
                  </Badge>
                )}
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
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                {dryRun ? 'Validation results' : 'Import completed successfully'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.created}</div>
                  <div className="text-sm text-green-600">Created</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.updated}</div>
                  <div className="text-sm text-blue-600">Updated</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <ScrollArea className="h-[200px] border rounded-md p-4">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="mb-2 p-2 bg-red-50 rounded text-sm">
                        <strong>Row {error.rowIndex + 1}:</strong> {error.reason}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {!dryRun && importResult.created + importResult.updated > 0 && (
                <div className="mt-4">
                  <Button onClick={() => navigate('/dashboard/products')}>
                    View Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProductImport