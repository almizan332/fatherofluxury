
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="mr-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold gradient-text whitespace-nowrap"
            >
              Father of Luxury
            </motion.div>
          </Link>
          <nav className="hidden sm:flex items-center space-x-6 text-sm">
            <Link to="/" className="transition-colors hover:text-foreground/80">Home</Link>
            <Link to="/categories" className="transition-colors hover:text-foreground/80">Categories</Link>
            <Link to="/blog" className="transition-colors hover:text-foreground/80">Blog</Link>
            <Link to="/login" className="transition-colors hover:text-foreground/80">Login</Link>
            <a 
              href="https://t.me/+pcnB8fU7jwo0MmNl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-colors hover:text-foreground/80"
            >
              Telegram
            </a>
            <a 
              href="https://wa.link/lbeu86" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-colors hover:text-foreground/80"
            >
              Contact
            </a>
          </nav>
        </div>
        
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Input
            type="search"
            placeholder="Search products..."
            className="w-[150px] xs:w-[200px] md:w-[300px] pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
