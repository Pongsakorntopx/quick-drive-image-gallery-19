
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { X, Pause, Play } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const AutoScroll = () => {
  const { settings, setSettings } = useAppContext();
  const { t } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Setup the autoscroll
  useEffect(() => {
    if (!settings.autoScrollEnabled || isPaused) return;
    
    const interval = setInterval(() => {
      const scrollAmount = settings.autoScrollDirection === "down" ? 1 : -1;
      window.scrollBy(0, scrollAmount * settings.autoScrollSpeed);
    }, 100);
    
    return () => clearInterval(interval);
  }, [settings.autoScrollEnabled, settings.autoScrollDirection, settings.autoScrollSpeed, isPaused]);
  
  // Handle mouse movement or touch to show controls
  useEffect(() => {
    if (!settings.autoScrollEnabled) return;
    
    const showControls = () => {
      setIsControlsVisible(true);
      
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      // Set a new timeout to hide controls after 3 seconds
      const timeout = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
      
      setHideTimeout(timeout);
    };
    
    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls);
    
    // Initial timeout to hide controls
    showControls();
    
    return () => {
      window.removeEventListener("mousemove", showControls);
      window.removeEventListener("touchstart", showControls);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
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
