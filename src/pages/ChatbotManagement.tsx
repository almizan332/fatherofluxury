
import { useState, useEffect } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider 
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, PlusCircle, Upload, Trash2, MessageSquare, FileText, Globe } from "lucide-react";
import ChatbotWelcomeMessage from "@/components/chatbot/ChatbotWelcomeMessage";
import ChatbotTrainingContent from "@/components/chatbot/ChatbotTrainingContent";
import ChatbotCustomPrompts from "@/components/chatbot/ChatbotCustomPrompts";

const ChatbotManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    welcome_message: "Hello! How can I help you today?",
    theme_color: "#8B5CF6",
    position: "bottom-right"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({
          id: 'default',
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Chatbot settings have been updated successfully."
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* Sidebar content will be inherited from the Dashboard layout */}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Chatbot Management</h1>
              <p className="text-muted-foreground">Customize and train your AI chatbot</p>
            </div>
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Settings
            </Button>
          </div>

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings">General Settings</TabsTrigger>
              <TabsTrigger value="training">Training Data</TabsTrigger>
              <TabsTrigger value="prompts">Custom Prompts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Chatbot Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enabled">Enable Chatbot</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle to enable or disable the chatbot on your website
                      </p>
                    </div>
                    <Switch 
                      id="enabled" 
                      checked={settings.enabled} 
                      onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcome_message">Welcome Message</Label>
                    <Textarea 
                      id="welcome_message"
                      value={settings.welcome_message}
                      onChange={(e) => setSettings({...settings, welcome_message: e.target.value})}
                      placeholder="Enter a welcome message for your visitors"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme_color">Theme Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="theme_color"
                        type="color"
                        value={settings.theme_color}
                        onChange={(e) => setSettings({...settings, theme_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        type="text"
                        value={settings.theme_color}
                        onChange={(e) => setSettings({...settings, theme_color: e.target.value})}
                        className="w-32"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <select
                      id="position"
                      value={settings.position}
                      onChange={(e) => setSettings({...settings, position: e.target.value})}
                      className="w-full p-2 border rounded bg-background"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                </div>
              </Card>
              
              <ChatbotWelcomeMessage 
                welcomeMessage={settings.welcome_message} 
                themeColor={settings.theme_color} 
              />
            </TabsContent>
            
            <TabsContent value="training">
              <ChatbotTrainingContent />
            </TabsContent>
            
            <TabsContent value="prompts">
              <ChatbotCustomPrompts />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatbotManagement;
