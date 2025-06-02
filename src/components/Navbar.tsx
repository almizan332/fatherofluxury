
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
    // Navigate to the subcategory page with search parameter
    navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as any);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#1A1F2C] to-[#403E43] shadow-lg">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4"
      >
        {/* Left section with menu and logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Mobile Menu */}
          <Drawer>
            <DrawerTrigger className="block sm:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </DrawerTrigger>
            <DrawerContent className="bg-[#1A1F2C]">
              <div className="p-4 space-y-2">
                <nav className="flex flex-col space-y-2">
                  <Link to="/" className="text-lg hover:text-[#9b87f5] transition-colors text-center py-2">Home</Link>
                  <Link to="/categories" className="text-lg hover:text-[#9b87f5] transition-colors text-center py-2">Categories</Link>
                  <Link to="/blog" className="text-lg hover:text-[#9b87f5] transition-colors text-center py-2">Blog</Link>
                  <a 
                    href="https://t.me/+pcnB8fU7jwo0MmNl" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg hover:text-[#9b87f5] transition-colors text-center py-2"
                  >
                    Telegram
                  </a>
                  <a 
                    href="https://wa.link/lbeu86" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg hover:text-[#9b87f5] transition-colors text-center py-2"
                  >
                    Contact
                  </a>
                </nav>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold gradient-text whitespace-nowrap"
            >
              Father of Luxury
            </motion.div>
          </Link>
        </div>

        {/* Center navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center justify-center space-x-4 lg:space-x-6 text-sm font-medium flex-1">
          <Link to="/" className="hover:text-[#9b87f5] transition-colors duration-300 whitespace-nowrap">Home</Link>
          <Link to="/categories" className="hover:text-[#9b87f5] transition-colors duration-300 whitespace-nowrap">Categories</Link>
          <Link to="/blog" className="hover:text-[#9b87f5] transition-colors duration-300 whitespace-nowrap">Blog</Link>
          <a 
            href="https://t.me/+pcnB8fU7jwo0MmNl" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#9b87f5] transition-colors duration-300 whitespace-nowrap"
          >
            Telegram
          </a>
          <a 
            href="https://wa.link/lbeu86" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#9b87f5] transition-colors duration-300 whitespace-nowrap"
          >
            Contact
          </a>
        </nav>

        {/* Search form - Improved responsiveness */}
        <div className="flex-shrink-0 w-24 xs:w-32 sm:w-40 md:w-48 lg:w-64">
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pr-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 text-xs sm:text-sm h-8 sm:h-10"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;
