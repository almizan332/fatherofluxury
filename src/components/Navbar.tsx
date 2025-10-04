
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Menu } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "./ui/drawer";

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
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1A1F2C] to-[#403E43] shadow-lg">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container flex h-16 items-center justify-between"
      >
        {/* Left section with menu and logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Drawer>
            <DrawerTrigger className="block sm:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="h-5 w-5" />
            </DrawerTrigger>
            <DrawerContent className="bg-[#1A1F2C]">
              <div className="p-4 space-y-2">
                <nav className="flex flex-col space-y-2">
                  <Link to="/" className="text-lg hover:text-[#9b87f5] transition-colors text-center">Home</Link>
                  <Link to="/categories" className="text-lg hover:text-[#9b87f5] transition-colors text-center">Categories</Link>
                  <Link to="/blog" className="text-lg hover:text-[#9b87f5] transition-colors text-center">Blog</Link>
                  <Link to="/reviews" className="text-lg hover:text-[#9b87f5] transition-colors text-center">Reviews</Link>
                  <a 
                    href="https://t.me/+pcnB8fU7jwo0MmNl" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg hover:text-[#9b87f5] transition-colors text-center"
                  >
                    Telegram
                  </a>
                  <a 
                    href="https://wa.link/lbeu86" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg hover:text-[#9b87f5] transition-colors text-center"
                  >
                    Contact
                  </a>
                </nav>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Logo */}
          <Link to="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              className="text-sm xs:text-base sm:text-lg md:text-xl font-bold gradient-text whitespace-nowrap"
            >
              Father of Luxury
            </motion.div>
          </Link>
        </div>

        {/* Center navigation */}
        <nav className="hidden sm:flex items-center justify-center space-x-6 text-sm font-medium flex-1">
          <Link to="/" className="hover:text-[#9b87f5] transition-colors duration-300">Home</Link>
          <Link to="/categories" className="hover:text-[#9b87f5] transition-colors duration-300">Categories</Link>
          <Link to="/blog" className="hover:text-[#9b87f5] transition-colors duration-300">Blog</Link>
          <Link to="/reviews" className="hover:text-[#9b87f5] transition-colors duration-300">Reviews</Link>
          <a 
            href="https://t.me/+pcnB8fU7jwo0MmNl" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#9b87f5] transition-colors duration-300"
          >
            Telegram
          </a>
          <a 
            href="https://wa.link/lbeu86" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#9b87f5] transition-colors duration-300"
          >
            Contact
          </a>
        </nav>

        {/* Search form */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Input
            type="search"
            placeholder="Search..."
            className="w-[120px] xs:w-[200px] md:w-[300px] pr-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </header>
  );
};

export default Navbar;
