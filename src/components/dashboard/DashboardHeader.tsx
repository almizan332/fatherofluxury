
import TimeRangeSelector from "./TimeRangeSelector";
import { useChatbot } from "@/components/chatbot/ChatbotProvider";

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
        <p className="text-muted-foreground">
          Welcome back, Admin {isEnabled && <span className="text-xs text-green-500">(Chatbot: Active)</span>}
        </p>
      </div>
      <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
    </div>
  );
};

export default DashboardHeader;
