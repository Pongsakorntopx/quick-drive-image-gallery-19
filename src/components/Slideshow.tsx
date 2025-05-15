
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Play, Pause, SkipForward, SkipBack, Settings, Volume2, Shuffle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import QRCode from "./QRCode";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(50);
  const [slideSpeed, setSlideSpeed] = useState<number>(settings.slideShowSpeed);
  const [visualMode, setVisualMode] = useState<'normal' | 'beat'>('normal');
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(slideSpeed);
  const [playedIndices, setPlayedIndices] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize the slideshow
  useEffect(() => {
    if (isSlideshowOpen && photos.length > 0) {
      setCurrentIndex(0);
      setPlayedIndices([0]);
      
      // Always start playing when opened
      setIsPlaying(true);
      startSlideshow();
      
      toast({
        title: "สไลด์โชว์เริ่มต้นแล้ว",
        description: `กำลังแสดงรูปภาพทั้งหมด ${photos.length} รูป`
      });
    }
    
    return () => {
      stopAllTimers();
    };
  }, [isSlideshowOpen, photos.length]);

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

  // Set up audio context for visual effects
  useEffect(() => {
    if (audioRef.current && visualMode === 'beat' && isPlaying) {
      // Create AudioContext only if we're actually using it
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        
        startVisualAnalysis();
      } catch (error) {
        console.error("Error setting up audio analysis:", error);
        // Fallback to normal mode if audio analysis fails
        setVisualMode('normal');
        scheduleNextSlide();
        startProgressTimer();
      }
    } else if (visualMode === 'normal' && isPlaying) {
      // In normal mode, make sure we have timers running
      stopAllTimers();
      scheduleNextSlide();
      startProgressTimer();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visualMode, isPlaying, audioUrl]);

  const stopAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Start the audio visual analysis
  const startVisualAnalysis = () => {
    const analyzeAudio = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate the average volume
        const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
        
        // If the average volume is above a threshold, change the image
        if (avg > 130) {  // Adjust this threshold as needed
          goToNext();
        }
      }
      
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
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
    
    // Only schedule slides if we're in normal mode
    if (visualMode === 'normal') {
      scheduleNextSlide();
      startProgressTimer();
    } else if (visualMode === 'beat') {
      startVisualAnalysis();
    }
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

  const getNextRandomIndex = () => {
    // If all photos have been shown, reset played indices except current
    if (playedIndices.length >= photos.length) {
      setPlayedIndices([currentIndex]);
    }
    
    // Find indices that haven't been played yet
    const availableIndices = Array.from(
      { length: photos.length },
      (_, i) => i
    ).filter(i => !playedIndices.includes(i));
    
    // If there are no available indices, use any index except current
    if (availableIndices.length === 0) {
      const newIndex = Math.floor(Math.random() * (photos.length - 1));
      return newIndex >= currentIndex ? newIndex + 1 : newIndex;
    }
    
    // Pick a random index from available ones
    return availableIndices[Math.floor(Math.random() * availableIndices.length)];
  };

  const goToNext = () => {
    // Ensure we have photos to display
    if (photos.length === 0) return;
    
    let nextIndex;
    
    if (shuffleMode) {
      nextIndex = getNextRandomIndex();
      setPlayedIndices(prev => [...prev, nextIndex]);
    } else {
      nextIndex = (currentIndex + 1) % photos.length;
    }
    
    setCurrentIndex(nextIndex);
  };

  const goToPrev = () => {
    // Ensure we have photos to display
    if (photos.length === 0) return;
    
    if (shuffleMode) {
      // In shuffle mode, go to the last played photo if available
      const prevIndex = playedIndices.length > 1 
        ? playedIndices[playedIndices.length - 2]
        : (currentIndex - 1 + photos.length) % photos.length;
      
      setCurrentIndex(prevIndex);
      
      // Remove current from played indices
      setPlayedIndices(prev => prev.slice(0, -1));
    } else {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
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
    
    if (isPlaying && visualMode === 'normal') {
      stopAllTimers();
      scheduleNextSlide();
      startProgressTimer();
    }
  };

  const toggleShuffle = () => {
    setShuffleMode(prev => !prev);
    // When turning shuffle on, reset played indices
    if (!shuffleMode) {
      setPlayedIndices([currentIndex]);
    }
  };

  return (
    <Dialog open={isSlideshowOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-7xl w-screen h-screen p-0 max-h-screen overflow-hidden bg-black">
        <div className="relative w-full h-full">
          {/* Main slideshow view */}
          <div className="absolute inset-0 flex items-center justify-center">
            {photos.length > 0 && (
              <div className="relative w-full h-full">
                {photos[currentIndex] && (
                  <img 
                    src={photos[currentIndex].url} 
                    alt={photos[currentIndex].name || `Image ${currentIndex + 1}`} 
                    className="w-full h-full object-contain"
                  />
                )}
                
                {showQR && photos[currentIndex] && (
                  <div className="absolute bottom-8 right-8">
                    <QRCode 
                      url={photos[currentIndex].directDownloadUrl || photos[currentIndex].webContentLink || ''} 
                      size={180} 
                    />
                  </div>
                )}
                
                {/* Image counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {currentIndex + 1} / {photos.length}
                </div>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          {visualMode === 'normal' && isPlaying && (
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
                        <h3 className="text-lg font-medium mb-2">โหมดแสดงภาพ</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={visualMode === 'normal' ? 'default' : 'outline'}
                            onClick={() => setVisualMode('normal')}
                          >
                            ปกติ
                          </Button>
                          <Button
                            variant={visualMode === 'beat' ? 'default' : 'outline'}
                            onClick={() => setVisualMode('beat')}
                          >
                            ตามจังหวะเพลง
                          </Button>
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
                  <SkipBack className="h-5 w-5" />
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
                  <SkipForward className="h-5 w-5" />
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
};

export default Slideshow;
