
import { useEffect, useState, useCallback, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { X, Pause, Play } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const AutoScroll = () => {
  const { settings, setSettings } = useAppContext();
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Use requestAnimationFrame for smoother scrolling
  const scrollAnimationRef = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);
  
  // Smoothly scroll the page using requestAnimationFrame
  const smoothScroll = useCallback(() => {
    if (!settings.autoScrollEnabled || isPaused) {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
      return;
    }

    const now = performance.now();
    const elapsed = now - lastScrollTime.current;
    
    // Limit scrolling to 60fps for smoothness
    if (elapsed > 16) { // ~60fps (1000ms / 60 ≈ 16.67ms)
      const scrollAmount = settings.autoScrollDirection === "down" ? 1 : -1;
      
      // Calculate a frame-rate independent scrolling amount
      const scrollPixels = (settings.autoScrollSpeed * elapsed) / 100;
      
      window.scrollBy({
        top: scrollAmount * scrollPixels,
        left: 0,
        behavior: 'auto' // Use auto instead of smooth for better control
      });
      
      lastScrollTime.current = now;
    }
    
    // Continue the animation loop
    scrollAnimationRef.current = requestAnimationFrame(smoothScroll);
  }, [settings.autoScrollEnabled, settings.autoScrollDirection, settings.autoScrollSpeed, isPaused]);

  // Setup the autoscroll using requestAnimationFrame for smoother scrolling
  useEffect(() => {
    if (settings.autoScrollEnabled && !isPaused) {
      lastScrollTime.current = performance.now();
      scrollAnimationRef.current = requestAnimationFrame(smoothScroll);
    }
    
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [settings.autoScrollEnabled, settings.autoScrollDirection, settings.autoScrollSpeed, isPaused, smoothScroll]);
  
  // Handle mouse movement or touch to show controls
  useEffect(() => {
    if (!settings.autoScrollEnabled) return;
    
    const showControls = () => {
      setIsControlsVisible(true);
      
      // Clear any existing timeout
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      
      // Set a new timeout to hide controls after 3 seconds
      const timeout = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
      
      hideTimeout.current = timeout;
    };
    
    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls);
    
    // Initial timeout to hide controls
    showControls();
    
    return () => {
      window.removeEventListener("mousemove", showControls);
      window.removeEventListener("touchstart", showControls);
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [settings.autoScrollEnabled]);
  
  if (!settings.autoScrollEnabled) return null;
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const disableAutoScroll = () => {
    setSettings(prev => ({
      ...prev,
      autoScrollEnabled: false
    }));
  };
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex justify-center">
        <div className="bg-background/80 backdrop-blur-sm shadow-md rounded-b-lg px-3 py-2 flex items-center gap-2 border border-t-0">
          <span className="text-sm font-medium">
            {isPaused ? t("autoScroll.paused") : t("autoScroll.scrolling")} ({settings.autoScrollDirection === "down" ? t("autoScroll.down") : t("autoScroll.up")})
          </span>
          
          <Button size="icon" variant="ghost" onClick={togglePause} className="h-8 w-8">
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          
          <Button size="icon" variant="ghost" onClick={disableAutoScroll} className="h-8 w-8 text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutoScroll;
