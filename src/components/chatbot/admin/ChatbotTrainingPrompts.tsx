
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Save, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface CustomPrompt {
  id: string;
  role: 'system' | 'example' | 'rule';
  title: string;
  content: string;
  status: string;
  created_at?: string;
}

const ChatbotTrainingPrompts = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [newPrompt, setNewPrompt] = useState<Partial<CustomPrompt>>({
    role: 'system',
    title: '',
    content: '',
    status: 'active'
  });
  const [manualContent, setManualContent] = useState('');
  const [contentTitle, setContentTitle] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      // Using 'any' type casting to bypass TypeScript issue with newly created tables
      const { data, error } = await (supabase
        .from('chatbot_custom_prompts' as any)
        .select('*')
        .order('created_at', { ascending: false }));
      
      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error("Error fetching custom prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load custom prompts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrompt = async () => {
    if (!newPrompt.title || !newPrompt.content) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Using 'any' type casting to bypass TypeScript issue with newly created tables
      const { error } = await (supabase
        .from('chatbot_custom_prompts' as any)
        .insert({
          role: newPrompt.role,
          title: newPrompt.title,
          content: newPrompt.content,
          status: 'active'
        }));
        
      if (error) throw error;
      
      setNewPrompt({
        role: 'system',
        title: '',
        content: '',
        status: 'active'
      });
      
      toast({
        title: "Success",
        description: "Custom prompt added successfully"
      });
      
      fetchPrompts();
    } catch (error) {
      console.error("Error adding custom prompt:", error);
      toast({
        title: "Error",
        description: "Failed to add custom prompt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    setIsLoading(true);
    try {
      // Using 'any' type casting to bypass TypeScript issue with newly created tables
      const { error } = await (supabase
        .from('chatbot_custom_prompts' as any)
        .delete()
        .eq('id', id));
        
      if (error) throw error;
      
      setPrompts(prompts.filter(prompt => prompt.id !== id));
      
      toast({
        title: "Deleted",
        description: "Custom prompt removed successfully"
      });
    } catch (error) {
      console.error("Error deleting custom prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete custom prompt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualContent = async () => {
    if (!contentTitle || !manualContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Using 'any' type casting to bypass TypeScript issue with newly created tables
      const { error } = await (supabase
        .from('chatbot_training_content' as any)
        .insert({
          title: contentTitle,
          content: manualContent,
          source_type: 'manual',
          status: 'active'
        }));
        
      if (error) throw error;
      
      setContentTitle('');
      setManualContent('');
      
      toast({
        title: "Success",
        description: "Training content added successfully"
      });
    } catch (error) {
      console.error("Error adding training content:", error);
      toast({
        title: "Error",
        description: "Failed to add training content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Bot Rules & Custom Prompts</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Define system prompts, rules, and examples to guide how the chatbot responds.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="prompt-role">Role</Label>
              <Select
                value={newPrompt.role}
                onValueChange={(value) => 
                  setNewPrompt({ ...newPrompt, role: value as 'system' | 'example' | 'rule' })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="prompt-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Instructions</SelectItem>
                  <SelectItem value="example">Example</SelectItem>
                  <SelectItem value="rule">Rule/Constraint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3">
              <Label htmlFor="prompt-title">Title</Label>
              <Input
                id="prompt-title"
                value={newPrompt.title}
                onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                placeholder="E.g., 'Response Style' or 'Product Knowledge'"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="prompt-content">Content</Label>
            <Textarea
              id="prompt-content"
              value={newPrompt.content}
              onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
              placeholder="Enter instructions, rules, or examples for the chatbot..."
              className="min-h-[150px]"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={handleAddPrompt}
            disabled={isLoading || !newPrompt.title || !newPrompt.content}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Prompt
          </Button>
        </div>
        
        <h4 className="font-medium mt-6 mb-2">Existing Prompts</h4>
        <div className="space-y-3">
          {prompts.length > 0 ? (
            prompts.map((prompt) => (
              <div 
                key={prompt.id}
                className="flex items-start justify-between p-3 rounded-md border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      prompt.role === 'system' ? 'bg-blue-100 text-blue-800' :
                      prompt.role === 'example' ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prompt.role}
                    </span>
                    <h5 className="font-medium">{prompt.title}</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-2">
                    {prompt.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDeletePrompt(prompt.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No custom prompts added yet
            </p>
          )}
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Manual Training Content</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add custom knowledge directly to the chatbot's training data.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="content-title">Content Title</Label>
            <Input
              id="content-title"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder="E.g., 'Product FAQs' or 'Return Policy'"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="manual-content">Content</Label>
            <Textarea
              id="manual-content"
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              placeholder="Enter information you want the chatbot to learn..."
              className="min-h-[200px]"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={handleAddManualContent}
            disabled={isLoading || !contentTitle || !manualContent}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Add Training Content
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotTrainingPrompts;
