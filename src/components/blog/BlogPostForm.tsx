
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import ImageUploadField from "@/components/product/form/ImageUploadField";
import { useImageUpload } from "@/hooks/category/useImageUpload";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "./RichTextEditor";

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

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
    slug: initialData?.slug || "",
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
    const slug = formData.slug || generateSlug(formData.title);
    onSave({ ...formData, slug });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero Image Section */}
      <div className="space-y-3">
        <Label htmlFor="blogImage" className="text-lg font-semibold tracking-tight">Featured Image</Label>
        <ImageUploadField
          id="blogImage"
          label=""
          value={formData.image}
          onChange={handleImageChange}
        />
        {formData.image && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-[var(--shadow-elegant)]">
            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
      </div>

      {/* Title & Excerpt Section */}
      <div className="space-y-6 p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-lg font-semibold tracking-tight">Post Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter an captivating title..."
            className="text-xl font-bold border-border/50 focus:border-[hsl(var(--luxury-gold))] transition-colors"
            required
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="excerpt" className="text-lg font-semibold tracking-tight">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Write a compelling summary..."
            className="min-h-[100px] border-border/50 focus:border-[hsl(var(--luxury-gold))] transition-colors resize-none"
            required
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-3 p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-lg font-semibold tracking-tight">Article Content</Label>
          <span className="text-xs text-muted-foreground">Rich text editor - paste formatted content directly</span>
        </div>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
          placeholder="Write or paste your formatted content here..."
        />
        <p className="text-xs text-muted-foreground">
          💡 Tip: You can copy-paste formatted text from Word, Google Docs, or any website and formatting will be preserved.
        </p>
      </div>

      {/* SEO Section */}
      <div className="space-y-6 p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <span className="text-[hsl(var(--luxury-gold))]">✨</span>
          SEO Optimization
        </h3>
        
        <div className="space-y-3">
          <Label htmlFor="seo_title" className="text-sm font-medium">SEO Title</Label>
          <Input
            id="seo_title"
            value={formData.seo_title}
            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
            placeholder="Optimized title for search engines (60 characters max)"
            className="border-border/50 focus:border-[hsl(var(--luxury-gold))] transition-colors"
            maxLength={60}
            required
          />
          <p className="text-xs text-muted-foreground">{formData.seo_title.length}/60 characters</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="seo_description" className="text-sm font-medium">SEO Description</Label>
          <Textarea
            id="seo_description"
            value={formData.seo_description}
            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
            placeholder="Meta description for search results (160 characters max)"
            className="min-h-[80px] border-border/50 focus:border-[hsl(var(--luxury-gold))] transition-colors resize-none"
            maxLength={160}
            required
          />
          <p className="text-xs text-muted-foreground">{formData.seo_description.length}/160 characters</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="seo_keywords" className="text-sm font-medium">SEO Keywords</Label>
          <Input
            id="seo_keywords"
            value={formData.seo_keywords}
            onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
            placeholder="luxury, fashion, premium, exclusive..."
            className="border-border/50 focus:border-[hsl(var(--luxury-gold))] transition-colors"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-8 border-border/50 hover:bg-secondary/50"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="px-8 bg-gradient-to-r from-[hsl(var(--luxury-gold))] to-[hsl(var(--luxury-accent))] text-black font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-luxury)]"
        >
          {initialData ? 'Update' : 'Publish'} Post
        </Button>
      </div>
    </form>
  );
};

export default BlogPostForm;
