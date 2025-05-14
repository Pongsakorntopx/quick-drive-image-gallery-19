
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Play, Pause, SkipForward, SkipBack, Settings, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import QRCode from "./QRCode";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [showQR, setShowQR] = useState<boolean>(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize the slideshow
  useEffect(() => {
    if (isSlideshowOpen && photos.length > 0) {
      setCurrentIndex(0);
      startSlideshow();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSlideshowOpen, photos.length]);

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
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visualMode, isPlaying, audioUrl]);

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
      
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Start or pause the slideshow
  const startSlideshow = () => {
    setIsPlaying(true);
    
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setCurrentAudio(audioRef.current);
    }
    
    if (visualMode === 'normal') {
      scheduleNextSlide();
    }
  };

  const pauseSlideshow = () => {
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const scheduleNextSlide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      goToNext();
      if (isPlaying) {
        scheduleNextSlide();
      }
    }, slideSpeed * 1000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      scheduleNextSlide();
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
                <img 
                  src={photos[currentIndex].url} 
                  alt={photos[currentIndex].name} 
                  className="w-full h-full object-contain"
                />
                
                {showQR && (
                  <div className="absolute bottom-8 right-8">
                    <QRCode url={photos[currentIndex].webContentLink} size={180} />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goToPrev}>
                <SkipBack className="h-5 w-5 text-white" />
              </Button>
              
              {isPlaying ? (
                <Button variant="ghost" size="icon" onClick={pauseSlideshow}>
                  <Pause className="h-5 w-5 text-white" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={startSlideshow}>
                  <Play className="h-5 w-5 text-white" />
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={goToNext}>
                <SkipForward className="h-5 w-5 text-white" />
              </Button>
              
              <div className="ml-4 flex items-center">
                <Volume2 className="h-5 w-5 text-white mr-2" />
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
            
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5 text-white" />
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
              
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5 text-white" />
              </Button>
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
