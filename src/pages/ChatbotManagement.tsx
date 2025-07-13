import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Settings, Image as ImageIcon, BarChart3, Bot, Upload, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatbotSettings {
  enabled: boolean;
  welcome_message: string;
  theme_color: string;
  position: string;
  image_search_enabled?: boolean;
}

const ChatbotManagement = () => {
  const [settings, setSettings] = useState<ChatbotSettings>({
    enabled: true,
    welcome_message: "Hello! How can I help you today?",
    theme_color: "#8B5CF6",
    position: "bottom-right",
    image_search_enabled: true
  });
  const [customPrompts, setCustomPrompts] = useState<any[]>([]);
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ title: '', content: '', role: 'system' });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchCustomPrompts();
    fetchChatLogs();
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
        setSettings({
          ...data,
          image_search_enabled: data.image_search_enabled ?? true
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchCustomPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_custom_prompts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomPrompts(data || []);
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
    }
  };

  const fetchChatLogs = async () => {
    // Mock data for demonstration - in production, this would fetch from actual chat logs
    setChatLogs([
      { id: 1, message: "Hello", type: "text", timestamp: new Date(), response: "Hi there! How can I help?" },
      { id: 2, message: "Image uploaded", type: "image", timestamp: new Date(), response: "This looks like *Jam4107 LV 65$*..." },
      { id: 3, message: "Looking for a handbag", type: "text", timestamp: new Date(), response: "I found several handbags for you..." }
    ]);
  };

  const testImageSearch = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-response', {
        body: { 
          message: "Test DeepSeek API connection",
          type: "text"
        }
      });

      if (error) throw error;

      toast({
        title: "Image Search Test",
        description: "DeepSeek API connection is working properly!",
      });
    } catch (error) {
      console.error('Error testing image search:', error);
      toast({
        title: "Test Failed", 
        description: "Check your DeepSeek API key configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chatbot_settings')
        .upsert({
          id: 'default',
          enabled: settings.enabled,
          welcome_message: settings.welcome_message,
          theme_color: settings.theme_color,
          position: settings.position,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Chatbot settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomPrompt = async () => {
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

      setNewPrompt({ title: '', content: '', role: 'system' });
      fetchCustomPrompts();

      toast({
        title: "Prompt added",
        description: "Custom prompt has been added successfully.",
      });
    } catch (error: any) {
      console.error('Error adding prompt:', error);
      toast({
        title: "Error adding prompt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCustomPrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_custom_prompts')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      fetchCustomPrompts();
      toast({
        title: "Prompt deleted",
        description: "Custom prompt has been removed.",
      });
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="image-search" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image Search
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Chatbot</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn the chatbot on or off for all users
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  placeholder="Enter the welcome message users will see"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <Input
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                    className="w-full h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <select
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
              </div>

              <Button onClick={saveSettings} disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Image Search</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to upload images to find similar products
                  </p>
                </div>
                <Switch
                  checked={settings.image_search_enabled ?? true}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, image_search_enabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">DeepSeek API Status</h3>
                <div className="flex items-center gap-4">
                  <Badge variant={settings.image_search_enabled ? "default" : "secondary"}>
                    {settings.image_search_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Button 
                    onClick={testImageSearch} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? "Testing..." : "Test API Connection"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  When users upload an image, DeepSeek will analyze it and find similar products on your website (https://fatherofluxury.com).
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Image Search Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Image Size</Label>
                    <Input value="10MB" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Supported Formats</Label>
                    <Input value="JPG, PNG, WebP" disabled />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. User uploads a product image</li>
                    <li>2. DeepSeek analyzes the image for product features</li>
                    <li>3. System searches your product database for matches</li>
                    <li>4. Returns best match with product name and link</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Custom Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newPrompt.title}
                    onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                    placeholder="Prompt title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    value={newPrompt.role}
                    onChange={(e) => setNewPrompt({ ...newPrompt, role: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="system">System</option>
                    <option value="assistant">Assistant</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addCustomPrompt} className="w-full">
                    Add Prompt
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                  placeholder="Enter the prompt content that will guide the chatbot"
                  rows={4}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Prompts</h3>
                {customPrompts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No custom prompts added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {customPrompts.map((prompt) => (
                      <div key={prompt.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{prompt.title}</h4>
                            <Badge variant="outline">{prompt.role}</Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCustomPrompt(prompt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{prompt.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chat Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Conversations</span>
                    <Badge variant="secondary">156</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Image Searches</span>
                    <Badge variant="secondary">42</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Matches</span>
                    <Badge variant="secondary">38</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Searches</span>
                    <Badge variant="destructive">4</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DeepSeek API Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>API Calls Today</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Analysis</span>
                    <Badge variant="secondary">21</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>API Errors</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {chatLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={log.type === 'image' ? 'default' : 'secondary'}>
                          {log.type === 'image' ? <ImageIcon className="h-3 w-3 mr-1" /> : <MessageCircle className="h-3 w-3 mr-1" />}
                          {log.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-muted-foreground">Response: {log.response}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Failed Image Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">Failed</Badge>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm">User uploaded image but no similar products found</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Review Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotManagement;