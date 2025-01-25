import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-semibold gradient-text"
          >
            Father of Luxury
          </motion.div>
        </Link>
        <nav className="flex items-center space-x-6 text-sm">
          <Link to="/" className="transition-colors hover:text-foreground/80">Home</Link>
          <Link to="/categories" className="transition-colors hover:text-foreground/80">Categories</Link>
          <Link to="/blog" className="transition-colors hover:text-foreground/80">Blog</Link>
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
    </header>
  );
};

export default Navbar;