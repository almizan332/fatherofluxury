
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WebContent {
  how_to_buy_link: string | null;
  chat_with_us_link: string | null;
  how_to_buy_content: string | null;
}

const WebContentsManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [webContents, setWebContents] = useState<WebContent>({
    how_to_buy_link: "",
    chat_with_us_link: "",
    how_to_buy_content: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWebContents = async () => {
      try {
        const { data, error } = await supabase
          .from('web_contents')
          .select('*')
          .eq('id', 'default')
          .single();

        if (error) throw error;

        if (data) {
          setWebContents({
            how_to_buy_link: data.how_to_buy_link || "",
            chat_with_us_link: data.chat_with_us_link || "",
            how_to_buy_content: data.how_to_buy_content || "",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load website contents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebContents();
  }, [toast]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('web_contents')
        .upsert({
          id: 'default',
          how_to_buy_link: webContents.how_to_buy_link || null,
          chat_with_us_link: webContents.chat_with_us_link || null,
          how_to_buy_content: webContents.how_to_buy_content || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Website contents updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* Sidebar content will be inherited from Dashboard */}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Website Contents Management</h1>
            </div>
          </div>

          <Card className="p-6">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="howToBuyLink">How to Buy Link</Label>
                  <Input
                    id="howToBuyLink"
                    value={webContents.how_to_buy_link || ""}
                    onChange={(e) => setWebContents(prev => ({ ...prev, how_to_buy_link: e.target.value }))}
                    placeholder="Enter How to Buy link"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chatWithUsLink">Chat With Us Link</Label>
                  <Input
                    id="chatWithUsLink"
                    value={webContents.chat_with_us_link || ""}
                    onChange={(e) => setWebContents(prev => ({ ...prev, chat_with_us_link: e.target.value }))}
                    placeholder="Enter Chat With Us link"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="howToBuyContent">How to Buy Content</Label>
                  <Textarea
                    id="howToBuyContent"
                    value={webContents.how_to_buy_content || ""}
                    onChange={(e) => setWebContents(prev => ({ ...prev, how_to_buy_content: e.target.value }))}
                    placeholder="Enter How to Buy content"
                    rows={6}
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default WebContentsManagement;
