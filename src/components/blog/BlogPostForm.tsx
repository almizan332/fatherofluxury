
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import ImageUploadField from "@/components/product/form/ImageUploadField";
import { useImageUpload } from "@/hooks/category/useImageUpload";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

interface BlogPostFormProps {
  initialData: BlogPost | null;
  onSave: (data: Omit<BlogPost, 'id'>) => void;
  onCancel: () => void;
}

const BlogPostForm = ({ initialData, onSave, onCancel }: BlogPostFormProps) => {
  const { handleImageUpload } = useImageUpload();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'>>({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    image: initialData?.image || "",
    seo_title: initialData?.seo_title || "",
    seo_description: initialData?.seo_description || "",
    seo_keywords: initialData?.seo_keywords || ""
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = await handleImageUpload(e);
    if (imageUrl) {
      setFormData({ ...formData, image: imageUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <ImageUploadField
            id="blogImage"
            label="Blog Image"
            value={formData.image}
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_title">SEO Title</Label>
          <Input
            id="seo_title"
            value={formData.seo_title}
            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_description">SEO Description</Label>
          <Textarea
            id="seo_description"
            value={formData.seo_description}
            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_keywords">SEO Keywords</Label>
          <Input
            id="seo_keywords"
            value={formData.seo_keywords}
            onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
            placeholder="Comma-separated keywords"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Post
        </Button>
      </div>
    </form>
  );
};

export default BlogPostForm;
