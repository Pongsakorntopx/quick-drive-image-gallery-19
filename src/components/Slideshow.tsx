
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Play, Pause, Shuffle, Settings, Volume2, ChevronLeft, ChevronRight, Music } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Music tracks for slideshow
const musicTracks = [
  { id: "none", name: "ไม่เปิดเพลง", url: null },
  { id: "track1", name: "เพลงผ่อนคลาย 1", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_5fa8942f4d.mp3" },
  { id: "track2", name: "เพลงผ่อนคลาย 2", url: "https://cdn.pixabay.com/download/audio/2021/11/01/audio_00fa5593f1.mp3" },
  { id: "track3", name: "เพลงผ่อนคลาย 3", url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_40ccf93084.mp3" },
  { id: "track4", name: "เพลงสดใส 1", url: "https://cdn.pixabay.com/download/audio/2021/05/24/audio_709b579e5c.mp3" },
  { id: "track5", name: "เพลงสดใส 2", url: "https://cdn.pixabay.com/download/audio/2022/01/13/audio_ebd4f1e58c.mp3" },
  { id: "track6", name: "เพลงสบาย 1", url: "https://cdn.pixabay.com/download/audio/2021/10/25/audio_efda2cc668.mp3" },
  { id: "track7", name: "เพลงสบาย 2", url: "https://cdn.pixabay.com/download/audio/2021/09/29/audio_645350d4cd.mp3" },
  { id: "track8", name: "เพลงเร็ว 1", url: "https://cdn.pixabay.com/download/audio/2021/11/29/audio_97cee2b295.mp3" },
  { id: "track9", name: "เพลงเร็ว 2", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_95e5aaa64a.mp3" },
  { id: "track10", name: "เพลงตื่นเต้น 1", url: "https://cdn.pixabay.com/download/audio/2022/01/16/audio_95e2dfd359.mp3" },
  { id: "track11", name: "เพลงตื่นเต้น 2", url: "https://cdn.pixabay.com/download/audio/2022/03/19/audio_1c21397613.mp3" },
  { id: "track12", name: "เพลงเศร้า 1", url: "https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4f1805c9.mp3" },
  { id: "track13", name: "เพลงเศร้า 2", url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_00e6f2a01d.mp3" },
  { id: "track14", name: "เพลงคลาสสิก 1", url: "https://cdn.pixabay.com/download/audio/2021/08/08/audio_0abb0a0f93.mp3" },
  { id: "track15", name: "เพลงคลาสสิก 2", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_ec5906c060.mp3" },
  { id: "track16", name: "เพลงโลกตะวันออก 1", url: "https://cdn.pixabay.com/download/audio/2022/01/27/audio_5889f919fa.mp3" },
  { id: "track17", name: "เพลงโลกตะวันออก 2", url: "https://cdn.pixabay.com/download/audio/2022/02/18/audio_d23ba9ada6.mp3" },
  { id: "track18", name: "เพลงชาวเขา 1", url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_3b2be608cc.mp3" },
  { id: "track19", name: "เพลงธรรมชาติ 1", url: "https://cdn.pixabay.com/download/audio/2021/11/04/audio_9ccbedc077.mp3" },
  { id: "track20", name: "เพลงธรรมชาติ 2", url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_97d59492a0.mp3" },
];

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
  const [selectedTrackId, setSelectedTrackId] = useState<string>("none");
  const [volume, setVolume] = useState<number>(50);
  const [slideSpeed, setSlideSpeed] = useState<number>(settings.slideShowSpeed);
  const [showQR, setShowQR] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(true); // Default to true
  const [remainingTime, setRemainingTime] = useState<number>(slideSpeed);
  const [shuffleIndices, setShuffleIndices] = useState<number[]>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(10); // seconds
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle track selection changes
  useEffect(() => {
    if (audioRef.current) {
      const selectedTrack = musicTracks.find(track => track.id === selectedTrackId);
      
      if (selectedTrack && selectedTrack.url) {
        audioRef.current.src = selectedTrack.url;
        audioRef.current.volume = volume / 100;
        
        if (isPlaying) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
          });
        }
      } else {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  }, [selectedTrackId, isPlaying]);

  // Handle auto-scroll
  useEffect(() => {
    if (!isSlideshowOpen) return;
    
    if (autoScroll) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    
    return () => {
      stopAutoScroll();
    };
  }, [autoScroll, autoScrollSpeed, isSlideshowOpen]);

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
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // Start or pause the slideshow
  const startSlideshow = () => {
    setIsPlaying(true);
    setRemainingTime(slideSpeed);
    
    // If we have audio, play it
    if (audioRef.current && selectedTrackId !== "none") {
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

  const startAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    
    // Convert seconds to milliseconds for interval
    autoScrollRef.current = setInterval(() => {
      // Scroll the page down by a small amount
      window.scrollBy({
        top: 50,
        behavior: "smooth"
      });
      
      // If we're at the bottom of the page, scroll back to top
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    }, autoScrollSpeed * 100); // Use smaller intervals for smoother scrolling
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
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

  const handleAutoScrollSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setAutoScrollSpeed(newSpeed);
    
    if (autoScroll) {
      stopAutoScroll();
      startAutoScroll();
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

  // Update the layout to have images on left and QR on right
  return (
    <Dialog open={isSlideshowOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-7xl w-screen h-screen p-0 max-h-screen overflow-hidden bg-black">
        <div className="relative w-full h-full">
          {/* Main slideshow view */}
          <div className="absolute inset-0 flex items-center justify-center">
            {photos.length > 0 && (
              <div className="flex w-full h-full">
                {/* Image display on the left side */}
                <div className="flex-1 h-full flex items-center justify-center">
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
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
                
                {/* QR Code display on the right side */}
                {showQR && photos.length > 0 && currentIndex >= 0 && (
                  <div className="w-1/4 h-full flex flex-col items-center justify-center p-4 border-l border-white/10 bg-black/50 backdrop-blur-md">
                    <div className="text-white mb-4 text-center">
                      <h3 className="text-lg font-medium mb-1 truncate max-w-xs">
                        {photos[currentIndex]?.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        สแกนเพื่อดาวน์โหลด
                      </p>
                    </div>
                    <QRCode 
                      url={photos[currentIndex]?.directDownloadUrl || photos[currentIndex]?.webContentLink || ''} 
                      size={settings.qrCodeSize} 
                      className="shadow-lg"
                    />
                    
                    <div className="mt-8 text-center">
                      <p className="text-sm text-white/50 mb-2">รูปภาพที่ {currentIndex + 1} จาก {photos.length}</p>
                      
                      {/* Track selection */}
                      <div className="max-w-xs mt-4">
                        <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                          <SelectTrigger className="bg-black/50 border-white/20 text-white">
                            <Music className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="เลือกเพลง" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            {musicTracks.map(track => (
                              <SelectItem key={track.id} value={track.id}>
                                {track.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
          
          {/* Auto-scroll indicator */}
          {autoScroll && (
            <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-1 rounded-full flex items-center space-x-2">
              <span>เลื่อนอัตโนมัติ</span>
              <Button 
                size="sm" 
                variant="outline"
                className="h-6 ml-2 bg-white/20 hover:bg-white/10 border-white/30"
                onClick={() => setAutoScroll(false)}
              >
                ปิด
              </Button>
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
                  <SheetContent className="bg-black/90 border-white/10 text-white">
                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">เลือกเพลงประกอบ</h3>
                        <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                          <SelectTrigger className="bg-black/50 border-white/20">
                            <SelectValue placeholder="เลือกเพลง" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            {musicTracks.map(track => (
                              <SelectItem key={track.id} value={track.id}>
                                {track.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            className="bg-white/20"
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
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">เลื่อนหน้าอัตโนมัติ</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant={autoScroll ? 'default' : 'outline'}
                            onClick={() => setAutoScroll(true)}
                          >
                            เปิด
                          </Button>
                          <Button
                            variant={!autoScroll ? 'default' : 'outline'}
                            onClick={() => setAutoScroll(false)}
                          >
                            ปิด
                          </Button>
                        </div>
                        
                        {autoScroll && (
                          <div className="flex items-center gap-4">
                            <span className="w-12 text-center">ช้า {autoScrollSpeed}</span>
                            <Slider
                              value={[autoScrollSpeed]}
                              min={1}
                              max={20}
                              step={1}
                              onValueChange={handleAutoScrollSpeedChange}
                              className="bg-white/20"
                            />
                            <span className="w-12 text-center">เร็ว</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose} 
                  className="text-white hover:bg-white/20 ml-2 z-50"
                >
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
                    className="w-24 bg-white/20" 
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
};

export default Slideshow;
