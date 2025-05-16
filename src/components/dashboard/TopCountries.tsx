
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

interface CountryItem {
  country: string;
  visits: number;
}

interface TopCountriesProps {
  countries: CountryItem[];
}

const TopCountries = ({ countries }: TopCountriesProps) => {
  // Calculate max visits for relative bar widths
  const maxVisits = Math.max(...countries.map(c => c.visits), 1);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Top Countries</h2>
      <div className="space-y-4">
        {countries.map((country, index) => (
          <div key={country.country} className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span>{country.country}</span>
              </div>
              <span className="font-semibold">{country.visits.toLocaleString()} visits</span>
            </div>
            <motion.div 
              className="h-1.5 bg-primary/20 rounded-full w-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(country.visits / maxVisits) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopCountries;
