
import ImageUploadField from "./ImageUploadField";
import { Product } from "@/types/product";

interface ProductImagesProps {
  product: Partial<Product>;
  onPreviewImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryImagesUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductImages = ({ product, onPreviewImageUpload, onGalleryImagesUpload }: ProductImagesProps) => {
  return (
    <div className="space-y-4">
      <ImageUploadField
        id="previewImage"
        label="Preview Image"
        value={product.preview_image}
        onChange={onPreviewImageUpload}
      />
      <ImageUploadField
        id="galleryImages"
        label="Gallery Images"
        multiple
        value={product.gallery_images}
        onChange={onGalleryImagesUpload}
      />
    </div>
  );
};

export default ProductImages;
