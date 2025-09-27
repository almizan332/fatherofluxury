
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Upload, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  image?: string;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [settings, setSettings] = useState({
    enabled: true,
    welcome_message: "Hello! How can I help you today? I can assist you with product information, orders, and general inquiries. You can also upload an image to find similar products!",
    theme_color: "#8B5CF6",
    position: "bottom-right",
    image_search_enabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.welcome_message && messages.length === 0) {
      setMessages([{
        id: "1",
        text: settings.welcome_message,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [settings.welcome_message]);

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
    } catch (error) {
      console.error('Error fetching chatbot settings:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-response', {
        body: { message: query, type: 'text' }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm here to help! Please feel free to ask about our products.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const userMessage: Message = {
          id: Date.now().toString(),
          text: "Looking for similar products...",
          isBot: false,
          timestamp: new Date(),
          image: base64
        };

        setMessages(prev => [...prev, userMessage]);

        try {
          const { data, error } = await supabase.functions.invoke('chatbot-response', {
            body: { image: base64, type: 'image' }
          });

          if (error) throw error;

          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response || "Sorry, I couldn't find similar products for this image.",
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error('Error processing image:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I couldn't process this image. Please try again later.",
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsLoading(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!settings.enabled) return null;

  return (
    <>
      {/* Chat Widget Button */}
      <div className={`fixed ${
        isMobile ? 'bottom-6 right-6' : 
        settings.position === 'bottom-left' ? 'bottom-6 left-6' : 
        settings.position === 'top-right' ? 'top-6 right-6' : 
        settings.position === 'top-left' ? 'top-6 left-6' : 
        'bottom-6 right-6'
      } z-[9999] transition-all duration-300 ease-in-out`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-all duration-200 ring-4 ring-white/20 animate-pulse hover:animate-none"
          style={{ backgroundColor: settings.theme_color }}
          size="icon"
        >
          {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageCircle className="h-7 w-7 text-white" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          <div className={`
            fixed z-50 transition-all duration-300 ease-in-out
            ${isMobile 
              ? 'inset-x-4 bottom-4 top-20' 
              : isMinimized 
                ? 'w-80 h-12' 
                : 'w-80 max-w-sm h-[500px] max-h-[80vh]'
            }
            ${!isMobile && settings.position === 'bottom-left' ? 'bottom-24 left-6' : 
              !isMobile && settings.position === 'top-right' ? 'top-24 right-6' : 
              !isMobile && settings.position === 'top-left' ? 'top-24 left-6' : 
              !isMobile ? 'bottom-24 right-6' : ''
            }
          `}>
            <Card className="h-full flex flex-col bg-background shadow-2xl border animate-fade-in">
              <CardHeader 
                className="text-white rounded-t-lg flex-shrink-0 p-4" 
                style={{ backgroundColor: settings.theme_color }}
              >
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Support Chat
                  </div>
                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="h-8 w-8 text-white hover:bg-white/20"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-lg break-words ${
                              message.isBot
                                ? 'bg-muted text-foreground'
                                : 'text-white'
                            }`}
                            style={!message.isBot ? { backgroundColor: settings.theme_color } : {}}
                          >
                            {message.image && (
                              <div className="mb-2 max-w-48">
                                <img 
                                  src={message.image} 
                                  alt="Uploaded" 
                                  className="w-full h-auto rounded-md object-cover max-h-32" 
                                />
                              </div>
                            )}
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted text-foreground p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                              </div>
                              <p className="text-sm">Typing...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t flex-shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {settings.image_search_enabled && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                          className="shrink-0 hover:scale-105 transition-transform duration-200"
                          title="Upload image to find similar products"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isMobile ? "Type message..." : "Type your message or upload an image..."}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        size="icon"
                        style={{ backgroundColor: settings.theme_color }}
                        disabled={isLoading}
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
};

export default ChatbotWidget;
