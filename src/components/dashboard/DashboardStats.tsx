
import { Card } from "@/components/ui/card";
import { Globe, ShoppingBag, FileText, Boxes } from "lucide-react";

type StatItem = {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
};

interface DashboardStatsProps {
  stats: StatItem[];
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p className="text-sm text-green-500 mt-1">{stat.change}</p>
            </div>
            <stat.icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
