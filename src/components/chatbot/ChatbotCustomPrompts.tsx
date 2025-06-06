
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface CustomPrompt {
  id: string;
  title: string;
  content: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ChatbotCustomPrompts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  
  const [currentPrompt, setCurrentPrompt] = useState<CustomPrompt>({
    id: "",
    title: "",
    content: "",
    role: "system",
    status: "active",
    created_at: "",
    updated_at: ""
  });
  
  useEffect(() => {
    fetchCustomPrompts();
  }, []);
  
  const fetchCustomPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_custom_prompts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCustomPrompts(data || []);
      
    } catch (error: any) {
      console.error("Error fetching custom prompts:", error);
      toast({
        title: "Error loading prompts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddPrompt = async () => {
    if (!currentPrompt.title.trim() || !currentPrompt.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for the prompt.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('chatbot_custom_prompts')
        .insert({
          title: currentPrompt.title,
          content: currentPrompt.content,
          role: currentPrompt.role,
          status: "active",
        });
        
      if (error) throw error;
      
      toast({
        title: "Prompt added",
        description: "Custom prompt has been added successfully.",
      });
      
      setCurrentPrompt({
        id: "",
        title: "",
        content: "",
        role: "system",
        status: "active",
        created_at: "",
        updated_at: ""
      });
      setIsAddDialogOpen(false);
      fetchCustomPrompts();
      
    } catch (error: any) {
      console.error("Error adding prompt:", error);
      toast({
        title: "Error adding prompt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePrompt = async () => {
    if (!currentPrompt.title.trim() || !currentPrompt.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for the prompt.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('chatbot_custom_prompts')
        .update({
          title: currentPrompt.title,
          content: currentPrompt.content,
          role: currentPrompt.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentPrompt.id);
        
      if (error) throw error;
      
      toast({
        title: "Prompt updated",
        description: "Custom prompt has been updated successfully.",
      });
      
      setIsEditDialogOpen(false);
      fetchCustomPrompts();
      
    } catch (error: any) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Error updating prompt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePrompt = async () => {
    if (!deletePromptId) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('chatbot_custom_prompts')
        .delete()
        .eq('id', deletePromptId);
        
      if (error) throw error;
      
      toast({
        title: "Prompt deleted",
        description: "Custom prompt has been removed.",
      });
      
      setDeletePromptId(null);
      fetchCustomPrompts();
      
    } catch (error: any) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error deleting prompt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const openEditDialog = (prompt: CustomPrompt) => {
    setCurrentPrompt(prompt);
    setIsEditDialogOpen(true);
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Custom Prompts</h2>
        <Button onClick={() => {
          setCurrentPrompt({
            id: "",
            title: "",
            content: "",
            role: "system",
            status: "active",
            created_at: "",
            updated_at: ""
          });
          setIsAddDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Prompt
        </Button>
      </div>
      
      {customPrompts.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>{prompt.title}</TableCell>
                  <TableCell>{prompt.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prompt.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prompt.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(prompt.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(prompt)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeletePromptId(prompt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Custom Prompt</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this custom prompt? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletePromptId(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeletePrompt}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No custom prompts added yet. Add your first prompt to enhance your chatbot.</p>
        </div>
      )}
      
      {/* Add Prompt Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Prompt</DialogTitle>
            <DialogDescription>
              Create a new prompt to guide how your chatbot responds.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promptTitle">Title</Label>
              <Input
                id="promptTitle"
                value={currentPrompt.title}
                onChange={(e) => setCurrentPrompt({...currentPrompt, title: e.target.value})}
                placeholder="Enter a descriptive title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promptRole">Role</Label>
              <select
                id="promptRole"
                value={currentPrompt.role}
                onChange={(e) => setCurrentPrompt({...currentPrompt, role: e.target.value})}
                className="w-full p-2 border rounded bg-background"
              >
                <option value="system">System</option>
                <option value="assistant">Assistant</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promptContent">Content</Label>
              <Textarea
                id="promptContent"
                value={currentPrompt.content}
                onChange={(e) => setCurrentPrompt({...currentPrompt, content: e.target.value})}
                placeholder="Enter the prompt content"
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPrompt} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Prompt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Prompt</DialogTitle>
            <DialogDescription>
              Modify your existing prompt.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPromptTitle">Title</Label>
              <Input
                id="editPromptTitle"
                value={currentPrompt.title}
                onChange={(e) => setCurrentPrompt({...currentPrompt, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editPromptRole">Role</Label>
              <select
                id="editPromptRole"
                value={currentPrompt.role}
                onChange={(e) => setCurrentPrompt({...currentPrompt, role: e.target.value})}
                className="w-full p-2 border rounded bg-background"
              >
                <option value="system">System</option>
                <option value="assistant">Assistant</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editPromptContent">Content</Label>
              <Textarea
                id="editPromptContent"
                value={currentPrompt.content}
                onChange={(e) => setCurrentPrompt({...currentPrompt, content: e.target.value})}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePrompt} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChatbotCustomPrompts;
