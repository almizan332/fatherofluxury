
import { MediaType } from "@/types/product";

interface GalleryMediaDisplayProps {
  media: MediaType;
  productName: string;
  selectedIndex: number;
  isZoomed: boolean;
  zoomLevel: number;
  handleZoom: () => void;
}

// Helper function to sanitize and handle image URLs
const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any quotes that might be in the URL
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Fix DigitalOcean Spaces URL format - remove incorrect .com subdomain
  if (cleanUrl.includes('digitaloceanspaces.com')) {
    // Fix incorrect URL format: fatherofluxury.com.sgp1.digitaloceanspaces.com -> fatherofluxury.sgp1.digitaloceanspaces.com
    cleanUrl = cleanUrl.replace(/([^.]+)\.com\.([^.]+\.digitaloceanspaces\.com)/, '$1.$2');
    
    try {
      // Ensure proper URL encoding for special characters
      const urlObj = new URL(cleanUrl);
      // Reconstruct with properly encoded pathname
      cleanUrl = `${urlObj.protocol}//${urlObj.host}${encodeURI(urlObj.pathname)}${urlObj.search}${urlObj.hash}`;
    } catch (error) {
      console.log('URL parsing failed, using cleaned URL:', cleanUrl);
    }
  }
  
  return cleanUrl;
};

export const GalleryMediaDisplay = ({
  media,
  productName,
  selectedIndex,
  isZoomed,
  zoomLevel,
  handleZoom
}: GalleryMediaDisplayProps) => {
  if (!media || !media.url) {
    console.log('No media or URL provided:', media);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }
  
  const sanitizedUrl = sanitizeImageUrl(media.url);
  console.log('Displaying media:', { original: media.url, sanitized: sanitizedUrl, type: media.type });
  
  return (
    <div 
      className={`relative transition-transform duration-300 ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'} w-full h-full flex items-center justify-center`}
      style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: 'center'
      }}
      onClick={handleZoom}
    >
      {media.type === 'video' ? (
        <video
          src={sanitizedUrl}
          className="max-w-full max-h-full object-contain"
          controls
          autoPlay
          playsInline
          onError={(e) => {
            console.error('Video failed to load:', sanitizedUrl);
          }}
          onLoadStart={() => {
            console.log('Video started loading:', sanitizedUrl);
          }}
        />
      ) : (
        <img
          src={sanitizedUrl}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Image failed to load:', sanitizedUrl);
            console.error('Original URL:', media.url);
            // Show error state instead of hiding
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
            e.currentTarget.alt = 'Image failed to load';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', sanitizedUrl);
          }}
          onLoadStart={() => {
            console.log('Image started loading:', sanitizedUrl);
          }}
        />
      )}
    </div>
  );
};
