
import React, { createContext, useContext, useState, useEffect } from 'react';
import ChatbotWidget from './ChatbotWidget';
import { supabase } from '@/integrations/supabase/client';

interface ChatbotContextType {
  isEnabled: boolean;
  enableChatbot: () => void;
  disableChatbot: () => void;
}

interface ChatbotSettings {
  enabled: boolean;
  welcome_message: string;
  theme_color: string;
  position: string;
}

const ChatbotContext = createContext<ChatbotContextType>({
  isEnabled: true,
  enableChatbot: () => {},
  disableChatbot: () => {},
});

export const useChatbot = () => useContext(ChatbotContext);

interface ChatbotProviderProps {
  children: React.ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchChatbotSettings = async () => {
      try {
        // Using 'any' cast here to bypass TypeScript issue until types are regenerated
        const { data, error } = await (supabase
          .from('chatbot_settings') as any)
          .select('enabled')
          .eq('id', 'default')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching chatbot settings:", error);
          return;
        }
        
        // If we have settings, use them, otherwise default to enabled
        setIsEnabled(data?.enabled ?? true);
      } catch (error) {
        console.error("Error fetching chatbot settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchChatbotSettings();
    
    // Listen for real-time changes to settings
    const channel = supabase
      .channel('chatbot-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbot_settings',
          filter: 'id=eq.default'
        },
        (payload: any) => {
          setIsEnabled(payload.new.enabled);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const enableChatbot = () => {
    setIsEnabled(true);
  };

  const disableChatbot = () => {
    setIsEnabled(false);
  };

  const contextValue = {
    isEnabled,
    enableChatbot,
    disableChatbot,
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
      {isLoaded && isEnabled && <ChatbotWidget />}
    </ChatbotContext.Provider>
  );
};
