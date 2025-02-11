
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const YupooUpload = () => {
  const [yupooUrl, setYupooUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yupooUrl) {
      toast({
        title: "Error",
        description: "Please enter a Yupoo URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert the Yupoo URL as a draft
      const { data, error } = await supabase
        .from('yupoo_drafts')
        .insert([
          { 
            yupoo_url: yupooUrl,
            status: 'draft'
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Yupoo URL submitted successfully. Draft created.",
      });

      // Clear the form
      setYupooUrl("");
      
      // You can navigate to products list or stay on the same page
      // navigate('/dashboard/products');
    } catch (error: any) {
      console.error('Error submitting Yupoo URL:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit Yupoo URL",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Upload from Yupoo</h1>
          <p className="text-muted-foreground">Import products directly from Yupoo</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="yupooUrl" className="block text-sm font-medium mb-2">
              Yupoo URL
            </label>
            <div className="flex gap-4">
              <Input
                id="yupooUrl"
                placeholder="Enter Yupoo URL"
                value={yupooUrl}
                onChange={(e) => setYupooUrl(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Upload className="h-4 w-4" />
                {isSubmitting ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              How to use Yupoo import
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to your Yupoo product page</li>
              <li>Copy the URL from your browser's address bar</li>
              <li>Paste the URL in the input field above</li>
              <li>Click Import to create a draft product</li>
              <li>Edit the draft product to add affiliate links and other details</li>
              <li>Publish when ready</li>
            </ol>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default YupooUpload;
