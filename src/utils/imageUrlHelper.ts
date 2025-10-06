/**
 * Sanitizes and properly encodes image URLs for cross-browser compatibility
 * Handles DigitalOcean Spaces URLs with special characters
 */
export const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove quotes and trim
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Ensure URL starts with https
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  // For DigitalOcean Spaces URLs, properly encode the path
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    try {
      const urlObj = new URL(cleanUrl);
      
      // Split path into segments and encode each one properly
      // First decode to handle already-encoded URLs, then encode
      const pathSegments = urlObj.pathname.split('/').map(segment => {
        if (!segment) return segment;
        
        try {
          // Decode first to handle already-encoded segments
          const decoded = decodeURIComponent(segment);
          // Then encode properly
          return encodeURIComponent(decoded);
        } catch {
          // If decoding fails, just encode as-is
          return encodeURIComponent(segment);
        }
      });
      
      urlObj.pathname = pathSegments.join('/');
      return urlObj.toString();
    } catch (e) {
      console.error('Error encoding URL:', e);
      // Fallback: just replace spaces
      return cleanUrl.replace(/ /g, '%20');
    }
  }
  
  return cleanUrl;
};

/**
 * Default fallback image URL
 */
export const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80';
