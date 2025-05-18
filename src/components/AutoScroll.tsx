
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";

const AutoScroll: React.FC = () => {
  const { settings } = useAppContext();
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const [currentDirection, setCurrentDirection] = useState<"up" | "down">(settings.autoScrollDirection);
  
  useEffect(() => {
    if (!settings.autoScrollEnabled) return;
    
    // Reset direction when settings change
    setCurrentDirection(settings.autoScrollDirection);
    
    const scrollStep = (timestamp: number) => {
      // Throttle for smoother scrolling
      if (timestamp - lastScrollTimeRef.current > 16) { // ~60fps
        lastScrollTimeRef.current = timestamp;
        
        // Calculate how much to scroll based on speed
        const scrollDistance = settings.autoScrollSpeed;
        
        if (currentDirection === 'down') {
          window.scrollBy({ top: scrollDistance });
          
          // Check if we've reached the bottom
          if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            // Switch direction
            setCurrentDirection("up");
          }
        } else {
          window.scrollBy({ top: -scrollDistance });
          
          // Check if we've reached the top
          if (window.scrollY <= 10) {
            // Switch direction
            setCurrentDirection("down");
          }
        }
      }
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(scrollStep);

    // Cleanup function to cancel animation
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [settings.autoScrollEnabled, settings.autoScrollDirection, settings.autoScrollSpeed, currentDirection]);

  return null;
};

export default AutoScroll;
