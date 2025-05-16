
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Play, Pause, Shuffle, Settings, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import QRCode from "./QRCode";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";

const Slideshow: React.FC = () => {
  const {
    photos,
    isSlideshowOpen,
    setIsSlideshowOpen,
    isPlaying,
    setIsPlaying,
    settings,
    currentAudio,
    setCurrentAudio
  } = useAppContext();

  // Carousel control
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Audio and settings
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(50);
  const [slideSpeed, setSlideSpeed] = useState<number>(settings.slideShowSpeed);
  const [showQR, setShowQR] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(true); // Default to true
  const [remainingTime, setRemainingTime] = useState<number>(slideSpeed);
  const [shuffleIndices, setShuffleIndices] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set the transition class based on settings
  const getTransitionClass = () => {
    switch (settings.slideShowEffect) {
      case 'fade':
        return 'transition-opacity duration-500';
      case 'slide':
        return 'transition-transform duration-500';
      case 'zoom':
        return 'transition-transform duration-500 transform-gpu';
      default:
        return '';
    }
  };

  // Get the enter animation class
  const getEnterClass = (isActive: boolean) => {
    if (!isActive) return 'opacity-0';
    
    switch (settings.slideShowEffect) {
      case 'fade':
        return 'opacity-100';
      case 'slide':
        return 'translate-x-0';
      case 'zoom':
        return 'scale-100';
      default:
        return '';
    }
  };

  // Get the exit animation class
  const getExitClass = (isActive: boolean) => {
    if (isActive) return '';
    
    switch (settings.slideShowEffect) {
      case 'fade':
        return 'opacity-0';
      case 'slide':
        return '-translate-x-full';
      case 'zoom':
        return 'scale-90';
      default:
        return '';
    }
  };

  // Initialize the slideshow
  useEffect(() => {
    if (isSlideshowOpen && photos.length > 0) {
      // Initialize shuffle indices if needed
      if (shuffleMode && shuffleIndices.length === 0) {
        initializeShuffleIndices();
      }
      
      // Always start playing when opened
      setIsPlaying(true);
      
      toast({
        title: "สไลด์โชว์เริ่มต้นแล้ว",
        description: `กำลังแสดงรูปภาพทั้งหมด ${photos.length} รูป`
      });
    }
    
    return () => {
      stopAllTimers();
    };
  }, [isSlideshowOpen, photos.length]);

  // Effect for setting up the carousel API
  useEffect(() => {
    if (!carouselApi) return;

    // Set up carousel listeners
    const handleSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);

    // Return cleanup function
    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  // Effect for handling play/pause state changes
  useEffect(() => {
    if (isSlideshowOpen) {
      if (isPlaying) {
        startSlideshow();
      } else {
        pauseSlideshow();
      }
    }
  }, [isPlaying, isSlideshowOpen]);

  // Handle audio file change
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.volume = volume / 100;
      }

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);

  // Initialize shuffle indices
  const initializeShuffleIndices = () => {
    // Create array with all indices
    const indices = Array.from({ length: photos.length }, (_, i) => i);
    
    // Fisher-Yates shuffle algorithm
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    setShuffleIndices(indices);
  };

  const stopAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // Start or pause the slideshow
  const startSlideshow = () => {
    setIsPlaying(true);
    setRemainingTime(slideSpeed);
    
    // If we have audio, play it
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
      setCurrentAudio(audioRef.current);
    }
    
    scheduleNextSlide();
    startProgressTimer();
  };

  const pauseSlideshow = () => {
    setIsPlaying(false);
    stopAllTimers();
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const startProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    setRemainingTime(slideSpeed);
    progressTimerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0.1) return slideSpeed;
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);
  };

  const scheduleNextSlide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      goToNext();
      if (isPlaying) {
        scheduleNextSlide();
        startProgressTimer();
      }
    }, slideSpeed * 1000);
  };

  const goToNext = () => {
    if (!carouselApi || photos.length === 0) return;
    
    if (shuffleMode) {
      // If we haven't initialized shuffle indices yet, do so
      if (shuffleIndices.length === 0) {
        initializeShuffleIndices();
        return;
      }
      
      // Find current position in shuffle indices
      const currentShuffleIndex = shuffleIndices.findIndex(i => i === currentIndex);
      const nextShuffleIndex = (currentShuffleIndex + 1) % shuffleIndices.length;
      const nextIndex = shuffleIndices[nextShuffleIndex];
      
      carouselApi.scrollTo(nextIndex);
    } else {
      carouselApi.scrollNext();
    }
  };

  const goToPrev = () => {
    if (!carouselApi || photos.length === 0) return;
    
    if (shuffleMode) {
      // If we haven't initialized shuffle indices yet, do so
      if (shuffleIndices.length === 0) {
        initializeShuffleIndices();
        return;
      }
      
      // Find current position in shuffle indices
      const currentShuffleIndex = shuffleIndices.findIndex(i => i === currentIndex);
      const prevShuffleIndex = (currentShuffleIndex - 1 + shuffleIndices.length) % shuffleIndices.length;
      const prevIndex = shuffleIndices[prevShuffleIndex];
      
      carouselApi.scrollTo(prevIndex);
    } else {
      carouselApi.scrollPrev();
    }
  };

  const handleClose = () => {
    pauseSlideshow();
    setIsSlideshowOpen(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentAudio(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setAudioFile(files[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSlideSpeed(newSpeed);
    
    if (isPlaying) {
      stopAllTimers();
      scheduleNextSlide();
      startProgressTimer();
    }
  };

  const toggleShuffle = () => {
    const newShuffleMode = !shuffleMode;
    setShuffleMode(newShuffleMode);
    
    if (newShuffleMode && shuffleIndices.length === 0) {
      initializeShuffleIndices();
    }
  };

  const getQrCodePosition = () => {
    switch (settings.qrCodePosition) {
      case "bottomRight":
        return "bottom-8 right-8";
      case "bottomLeft":
        return "bottom-8 left-8";
      case "topRight":
        return "top-8 right-8";
      case "topLeft":
        return "top-8 left-8";
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      default:
        return "bottom-8 right-8";
    }
  };

  return (
    <Dialog open={isSlideshowOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-7xl w-screen h-screen p-0 max-h-screen overflow-hidden bg-black">
        <div className="relative w-full h-full">
          {/* Main slideshow view */}
          <div className="absolute inset-0 flex items-center justify-center">
            {photos.length > 0 && (
              <Carousel
                opts={{ 
                  loop: true, 
                  skipSnaps: true 
                }}
                className="w-full h-full"
                setApi={setCarouselApi}
              >
                <CarouselContent className="h-full">
                  {photos.map((photo, index) => (
                    <CarouselItem key={photo.id} className="h-full">
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={photo.url} 
                          alt={photo.name}
                          className={`max-w-full max-h-full object-contain ${getTransitionClass()} ${getEnterClass(index === currentIndex)} ${getExitClass(index === currentIndex)}`}
                        />
                        
                        {showQR && (
                          <div className={`absolute ${getQrCodePosition()}`}>
                            <QRCode 
                              url={photo.directDownloadUrl || photo.webContentLink || ''} 
                              size={settings.qrCodeSize} 
                            />
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
            
            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentIndex + 1} / {photos.length}
            </div>

            {/* Banner image if configured */}
            {settings.bannerUrl && (
              <div className={`absolute ${getBannerPosition()} ${getBannerSize()}`}>
                <img 
                  src={settings.bannerUrl} 
                  alt="Banner" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0">
              <div 
                className="h-1 bg-primary" 
                style={{ 
                  width: `${(1 - remainingTime / slideSpeed) * 100}%`, 
                  transition: 'width 0.1s linear' 
                }}
              ></div>
            </div>
          )}
          
          {/* Controls overlay */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
              <div className="text-white font-medium truncate max-w-2xl">
                {photos[currentIndex]?.name}
              </div>
              
              <div className="flex items-center gap-2">
                <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">เลือกเพลงประกอบ</h3>
                        <input 
                          type="file" 
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">ความเร็วในการเปลี่ยนภาพ (วินาที)</h3>
                        <div className="flex items-center gap-4">
                          <span className="w-6 text-center">{slideSpeed}</span>
                          <Slider
                            value={[slideSpeed]}
                            min={1}
                            max={10}
                            step={0.5}
                            onValueChange={handleSpeedChange}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">แสดง QR Code</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={showQR ? 'default' : 'outline'}
                            onClick={() => setShowQR(true)}
                          >
                            แสดง
                          </Button>
                          <Button
                            variant={!showQR ? 'default' : 'outline'}
                            onClick={() => setShowQR(false)}
                          >
                            ซ่อน
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={goToPrev} className="text-white hover:bg-white/20">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                {isPlaying ? (
                  <Button variant="ghost" size="icon" onClick={() => setIsPlaying(false)} className="text-white hover:bg-white/20">
                    <Pause className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => setIsPlaying(true)} className="text-white hover:bg-white/20">
                    <Play className="h-6 w-6" />
                  </Button>
                )}
                
                <Button variant="ghost" size="icon" onClick={goToNext} className="text-white hover:bg-white/20">
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleShuffle} 
                  className={`text-white hover:bg-white/20 ${shuffleMode ? 'bg-white/30' : ''}`}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
                
                <div className="ml-4 flex items-center">
                  <Volume2 className="h-4 w-4 text-white mr-2" />
                  <Slider 
                    value={[volume]} 
                    min={0} 
                    max={100} 
                    step={1}
                    className="w-24" 
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Audio element */}
        <audio ref={audioRef} loop />
      </DialogContent>
    </Dialog>
  );

  // Helper functions for banner positioning and sizing
  function getBannerPosition() {
    switch (settings.bannerPosition) {
      case "bottomLeft":
        return "bottom-8 left-8";
      case "bottomRight":
        return "bottom-8 right-8";
      case "topLeft":
        return "top-8 left-8";
      case "topRight":
        return "top-8 right-8";
      default:
        return "bottom-8 left-8";
    }
  }

  function getBannerSize() {
    switch (settings.bannerSize) {
      case "small":
        return "max-w-[100px] max-h-[100px]";
      case "medium":
        return "max-w-[200px] max-h-[200px]";
      case "large":
        return "max-w-[300px] max-h-[300px]";
      default:
        return "max-w-[200px] max-h-[200px]";
    }
  }
};

export default Slideshow;
