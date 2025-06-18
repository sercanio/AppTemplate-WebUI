import { Leaf } from 'lucide-react';

interface LoadingSplashProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSplash({ 
  message = "Loading...", 
  fullScreen = true 
}: LoadingSplashProps) {
  return (
    <div className={`
      ${fullScreen ? 'fixed inset-0 z-50' : 'relative h-64'}
      bg-background/80 backdrop-blur-sm
      flex items-center justify-center
      transition-opacity duration-300
    `}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-green to-steel-blue rounded-full flex items-center justify-center animate-pulse">
            <Leaf className="h-8 w-8 text-white animate-bounce" />
          </div>
          
          {/* Loading Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-steel-blue rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-steel-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-yellow-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-sunglow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
