
import { useState, useRef, useEffect } from "react";
import { Send, X, Minimize, Volume2, RefreshCw, Download, Image, Sparkles } from "lucide-react";
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
      content: "Welcome to **Father of Luxury**! 🌟\n\nI'm here to help you discover our premium collection. Let me know how I can assist you with **Father of Luxury** products!\n\nVisit us at **fatheroluxury.com** for the complete experience.",
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
        content: "Welcome to **Father of Luxury**! 🌟\n\nI'm here to help you discover our premium collection. Let me know how I can assist you with **Father of Luxury** products!\n\nVisit us at **fatheroluxury.com** for the complete experience.",
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

  const renderMessage = (content: string) => {
    // Convert **text** to bold and handle links
    const parts = content.split(/(\*\*[^*]+\*\*|fatheroluxury\.com)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-amber-600">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part === 'fatheroluxury.com') {
        return (
          <a 
            key={index} 
            href={`https://${part}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 w-full max-w-md h-[600px] backdrop-blur-sm">
      {/* Modern header with gradient */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-6 py-4 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 animate-gradient-background"></div>
        <div className="flex items-center relative z-10">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-white/30">
              <div className="bg-white text-amber-600 flex items-center justify-center h-full rounded-full text-sm font-bold shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
            </Avatar>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="ml-3">
            <h3 className="text-white font-bold text-sm tracking-wide">Father of Luxury</h3>
            <p className="text-amber-100 text-xs font-medium">Premium Assistant</p>
          </div>
        </div>
        <div className="flex space-x-2 relative z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMinimize}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <Minimize className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages with improved styling */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                message.role === "user"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white ml-8"
                  : "bg-white border border-gray-100 text-gray-800 mr-8"
              }`}
            >
              {message.image && (
                <div className="mb-3">
                  <img 
                    src={message.image} 
                    alt="User uploaded" 
                    className="rounded-xl max-h-[150px] object-cover w-full shadow-sm" 
                  />
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {renderMessage(message.content)}
              </div>
              <div
                className={`text-xs mt-2 ${
                  message.role === "user" ? "text-amber-100" : "text-gray-500"
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
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mr-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-300"></div>
                <span className="text-xs text-gray-500 ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern quick actions */}
      <div className="flex justify-center py-3 bg-gray-50/80 border-t border-gray-100">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" title="Clear chat" onClick={clearChat} className="h-8 px-3 text-xs rounded-full hover:bg-white transition-colors">
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" title="Read message aloud" className="h-8 px-3 text-xs rounded-full hover:bg-white transition-colors">
            <Volume2 className="h-3 w-3 mr-1" />
            Audio
          </Button>
          <Button variant="ghost" size="sm" title="Download conversation" className="h-8 px-3 text-xs rounded-full hover:bg-white transition-colors">
            <Download className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Image preview with modern styling */}
      {previewImage && (
        <div className="px-4 pt-4 flex items-center bg-gray-50/80">
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="h-16 w-16 object-cover rounded-xl border-2 border-amber-200 shadow-sm" 
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-sm"
              onClick={removeSelectedImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="ml-3 text-sm text-gray-600">
            <p className="font-medium">Image attached</p>
            <p className="text-xs text-gray-500">Ask about this image or send message</p>
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

      {/* Modern message input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-end space-x-3">
          <Button 
            onClick={triggerImageUpload} 
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
            title="Upload image for search"
          >
            <Image className="h-5 w-5 text-amber-600" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Ask about this image..." : "Type your message about luxury products..."}
              className="min-h-12 max-h-32 resize-none rounded-2xl border-gray-200 focus:border-amber-300 focus:ring-amber-200 pr-4 py-3 text-sm"
            />
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || (!userInput.trim() && !selectedImage)} 
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotUI;
