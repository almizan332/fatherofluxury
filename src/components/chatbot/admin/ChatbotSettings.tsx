
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, RefreshCw, Save } from "lucide-react";

interface ChatbotSettingsProps {}

const ChatbotSettings = ({}: ChatbotSettingsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [settings, setSettings] = useState({
    enabled: true,
    welcome_message: "Hello! How can I help you today?",
    theme_color: "#8B5CF6",
    position: "bottom-right"
  });
  const [trainingFiles, setTrainingFiles] = useState<Array<{ id: string, name: string, type: string, size: number }>>([]);
  const [trainingUrls, setTrainingUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // Fetch chatbot settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('chatbot_settings')
          .select('*')
          .eq('id', 'default')
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }
        
        if (settingsData) {
          setSettings({
            enabled: settingsData.enabled ?? true,
            welcome_message: settingsData.welcome_message ?? "Hello! How can I help you today?",
            theme_color: settingsData.theme_color ?? "#8B5CF6",
            position: settingsData.position ?? "bottom-right"
          });
        }
        
        // Fetch training files
        const { data: filesData, error: filesError } = await supabase
          .from('chatbot_training_files')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (filesError) throw filesError;
        if (filesData) {
          setTrainingFiles(filesData.map(file => ({
            id: file.id,
            name: file.file_name,
            type: file.file_type,
            size: file.file_size
          })));
        }
        
        // Fetch training URLs
        const { data: urlsData, error: urlsError } = await supabase
          .from('chatbot_training_urls')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (urlsError) throw urlsError;
        if (urlsData) {
          setTrainingUrls(urlsData.map(url => url.url));
        }
        
        // Get DeepSeek API key
        const { data: { value: deepSeekApiKey } } = await supabase
          .functions.invoke("get-secret", { body: { name: "DEEPSEEK_API_KEY" } });
        
        if (deepSeekApiKey) {
          setApiKey(deepSeekApiKey);
        }
        
      } catch (error) {
        console.error("Error fetching chatbot settings:", error);
        toast({
          title: "Error",
          description: "Failed to load chatbot settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({
          id: 'default',
          enabled: settings.enabled,
          welcome_message: settings.welcome_message,
          theme_color: settings.theme_color,
          position: settings.position,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Save API key securely
      if (apiKey) {
        await supabase.functions.invoke("set-secret", {
          body: { name: "DEEPSEEK_API_KEY", value: apiKey }
        });
      }
      
      toast({
        title: "Success",
        description: "Chatbot settings saved successfully"
      });
    } catch (error) {
      console.error("Error saving chatbot settings:", error);
      toast({
        title: "Error",
        description: "Failed to save chatbot settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsLoading(true);
    
    try {
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chatbot-training')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Save file metadata
      const { error: metadataError } = await supabase
        .from('chatbot_training_files')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          status: 'pending'
        });
        
      if (metadataError) throw metadataError;
      
      toast({
        title: "File uploaded",
        description: "Training file uploaded successfully"
      });
      
      // Trigger file processing via edge function
      await supabase.functions.invoke("process-training-file", {
        body: { filePath: uploadData.path }
      });
      
      // Refresh file list
      const { data: refreshData, error: refreshError } = await supabase
        .from('chatbot_training_files')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (refreshError) throw refreshError;
      if (refreshData) {
        setTrainingFiles(refreshData.map(file => ({
          id: file.id,
          name: file.file_name,
          type: file.file_type,
          size: file.file_size
        })));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload training file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chatbot_training_urls')
        .insert({ url: newUrl.trim(), status: 'pending' });
        
      if (error) throw error;
      
      setTrainingUrls([...trainingUrls, newUrl.trim()]);
      setNewUrl("");
      
      toast({
        title: "URL added",
        description: "Training URL added successfully"
      });
      
      // Trigger URL processing
      await supabase.functions.invoke("crawl-training-url", {
        body: { url: newUrl.trim() }
      });
    } catch (error) {
      console.error("Error adding URL:", error);
      toast({
        title: "Error",
        description: "Failed to add training URL",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    setIsLoading(true);
    try {
      const fileToDelete = trainingFiles.find(file => file.id === id);
      if (!fileToDelete) return;
      
      const { error } = await supabase
        .from('chatbot_training_files')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTrainingFiles(trainingFiles.filter(file => file.id !== id));
      
      toast({
        title: "File deleted",
        description: "Training file removed successfully"
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete training file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUrl = async (url: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chatbot_training_urls')
        .delete()
        .eq('url', url);
        
      if (error) throw error;
      
      setTrainingUrls(trainingUrls.filter(u => u !== url));
      
      toast({
        title: "URL deleted",
        description: "Training URL removed successfully"
      });
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast({
        title: "Error",
        description: "Failed to delete training URL",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrainModel = async () => {
    setIsLoading(true);
    try {
      await supabase.functions.invoke("retrain-chatbot", {
        body: { fullRetrain: true }
      });
      
      toast({
        title: "Retraining started",
        description: "Chatbot model retraining has been initiated"
      });
    } catch (error) {
      console.error("Error starting retraining:", error);
      toast({
        title: "Error",
        description: "Failed to start model retraining",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Chatbot Configuration</h2>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="settings">General Settings</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="integration">API Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-chatbot">Enable Chatbot</Label>
              <p className="text-sm text-muted-foreground">
                Toggle chatbot visibility on your website
              </p>
            </div>
            <Switch
              id="enable-chatbot"
              checked={settings.enabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, enabled: checked })
              }
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={settings.welcome_message}
              onChange={(e) => 
                setSettings({ ...settings, welcome_message: e.target.value })
              }
              placeholder="Hello! How can I help you today?"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme-color">Theme Color</Label>
            <div className="flex gap-2">
              <Input
                id="theme-color"
                type="text"
                value={settings.theme_color}
                onChange={(e) => 
                  setSettings({ ...settings, theme_color: e.target.value })
                }
                placeholder="#8B5CF6"
                className="flex-1"
                disabled={isLoading}
              />
              <Input
                type="color"
                value={settings.theme_color}
                onChange={(e) => 
                  setSettings({ ...settings, theme_color: e.target.value })
                }
                className="w-14 p-1 h-10"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Widget Position</Label>
            <Select
              value={settings.position}
              onValueChange={(value) => 
                setSettings({ ...settings, position: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full mt-6"
            disabled={isLoading} 
            onClick={handleSaveSettings}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </TabsContent>
        
        <TabsContent value="training" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Upload Training Files</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload PDFs, DOC, TXT, and other text files to train your chatbot.
            </p>
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="mb-2">Drag and drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: PDF, DOC, DOCX, TXT, CSV, etc.
              </p>
              <div className="relative">
                <Input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                  disabled={isLoading}
                />
                <Button variant="outline" disabled={isLoading}>
                  Choose file
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Training Files</h3>
            {trainingFiles.length > 0 ? (
              <div className="space-y-2">
                {trainingFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.type.split('/')[1]} · {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No training files uploaded yet
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Add Website URLs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add website URLs for the chatbot to crawl and learn from.
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/page-to-crawl"
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleAddUrl}
                disabled={isLoading || !newUrl.trim()}
              >
                Add URL
              </Button>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Training URLs</h4>
              {trainingUrls.length > 0 ? (
                <div className="space-y-2">
                  {trainingUrls.map((url) => (
                    <div 
                      key={url} 
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <p className="text-sm truncate flex-1">{url}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteUrl(url)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No training URLs added yet
                </p>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="w-full" 
            onClick={handleRetrainModel}
            disabled={isLoading || (trainingFiles.length === 0 && trainingUrls.length === 0)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retrain Chatbot
          </Button>
        </TabsContent>
        
        <TabsContent value="integration" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">DeepSeek API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is stored securely and never exposed to frontend users.
            </p>
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save API Key
          </Button>
          
          <div className="border rounded-md p-4 mt-6">
            <h4 className="font-medium mb-2">Chatbot Integration</h4>
            <p className="text-sm text-muted-foreground mb-4">
              The chatbot widget will automatically appear on all pages of your website.
              You can control its visibility in the General Settings tab.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatbotSettings;
