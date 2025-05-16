
import { useState, useRef, useEffect } from "react";
import { Send, X, Minimize, Volume2, RefreshCw, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
};

interface ChatbotUIProps {
  onClose: () => void;
  onMinimize: () => void;
}

const ChatbotUI = ({ onClose, onMinimize }: ChatbotUIProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    
    try {
      // Add user message with image
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userInput || "Find products like this image",
        timestamp: new Date(),
        image: previewImage || undefined
      };
      setMessages((prev) => [...prev, userMessage]);
      
      // Upload the image temporarily to get a URL
      const fileName = `temp-search-${Date.now()}.${selectedImage.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp_uploads')
        .upload(`public/${fileName}`, selectedImage);
        
      if (uploadError) {
        throw new Error(`Error uploading image: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('temp_uploads')
        .getPublicUrl(`public/${fileName}`);
      
      // Call the chatbot query function with image URL
      const { data, error } = await supabase.functions.invoke("chatbot-query", {
        body: { 
          query: userInput || "Find products like this image",
          imageUrl: publicUrl
        },
      });

      if (error) {
        throw new Error(`Error invoking function: ${error.message}`);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || "I couldn't find any matching products.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Reset after search
      setUserInput("");
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (error: any) {
      console.error("Error processing image search:", error);
      
      toast({
        title: "Error",
        description: "Failed to search with image. Please try again later.",
        variant: "destructive",
      });
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your image. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (selectedImage) {
      return handleImageSearch();
    }
    
    if (!userInput.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Get response from DeepSeek API via Edge Function
      const { data, error } = await supabase.functions.invoke("chatbot-query", {
        body: { query: userInput },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Error invoking function: ${error.message}`);
      }

      if (!data || !data.response) {
        console.error("Invalid response format:", data);
        throw new Error("Received an invalid response format");
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from chatbot. Please try again later.",
        variant: "destructive",
      });
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden shadow-xl bg-white border border-gray-200 w-full max-w-md h-[500px]">
      {/* Chatbot header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <div className="bg-primary text-white flex items-center justify-center h-full rounded-full text-sm font-semibold">AI</div>
          </Avatar>
          <h3 className="ml-2 text-white font-medium">Premium Assistant</h3>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMinimize}
            className="h-6 w-6 text-white hover:bg-white/20"
          >
            <Minimize className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-6 w-6 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "flex justify-end" : "flex justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50"
              }`}
            >
              {message.image && (
                <div className="mb-2">
                  <img 
                    src={message.image} 
                    alt="User uploaded" 
                    className="rounded-md max-h-[150px] object-cover" 
                  />
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex justify-center py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button variant="outline" size="icon" title="Clear chat" onClick={clearChat}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Read message aloud">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Download conversation">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image preview if selected */}
      {previewImage && (
        <div className="px-3 pt-3 flex items-center">
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="h-16 w-16 object-cover rounded-md border border-gray-200" 
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
              onClick={removeSelectedImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="ml-2 text-sm text-gray-600">
            <p>Ask about this image or click send</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
      />

      {/* Message input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <Button 
            onClick={triggerImageUpload} 
            variant="outline"
            size="icon"
            className="h-[60px]"
            title="Upload image for search"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Ask about this image or press send..." : "Type your message..."}
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || (!userInput.trim() && !selectedImage)} 
            size="icon"
            className="h-[60px] bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotUI;
