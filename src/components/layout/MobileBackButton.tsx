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
      onClick={handleBack}
      className="fixed top-[72px] left-3 z-40 md:hidden 
        w-10 h-10 rounded-full 
        bg-background/90 
        backdrop-blur-sm shadow-lg 
        flex items-center justify-center
        border border-border/50"
      aria-label="Quay lại"
    >
      <ArrowLeft className="w-5 h-5 text-foreground" />
    </motion.button>
  );
};

export default MobileBackButton;
