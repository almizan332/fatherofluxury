export const productExcelHeaders = [
  'Product Name',
  'Product Link',
  'Category',
  'Description',
  'Preview Image URL',
  'Gallery Image URLs (comma separated)'
];

export const sampleExcelData = [
  {
    'Product Name': 'LV Bag Classic',
    'Product Link': 'https://example.com/lv-bag',
    'Category': 'Bags',
    'Description': 'LV Bag 1:1 Good Quality Size: 26x19cm Material: Artificial leather',
    'Preview Image URL': 'https://example.com/images/lv-bag.jpg',
    'Gallery Image URLs (comma separated)': 'https://example.com/images/lv-1.jpg,https://example.com/images/lv-2.jpg'
  },
  {
    'Product Name': 'CC Wallet',
    'Product Link': 'https://example.com/cc-wallet',
    'Category': 'Wallets',
    'Description': 'CC Wallet Premium Quality Size: 19x10cm Material: Genuine leather',
    'Preview Image URL': 'https://example.com/images/cc-wallet.jpg',
    'Gallery Image URLs (comma separated)': 'https://example.com/images/cc-1.jpg,https://example.com/images/cc-2.jpg'
  }
];

export const generateExcelTemplate = () => {
  // This is a placeholder for actual Excel generation logic
  console.log('Excel template structure:', { headers: productExcelHeaders, sampleData: sampleExcelData });
  // In a real implementation, you would use a library like xlsx to generate the actual Excel file
};