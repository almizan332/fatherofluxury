
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface ChatbotWelcomeMessageProps {
  welcomeMessage: string;
  themeColor: string;
  position?: string;
}

const ChatbotWelcomeMessage = ({ 
  welcomeMessage, 
  themeColor,
  position = 'bottom-right'
}: ChatbotWelcomeMessageProps) => {
  
  // Determine the position class
  const getPositionClass = () => {
    switch(position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      
      <div className="border rounded-lg p-6 bg-background/50 relative h-[250px] overflow-hidden">
        <div 
          className={`absolute ${getPositionClass()} shadow-md transition-transform duration-200 transform scale-90 hover:scale-100 origin-bottom-right`}
        >
          {/* Chatbot bubble button */}
          <div 
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer mb-2"
            style={{ backgroundColor: themeColor }}
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          
          {/* Chat window */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[300px] overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="p-3 border-b flex items-center gap-3" style={{ backgroundColor: themeColor }}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Support Bot</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            
            <div className="p-3 h-[120px] bg-gray-50 dark:bg-gray-950 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg max-w-[80%] shadow-sm">
                <p className="text-sm">{welcomeMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatbotWelcomeMessage;
