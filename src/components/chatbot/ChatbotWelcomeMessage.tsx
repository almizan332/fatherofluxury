
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface ChatbotWelcomeMessageProps {
  welcomeMessage: string;
  themeColor: string;
}

const ChatbotWelcomeMessage = ({ welcomeMessage, themeColor }: ChatbotWelcomeMessageProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <div className="border rounded-lg p-6 max-w-md mx-auto bg-background shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: themeColor }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium">Support Bot</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg max-w-[80%]">
          <p className="text-sm">{welcomeMessage}</p>
        </div>
      </div>
    </Card>
  );
};

export default ChatbotWelcomeMessage;
