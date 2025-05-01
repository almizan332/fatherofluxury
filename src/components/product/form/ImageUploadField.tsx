
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  multiple?: boolean;
  value?: string | string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadField = ({ id, label, multiple, value, onChange }: ImageUploadFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<string>("file");
  const { toast } = useToast();

  const handleUploadFromUrl = async () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const isVideo = imageUrl.match(/\.(mp4|webm|mov|avi|wmv)$/i);
      const fileType = isVideo ? 'video/mp4' : 'image/jpeg'; // Default type, server will try to detect actual type

      const { data, error } = await supabase.functions.invoke('do-file-upload', {
        body: { 
          url: imageUrl,
          fileType
        }
      });

      if (error) throw error;

      // Create a synthetic event to pass to the onChange handler
      const syntheticEvent = {
        target: {
          files: [
            new File([''], 'remote-file', {
              type: fileType,
            }),
          ],
        },
        preventDefault: () => {},
        currentTarget: {
          value: data.url,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Call the onChange handler with the synthetic event
      onChange(syntheticEvent);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      
      setImageUrl("");
    } catch (error: any) {
      console.error("Error uploading from URL:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image from URL",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      
      <Tabs defaultValue="file" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">Upload from URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="pt-2">
          <div className="flex items-center gap-2">
            <Input
              id={id}
              type="file"
              accept={multiple ? "image/*,video/*" : "image/*,video/*"}
              multiple={multiple}
              onChange={onChange}
              className="flex-1"
            />
            {value && !multiple && (
              <div className="w-12 h-12 rounded overflow-hidden">
                {typeof value === 'string' && value.match(/\.(mp4|webm|mov|avi|wmv)$/i) ? (
                  <video 
                    src={value as string}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={value as string}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input 
                placeholder="Enter image or video URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button"
                size="sm" 
                onClick={handleUploadFromUrl}
                disabled={isUploading || !imageUrl}
                className="flex items-center gap-1"
              >
                {isUploading ? "Uploading..." : (
                  <>
                    <Link className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {value.map((url, index) => (
            <div key={index} className="min-w-12 h-12 rounded overflow-hidden">
              {url.match(/\.(mp4|webm|mov|avi|wmv)$/i) ? (
                <video 
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
