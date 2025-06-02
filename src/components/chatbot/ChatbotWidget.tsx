
import { useState, useEffect } from "react";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotUI from "./ChatbotUI";
import { supabase } from "@/integrations/supabase/client";

interface ChatbotSettings {
  enabled: boolean;
  welcome_message: string;
  theme_color: string;
  position: string;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatbotSettings, setChatbotSettings] = useState<ChatbotSettings>({
    enabled: true,
    welcome_message: "Hello! How can I help you today?",
    theme_color: "#F59E0B", // Amber color for Father of Luxury theme
    position: "bottom-right"
  });

  useEffect(() => {
    const fetchChatbotSettings = async () => {
      try {
        // Using 'any' cast here to bypass TypeScript issue until types are regenerated
        const { data, error } = await (supabase
          .from('chatbot_settings') as any)
          .select('*')
          .eq('id', 'default')
          .single();
          
        if (error) throw error;
        if (data) {
          setChatbotSettings({
            enabled: data.enabled ?? true,
            welcome_message: data.welcome_message ?? "Hello! How can I help you today?",
            theme_color: data.theme_color ?? "#F59E0B",
            position: data.position ?? "bottom-right"
          });
        }
      } catch (error) {
        console.error("Error fetching chatbot settings:", error);
      }
    };
    
    fetchChatbotSettings();
  }, []);

  // Don't show widget if it's disabled in settings
  if (!chatbotSettings.enabled) return null;

  const positionClass = 
    chatbotSettings.position === "bottom-right" ? "bottom-6 right-6" :
    chatbotSettings.position === "bottom-left" ? "bottom-6 left-6" :
    chatbotSettings.position === "top-right" ? "top-6 right-6" :
    "top-6 left-6";

  return (
    <div className={`fixed ${positionClass} z-50`}>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4"
          >
            <ChatbotUI 
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsMinimized(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Father of Luxury Chat</span>
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMinimized(false)}
                  className="h-7 px-3 text-xs rounded-full hover:bg-amber-50 text-amber-600 transition-colors"
                >
                  Open
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setIsMinimized(false);
                    setIsOpen(false);
                  }}
                  className="h-7 w-7 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && !isMinimized && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button 
            onClick={() => setIsOpen(true)} 
            size="icon" 
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border-2 border-white transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 animate-gradient-background"></div>
            <div className="relative z-10 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-white transition-transform group-hover:scale-110" />
              <Sparkles className="h-4 w-4 text-white absolute -top-1 -right-1 animate-pulse" />
            </div>
          </Button>
          
          {/* Notification badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div>
          
          {/* Floating message preview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-3 border border-gray-100 max-w-64 hidden group-hover:block"
          >
            <div className="text-xs text-gray-600 font-medium">Need help with luxury products?</div>
            <div className="text-xs text-amber-600 mt-1">Click to chat with our assistant!</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatbotWidget;
