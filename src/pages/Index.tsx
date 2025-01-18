import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gradient-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
          Ali Hidden
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-300">
          Software Engineer
        </p>
        
        <div className="flex gap-6 items-center justify-center">
          <a
            href="https://twitter.com/alihidden"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transform hover:scale-110 transition-all duration-300"
          >
            Twitter
          </a>
          <a
            href="https://github.com/alihidden"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transform hover:scale-110 transition-all duration-300"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/alihidden"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transform hover:scale-110 transition-all duration-300"
          >
            LinkedIn
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;