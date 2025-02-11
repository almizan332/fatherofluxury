
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  multiple?: boolean;
  value?: string | string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadField = ({ id, label, multiple, value, onChange }: ImageUploadFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={onChange}
          className="flex-1"
        />
        {value && !multiple && (
          <img
            src={value as string}
            alt="Preview"
            className="w-12 h-12 object-cover rounded"
          />
        )}
      </div>
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {value.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Gallery ${index + 1}`}
              className="w-12 h-12 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
