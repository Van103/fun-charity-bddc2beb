import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, UserPlus, LogIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuestMode } from '@/contexts/GuestModeContext';

const GuestAuthPromptModal = () => {
  const navigate = useNavigate();
  const { showAuthPrompt, closeAuthPrompt, authPromptMessage, exitGuestMode } = useGuestMode();

  const handleSignUp = () => {
    exitGuestMode();
    closeAuthPrompt();
    navigate('/auth?mode=signup');
  };

  const handleLogin = () => {
    exitGuestMode();
    closeAuthPrompt();
    navigate('/auth?mode=login');
  };

  return (
    <AnimatePresence>
      {showAuthPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthPrompt}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="relative w-full max-w-md bg-gradient-to-br from-background via-background to-primary/5 rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Close button */}
              <button
                onClick={closeAuthPrompt}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative p-8 pt-12 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
                >
                  <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tham gia FUN Charity
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-8"
                >
                  {authPromptMessage}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={handleSignUp}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Đăng ký ngay
                  </Button>

                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-2"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Đã có tài khoản? Đăng nhập
                  </Button>

                  <button
                    onClick={closeAuthPrompt}
                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tiếp tục xem với tư cách khách
                  </button>
                </motion.div>

                {/* Benefits hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 pt-6 border-t border-border/50"
                >
                  <p className="text-xs text-muted-foreground">
                    🎁 Thành viên được nhận điểm thưởng khi tương tác
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuestAuthPromptModal;
