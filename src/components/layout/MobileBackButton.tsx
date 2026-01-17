import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Root pages that don't need a back button
  const rootPages = ['/social', '/', '/auth', '/legal', '/investment'];
  
  // Don't show on root pages
  if (rootPages.includes(location.pathname)) return null;
  
  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/social'); // Default to home
    }
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleBack}
      className="fixed top-[4.5rem] sm:top-20 left-2 sm:left-4 z-40 md:hidden
        w-9 h-9 sm:w-10 sm:h-10 rounded-full 
        bg-background/95 
        backdrop-blur-md shadow-lg 
        flex items-center justify-center
        border border-border/50
        hover:bg-primary/10 hover:border-primary/30
        transition-colors duration-200
        touch-manipulation"
      aria-label="Quay lại"
    >
      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
    </motion.button>
  );
};

export default MobileBackButton;
