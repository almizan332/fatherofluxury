
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Bot, Sparkles, Image as ImageIcon } from "lucide-react";
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
    welcome_message: "Hello! How can I help you today? I can assist you with product information, orders, and general inquiries.",
    theme_color: "#8B5CF6",
    position: "bottom-right",
    image_search_enabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target?.result as string;
      setSelectedImage(base64Image);
      
      // Auto-send the image
      handleSendImageMessage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImageMessage = async (imageData: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: "🖼️ Image uploaded",
      isBot: false,
      timestamp: new Date(),
      image: imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSelectedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-response', {
        body: { 
          image: imageData, 
          type: 'image' 
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I found some products that might match your image.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with image search:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process that image. Please try again.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!settings.enabled) return null;

  return (
    <>
      {/* Modern Chat Widget Button */}
      <div className={`fixed ${
        isMobile ? 'bottom-6 right-6' : 
        settings.position === 'bottom-left' ? 'bottom-6 left-6' : 
        settings.position === 'top-right' ? 'top-6 right-6' : 
        settings.position === 'top-left' ? 'top-6 left-6' : 
        'bottom-6 right-6'
      } z-[9999] transition-all duration-500 ease-out`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500 animate-pulse"></div>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 border border-white/20 backdrop-blur-sm hover:shadow-purple-500/25"
            size="icon"
          >
            {isOpen ? (
              <X className="h-7 w-7 text-white" />
            ) : (
              <div className="relative">
                <Bot className="h-7 w-7 text-white" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Modern Chat Window */}
      {isOpen && (
        <>
          {/* Mobile Overlay with Blur */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-500"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          <div className={`
            fixed z-50 transition-all duration-500 ease-out
            ${isMobile 
              ? 'inset-x-4 bottom-4 top-20' 
              : isMinimized 
                ? 'w-96 h-16' 
                : 'w-96 max-w-sm h-[550px] max-h-[85vh]'
            }
            ${!isMobile && settings.position === 'bottom-left' ? 'bottom-24 left-6' : 
              !isMobile && settings.position === 'top-right' ? 'top-24 right-6' : 
              !isMobile && settings.position === 'top-left' ? 'top-24 left-6' : 
              !isMobile ? 'bottom-24 right-6' : ''
            }
          `}>
            <Card className="h-full flex flex-col bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl overflow-hidden animate-scale-in">
              <CardHeader className="relative overflow-hidden rounded-t-2xl flex-shrink-0 p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm"></div>
                <CardTitle className="relative text-lg flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Assistant</h3>
                      <p className="text-xs text-white/80">Online • Ready to help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="h-8 w-8 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0 min-h-0 bg-gradient-to-b from-gray-50/50 to-white/50">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
                        >
                          <div
                            className={`max-w-[85%] p-4 rounded-2xl break-words backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                              message.isBot
                                ? 'bg-white/80 text-gray-800 border border-gray-200/50 shadow-sm'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            }`}
                          >
                            {message.image && (
                              <img 
                                src={message.image} 
                                alt="Uploaded" 
                                className="max-w-full h-auto rounded-lg mb-2"
                              />
                            )}
                            <p className="text-sm leading-relaxed font-medium whitespace-pre-line">{message.text}</p>
                            <p className="text-xs opacity-70 mt-2 font-normal">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start animate-fade-in">
                          <div className="bg-white/80 backdrop-blur-sm text-gray-800 p-4 rounded-2xl border border-gray-200/50 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                              </div>
                              <p className="text-sm font-medium">AI is thinking...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-6 bg-white/60 backdrop-blur-xl border-t border-gray-200/50 flex-shrink-0">
                    <div className="flex gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {settings.image_search_enabled && (
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          size="icon"
                          variant="outline"
                          disabled={isLoading}
                          className="rounded-xl border-gray-200/50 hover:bg-purple-50 transition-all duration-200"
                          title="Upload image to search"
                        >
                          <ImageIcon className="h-5 w-5 text-purple-600" />
                        </Button>
                      )}
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200 text-gray-900 placeholder:text-gray-500"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl p-3 hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <Send className="h-5 w-5" />
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
