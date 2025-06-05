
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyProductState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-center mb-2">
        No Products Found
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Your product catalog is empty. Start by adding products manually or import them using our CSV template with your DigitalOcean Spaces image URLs.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" size="sm">
          Download CSV Template
        </Button>
        <Button size="sm">
          Add Your First Product
        </Button>
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Use DigitalOcean Spaces URLs like:<br />
          <code className="text-xs bg-white px-1 rounded">
            https://sgp1.digitaloceanspaces.com/fatherofluxury.com/yaya/PRODUCT_NAME/image.jpg
          </code>
        </p>
      </div>
    </div>
  );
};

export default EmptyProductState;
