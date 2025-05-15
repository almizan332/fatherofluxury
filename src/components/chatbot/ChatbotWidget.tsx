
import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
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
    theme_color: "#8B5CF6",
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
            theme_color: data.theme_color ?? "#8B5CF6",
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
            transition={{ duration: 0.2 }}
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
            className="mb-4 bg-white p-3 rounded-lg shadow-md border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Chat minimized</span>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMinimized(false)}
                  className="h-6 px-2"
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
                  className="h-6 w-6"
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
        >
          <Button 
            onClick={() => setIsOpen(true)} 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg"
            style={{ backgroundColor: chatbotSettings.theme_color }}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ChatbotWidget;
