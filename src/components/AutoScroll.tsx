
import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/button';
import { X, ArrowDown, ArrowUp } from 'lucide-react';

const AutoScroll: React.FC = () => {
  const { settings } = useAppContext();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const documentHeight = useRef<number>(0);

  // Set initial state based on settings
  useEffect(() => {
    if (settings.autoScrollEnabled) {
      startScrolling();
    }
    
    return () => {
      stopScrolling();
    };
  }, [settings.autoScrollEnabled, settings.autoScrollDirection, settings.autoScrollSpeed]);

  // Calculate the document height and scroll position
  useEffect(() => {
    const updateDocumentHeight = () => {
      documentHeight.current = document.documentElement.scrollHeight - window.innerHeight;
    };

    const updateScrollProgress = () => {
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / documentHeight.current) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    // Update height on mount and resize
    updateDocumentHeight();
    updateScrollProgress();

    window.addEventListener('resize', updateDocumentHeight);
    window.addEventListener('scroll', updateScrollProgress);
    
    return () => {
      window.removeEventListener('resize', updateDocumentHeight);
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  const startScrolling = () => {
    if (intervalRef.current) return;
    
    setIsActive(true);
    startTimeRef.current = Date.now();
    documentHeight.current = document.documentElement.scrollHeight - window.innerHeight;
    
    // Speed factor: 21 - speed so that higher number = slower scroll
    const speed = 21 - settings.autoScrollSpeed; 
    const step = settings.autoScrollDirection === 'down' ? 1 : -1;
    
    intervalRef.current = setInterval(() => {
      window.scrollBy({
        top: step,
        behavior: 'auto'
      });
      
      const currentScroll = window.scrollY;
      
      // Reset to top or bottom when reached the end
      if (settings.autoScrollDirection === 'down' && currentScroll >= documentHeight.current - 5) {
        window.scrollTo({
          top: 0,
          behavior: 'auto'
        });
      } else if (settings.autoScrollDirection === 'up' && currentScroll <= 0) {
        window.scrollTo({
          top: documentHeight.current,
          behavior: 'auto'
        });
      }
    }, speed * 5); // Adjust timing based on speed setting
  };

  const stopScrolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    startTimeRef.current = null;
  };

  const toggleScrolling = () => {
    if (isActive) {
      stopScrolling();
    } else {
      startScrolling();
    }
  };

  if (!settings.autoScrollEnabled && !isActive) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
        <div className="flex items-center gap-1">
          {settings.autoScrollDirection === 'down' ? (
            <ArrowDown className="h-4 w-4 animate-bounce" />
          ) : (
            <ArrowUp className="h-4 w-4 animate-bounce" />
          )}
          <span className="text-sm">เลื่อนอัตโนมัติ</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full hover:bg-white/20 text-white"
          onClick={toggleScrolling}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">ปิดการเลื่อนอัตโนมัติ</span>
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="w-32 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AutoScroll;
