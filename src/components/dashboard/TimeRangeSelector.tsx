
import { Button } from "@/components/ui/button";

interface TimeRangeSelectorProps {
  timeRange: '1d' | '1w' | '1m' | '1y';
  setTimeRange: (range: '1d' | '1w' | '1m' | '1y') => void;
}

const TimeRangeSelector = ({ timeRange, setTimeRange }: TimeRangeSelectorProps) => {
  return (
    <div className="space-x-2">
      <Button 
        variant={timeRange === '1d' ? 'default' : 'outline'} 
        onClick={() => setTimeRange('1d')}
      >
        1D
      </Button>
      <Button 
        variant={timeRange === '1w' ? 'default' : 'outline'} 
        onClick={() => setTimeRange('1w')}
      >
        1W
      </Button>
      <Button 
        variant={timeRange === '1m' ? 'default' : 'outline'} 
        onClick={() => setTimeRange('1m')}
      >
        1M
      </Button>
      <Button 
        variant={timeRange === '1y' ? 'default' : 'outline'} 
        onClick={() => setTimeRange('1y')}
      >
        1Y
      </Button>
    </div>
  );
};

export default TimeRangeSelector;
