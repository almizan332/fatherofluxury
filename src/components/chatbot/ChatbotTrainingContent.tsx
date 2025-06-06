
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Globe, FileText, Plus, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrainingContent {
  id: string;
  title: string;
  content: string;
  source_type: string;
  created_at: string;
  status: string;
}

interface TrainingURL {
  id: string;
  url: string;
  status: string;
  created_at: string;
}

interface TrainingFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

const ChatbotTrainingContent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trainingContent, setTrainingContent] = useState<TrainingContent[]>([]);
  const [trainingUrls, setTrainingUrls] = useState<TrainingURL[]>([]);
  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
  
  const [newContent, setNewContent] = useState({
    title: "",
    content: "",
  });
  
  const [newUrl, setNewUrl] = useState("");
  const [selectedTrainingContent, setSelectedTrainingContent] = useState<TrainingContent | null>(null);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTrainingData();
  }, []);
  
  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      
      // Fetch manual training content
      const { data: contentData, error: contentError } = await supabase
        .from('chatbot_training_content')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (contentError) throw contentError;
      setTrainingContent(contentData || []);
      
      // Fetch training URLs
      const { data: urlData, error: urlError } = await supabase
        .from('chatbot_training_urls')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (urlError) throw urlError;
      setTrainingUrls(urlData || []);
      
      // Fetch training files
      const { data: fileData, error: fileError } = await supabase
        .from('chatbot_training_files')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (fileError) throw fileError;
      setTrainingFiles(fileData || []);
      
    } catch (error: any) {
      console.error("Error fetching training data:", error);
      toast({
        title: "Error loading training data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddContent = async () => {
    if (!newContent.title.trim() || !newContent.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('chatbot_training_content')
        .insert({
          title: newContent.title,
          content: newContent.content,
          source_type: 'manual',
          status: 'active',
        });
        
      if (error) throw error;
      
      toast({
        title: "Content added",
        description: "Training content has been added successfully.",
      });
      
      setNewContent({ title: "", content: "" });
      fetchTrainingData();
      
    } catch (error: any) {
      console.error("Error adding content:", error);
      toast({
        title: "Error adding content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUrl = async () => {
    if (!newUrl.trim() || !newUrl.startsWith('http')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('chatbot_training_urls')
        .insert({
          url: newUrl,
          status: 'pending',
        });
        
      if (error) throw error;
      
      toast({
        title: "URL added",
        description: "The URL has been added for processing.",
      });
      
      setNewUrl("");
      fetchTrainingData();
      
    } catch (error: any) {
      console.error("Error adding URL:", error);
      toast({
        title: "Error adding URL",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setLoading(true);
      
      // For each file, create a record
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a record in the database
        const { error } = await supabase
          .from('chatbot_training_files')
          .insert({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_path: `chatbot_training/${file.name}`, // We'll use this path to upload to storage
            status: 'pending',
          });
          
        if (error) throw error;
        
        // In a real implementation, you would upload the file to storage here
        // For now, we'll just create the database record
      }
      
      toast({
        title: "Files added",
        description: "Files have been added for processing.",
      });
      
      fetchTrainingData();
      
    } catch (error: any) {
      console.error("Error adding files:", error);
      toast({
        title: "Error adding files",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Reset the input
      if (e.target) e.target.value = "";
    }
  };
  
  const handleDeleteContent = async () => {
    if (!deleteContentId) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('chatbot_training_content')
        .delete()
        .eq('id', deleteContentId);
        
      if (error) throw error;
      
      toast({
        title: "Content deleted",
        description: "Training content has been removed.",
      });
      
      fetchTrainingData();
      
    } catch (error: any) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error deleting content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteContentId(null);
    }
  };
  
  return (
    <Card className="p-6">
      <Tabs defaultValue="manual">
        <TabsList className="mb-4">
          <TabsTrigger value="manual">
            <FileText className="h-4 w-4 mr-2" />
            Manual Content
          </TabsTrigger>
          <TabsTrigger value="urls">
            <Globe className="h-4 w-4 mr-2" />
            Web URLs
          </TabsTrigger>
          <TabsTrigger value="files">
            <Upload className="h-4 w-4 mr-2" />
            File Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentTitle">Title</Label>
                <Input
                  id="contentTitle"
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  placeholder="Enter a title for this content"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentText">Content</Label>
                <Textarea
                  id="contentText"
                  value={newContent.content}
                  onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                  placeholder="Enter the training content here"
                  rows={5}
                />
              </div>
              <div>
                <Button onClick={handleAddContent} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Training Content
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Training Content</h3>
              {trainingContent.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>{item.source_type}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => setDeleteContentId(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Training Content</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this training content? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteContentId(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteContent}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No training content added yet.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="urls">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter a URL to train from (e.g., https://example.com/about)"
                className="flex-1"
              />
              <Button onClick={handleAddUrl} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add URL
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Training URLs</h3>
              {trainingUrls.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingUrls.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-[300px] truncate">{item.url}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'active' ? 'bg-green-100 text-green-800' : 
                              item.status === 'failed' ? 'bg-red-100 text-red-800' : 
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                // Implement retry/refresh logic here
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No training URLs added yet.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="files">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-10 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Upload Files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload PDF, DOCX, TXT, or other text-based files to train your chatbot
              </p>
              <div className="relative">
                <Input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.txt,.md"
                />
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
              {trainingFiles.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Added</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>{file.file_name}</TableCell>
                          <TableCell>{file.file_type}</TableCell>
                          <TableCell>{formatFileSize(file.file_size)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              file.status === 'active' ? 'bg-green-100 text-green-800' : 
                              file.status === 'failed' ? 'bg-red-100 text-red-800' : 
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {file.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No files uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default ChatbotTrainingContent;
