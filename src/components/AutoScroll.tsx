
import { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";

const AutoScroll: React.FC = () => {
  const { settings } = useAppContext();
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!settings.autoScrollEnabled) return;

    const scrollStep = (timestamp: number) => {
      // Throttle for smoother scrolling
      if (timestamp - lastScrollTimeRef.current > 16) { // ~60fps
        lastScrollTimeRef.current = timestamp;
        
        // Calculate how much to scroll based on speed
        const scrollDistance = settings.autoScrollSpeed;
        
        if (settings.autoScrollDirection === 'down') {
          window.scrollBy({ top: scrollDistance });
        } else {
          window.scrollBy({ top: -scrollDistance });
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
  }, [settings.autoScrollEnabled, settings.autoScrollDirection, settings.autoScrollSpeed]);

  return null;
};

export default AutoScroll;
