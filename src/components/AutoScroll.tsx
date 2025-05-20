
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  Pause,
  Play,
  Settings
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AutoScroll: React.FC = () => {
  const { settings } = useAppContext();
  const [isScrolling, setIsScrolling] = useState(settings.autoScrollEnabled);
  const [scrollSpeed, setScrollSpeed] = useState(settings.autoScrollSpeed);
  const [smoothness, setSmoothness] = useState(50);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">(settings.autoScrollDirection as "up" | "down");
  
  const scrollRef = useRef<number | null>(null);
  const isPausedRef = useRef<boolean>(!isScrolling);

  // Function to handle continuous scrolling with smoothness control
  const handleScroll = () => {
    if (isPausedRef.current) return;
    
    // Calculate scroll step size based on speed and smoothness
    // Higher smoothness means smaller step size but more frequent intervals
    const stepSize = scrollSpeed / (smoothness / 10);
    
    // Calculate scroll interval based on smoothness
    // Higher smoothness means more frequent updates
    const interval = Math.max(5, 100 - smoothness);
    
    // Perform scroll and set new timeout
    window.scrollBy({
      top: scrollDirection === "down" ? stepSize : -stepSize,
      behavior: "auto", // Use auto instead of smooth for better performance
    });
    
    // Continue scrolling
    scrollRef.current = window.setTimeout(handleScroll, interval);
  };

  // Start or stop auto scrolling based on isScrolling state
  useEffect(() => {
    isPausedRef.current = !isScrolling;
    
    if (isScrolling) {
      scrollRef.current = window.setTimeout(handleScroll, 100);
    } else if (scrollRef.current) {
      clearTimeout(scrollRef.current);
    }
    
    return () => {
      if (scrollRef.current) {
        clearTimeout(scrollRef.current);
      }
    };
  }, [isScrolling, scrollSpeed, smoothness, scrollDirection]);

  // Toggle scroll direction
  const toggleDirection = () => {
    setScrollDirection(prev => prev === "down" ? "up" : "down");
  };

  // Toggle scrolling on/off
  const toggleScrolling = () => {
    setIsScrolling(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-20">
      {settings.autoScrollEnabled && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full shadow-md bg-background/70 backdrop-blur-sm hover:bg-background"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" side="top">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">การเลื่อนอัตโนมัติ</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scroll-speed">ความเร็ว</Label>
                    <span className="text-xs text-muted-foreground">{scrollSpeed}</span>
                  </div>
                  <Slider 
                    id="scroll-speed"
                    min={1} 
                    max={30} 
                    step={1} 
                    value={[scrollSpeed]} 
                    onValueChange={(values) => setScrollSpeed(values[0])} 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scroll-smoothness">ความลื่นไหล</Label>
                    <span className="text-xs text-muted-foreground">{smoothness}%</span>
                  </div>
                  <Slider 
                    id="scroll-smoothness"
                    min={10} 
                    max={90} 
                    step={10} 
                    value={[smoothness]} 
                    onValueChange={(values) => setSmoothness(values[0])} 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-scroll"
                    checked={isScrolling}
                    onCheckedChange={setIsScrolling}
                  />
                  <Label htmlFor="auto-scroll">เปิดใช้งาน</Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-md bg-background/70 backdrop-blur-sm hover:bg-background"
            onClick={toggleDirection}
          >
            {scrollDirection === "down" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-md bg-background/70 backdrop-blur-sm hover:bg-background"
            onClick={toggleScrolling}
          >
            {isScrolling ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default AutoScroll;
