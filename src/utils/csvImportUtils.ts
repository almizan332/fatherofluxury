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

export function validateProductRow(row: any, rowIndex: number): ProductValidationError[] {
  const errors: ProductValidationError[] = []
  
  if (!row['Product Name']?.trim()) {
    errors.push({ field: 'Product Name', message: 'Product name is required' })
  }
  
  // Validate URLs if present
  const flyLink = row['FlyLink']
  if (flyLink?.trim()) {
    const extractedUrl = extractUrlFromHtml(flyLink)
    if (!extractedUrl) {
      errors.push({ field: 'FlyLink', message: 'Invalid URL format' })
    }
  }
  
  const firstImage = row['First Image']
  if (firstImage?.trim()) {
    const extractedUrl = extractUrlFromHtml(firstImage)
    if (!extractedUrl) {
      errors.push({ field: 'First Image', message: 'Invalid image URL format' })
    }
  }
  
  return errors
}

/**
 * Transform CSV row to product data
 */
export interface ProductData {
  title: string
  slug: string
  description: string
  affiliate_link: string | null
  status: 'draft' | 'published'
  images: string[]
  thumbnail: string | null
}

export function transformCsvRowToProduct(
  row: any, 
  defaultStatus: 'draft' | 'published' = 'draft'
): ProductData {
  const title = row['Product Name']?.trim() || ''
  const slug = slugify(title)
  const description = row['Description']?.trim() || ''
  const affiliate_link = extractUrlFromHtml(row['FlyLink']?.trim() || '')
  const images = combineImages(row['First Image'] || '', row['Media Links'] || '')
  const thumbnail = images.length > 0 ? images[0] : null
  
  return {
    title,
    slug,
    description,
    affiliate_link,
    status: defaultStatus,
    images,
    thumbnail
  }
}

/**
 * Generate sample CSV content for download template
 */
export function generateSampleCsv(): string {
  const headers = ['Product Name', 'FlyLink', 'Description', 'First Image', 'Media Links']
  const sampleRows = [
    [
      'Premium Designer Handbag',
      'https://example-flylink.com/handbag-123',
      'Beautiful premium handbag with genuine leather construction',
      'https://example.com/images/handbag-main.jpg',
      'https://example.com/images/handbag-1.jpg;https://example.com/images/handbag-2.jpg;https://example.com/images/handbag-3.jpg'
    ],
    [
      'Luxury Watch Collection',
      '<a href="https://affiliate-link.com/watch">Buy Now</a>',
      'Swiss-made luxury timepiece with automatic movement',
      'https://example.com/images/watch-main.jpg',
      'https://example.com/images/watch-detail1.jpg,https://example.com/images/watch-detail2.jpg'
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