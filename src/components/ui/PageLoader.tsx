import { memo } from 'react';

const PageLoader = memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        
        {/* Pulsing center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-primary/60 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

export default PageLoader;
