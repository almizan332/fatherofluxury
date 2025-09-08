/**
 * Utility functions for CSV product import
 */

/**
 * Generate a URL-safe slug from a title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Extract pure URL from HTML anchor tags or return as-is if already a URL
 */
export function extractUrlFromHtml(input: string): string | null {
  if (!input?.trim()) return null
  
  const trimmed = input.trim()
  
  // If it's already a URL, return it
  if (trimmed.match(/^https?:\/\//)) {
    return trimmed
  }
  
  // Try to extract from HTML anchor tag
  const hrefMatch = trimmed.match(/href=["']([^"']+)["']/i)
  if (hrefMatch) {
    return hrefMatch[1]
  }
  
  // If it looks like a URL without protocol, add https
  if (trimmed.match(/^[\w.-]+\.[a-z]{2,}/i)) {
    return `https://${trimmed}`
  }
  
  return null
}

/**
 * Parse media links string into array of valid URLs
 * Handles semicolon, comma, and newline separators
 */
export function parseMediaLinks(input: string): string[] {
  if (!input?.trim()) return []
  
  // Split by semicolon, comma, or newline
  const urls = input
    .split(/[;\n,]+/)
    .map(url => url.trim())
    .filter(url => url.length > 0)
    .map(url => {
      // Ensure URL has protocol
      if (url.match(/^https?:\/\//)) {
        return url
      } else if (url.match(/^[\w.-]+\.[a-z]{2,}/i)) {
        return `https://${url}`
      }
      return url
    })
    .filter(url => url.match(/^https?:\/\//)) // Only keep valid HTTP(S) URLs
  
  // Remove duplicates while preserving order
  return Array.from(new Set(urls))
}

/**
 * Combine and deduplicate images from first image and media links
 */
export function combineImages(firstImage: string, mediaLinks: string): string[] {
  const images: string[] = []
  
  // Add first image if valid
  const firstUrl = extractUrlFromHtml(firstImage)
  if (firstUrl && firstUrl.match(/^https?:\/\//)) {
    images.push(firstUrl)
  }
  
  // Add media links
  const mediaUrls = parseMediaLinks(mediaLinks)
  
  // Combine and deduplicate while preserving order
  const combined = [...images, ...mediaUrls]
  return Array.from(new Set(combined))
}

/**
 * Validate a single product row from CSV
 */
export interface ProductValidationError {
  field: string
  message: string
}

/**
 * Helper function to convert empty string to null
 */
function toNull(s?: string): string | null {
  const trimmed = (s ?? '').trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Parse media links string into array of URLs separated by semicolon
 */
function parseMediaLinksToArray(input?: string): string[] | null {
  if (!input?.trim()) return null;
  return input.split(';').map(s => s.trim()).filter(Boolean);
}

export function validateProductRow(row: any, rowIndex: number): ProductValidationError[] {
  const errors: ProductValidationError[] = []
  
  if (!row['Product Name']?.trim()) {
    errors.push({ field: 'Product Name', message: 'Product name is required' })
  }
  
  if (!row['Category']?.trim()) {
    errors.push({ field: 'Category', message: 'Category is required' })
  }
  
  if (!row['First Image']?.trim()) {
    errors.push({ field: 'First Image', message: 'First image is required' })
  }
  
  return errors
}

/**
 * Transform CSV row to product data
 */
export interface ProductData {
  product_name: string
  flylink: string | null
  alibaba_url: string | null
  dhgate_url: string | null
  category: string
  description: string | null
  first_image: string
  media_links: string[] | null
}

export function transformCsvRowToProduct(row: any): ProductData {
  return {
    product_name: row['Product Name'].trim(),
    flylink: toNull(row['FlyLink']),
    alibaba_url: toNull(row['Alibaba URL']),
    dhgate_url: toNull(row['DHgate URL']),
    category: row['Category'].trim(),
    description: toNull(row['Description']),
    first_image: row['First Image'].trim(),
    media_links: parseMediaLinksToArray(row['Media Links'])
  }
}

/**
 * Generate sample CSV content for download template
 */
export function generateSampleCsv(): string {
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
  
  return csvContent
}