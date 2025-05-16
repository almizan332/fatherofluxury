
import TimeRangeSelector from "./TimeRangeSelector";
import { useChatbot } from "@/components/chatbot/ChatbotProvider";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  timeRange: '1d' | '1w' | '1m' | '1y';
  setTimeRange: (range: '1d' | '1w' | '1m' | '1y') => void;
}

const DashboardHeader = ({ timeRange, setTimeRange }: DashboardHeaderProps) => {
  const { isEnabled } = useChatbot();
  
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          Welcome back, Admin 
          <Link to="/dashboard/chatbot">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              <MessageSquare className="h-3 w-3" />
              Chatbot: {isEnabled ? 'Active' : 'Inactive'}
            </span>
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/dashboard/chatbot">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Manage Chatbot
          </Button>
        </Link>
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
      </div>
    </div>
  );
};

export default DashboardHeader;
