
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface CountryItem {
  country: string;
  visits: number;
}

interface TopCountriesProps {
  countries: CountryItem[];
}

const TopCountries = ({ countries }: TopCountriesProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Top Countries</h2>
      <div className="space-y-4">
        {countries.map((country) => (
          <div key={country.country} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span>{country.country}</span>
            </div>
            <span className="font-semibold">{country.visits.toLocaleString()} visits</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopCountries;
