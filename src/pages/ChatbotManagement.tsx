import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Settings, Upload, FileText } from "lucide-react";

const ChatbotManagement = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    welcome_message: "Hello! How can I help you today?",
    theme_color: "#8B5CF6",
    position: "bottom-right"
  });
  const [prompts, setPrompts] = useState<any[]>([]);
  const [newPrompt, setNewPrompt] = useState({ title: "", content: "", role: "system" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchPrompts();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_custom_prompts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching prompts",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
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
        description: "Chatbot settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPrompt = async () => {
    if (!newPrompt.title || !newPrompt.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('chatbot_custom_prompts')
        .insert([newPrompt]);

      if (error) throw error;

      setNewPrompt({ title: "", content: "", role: "system" });
      fetchPrompts();

      toast({
        title: "Prompt added",
        description: "Custom prompt has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding prompt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_custom_prompts')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      fetchPrompts();
      toast({
        title: "Prompt deleted",
        description: "Custom prompt has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting prompt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Chatbot Management</h1>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Custom Prompts
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Training Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Enable Chatbot</Label>
                  <p className="text-sm text-muted-foreground">Turn the chatbot on or off for all users</p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  placeholder="Enter the welcome message users will see"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme_color">Theme Color</Label>
                <Input
                  id="theme_color"
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                  className="w-20 h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  value={settings.position}
                  onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <Button onClick={saveSettings} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Custom Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt_title">Title</Label>
                  <Input
                    id="prompt_title"
                    value={newPrompt.title}
                    onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                    placeholder="Enter prompt title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt_content">Content</Label>
                  <Textarea
                    id="prompt_content"
                    value={newPrompt.content}
                    onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                    placeholder="Enter the prompt content that will guide the chatbot"
                    rows={4}
                  />
                </div>

                <Button onClick={addPrompt} className="w-full">
                  Add Prompt
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                {prompts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No custom prompts added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {prompts.map((prompt) => (
                      <div key={prompt.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{prompt.title}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePrompt(prompt.id)}
                          >
                            Delete
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{prompt.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Train on Product Data</h3>
                <p className="text-muted-foreground mb-4">
                  The chatbot is automatically trained on your product catalog. 
                  It can help users find products and answer questions about your inventory.
                </p>
                <p className="text-sm text-muted-foreground">
                  Image search and product matching features are enabled with DeepSeek API integration.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotManagement;