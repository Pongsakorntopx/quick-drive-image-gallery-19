
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Download, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "./QRCode";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, settings, setIsSlideshowOpen, photos } = useAppContext();
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Sources to try for the full image, in order of preference
  const getImageSources = (photoId: string) => [
    `https://lh3.googleusercontent.com/d/${photoId}?t=${Date.now()}`,
    `https://drive.google.com/uc?export=view&id=${photoId}&t=${Date.now()}`,
    `https://drive.google.com/thumbnail?id=${photoId}&sz=w2000`,
  ];

  useEffect(() => {
    // Reset states when a new photo is selected
    if (selectedPhoto) {
      setIsImageLoading(true);
      setImageError(false);
      setCurrentUrlIndex(0);
      const sources = getImageSources(selectedPhoto.id);
      setCurrentImageUrl(sources[0]);
    }
  }, [selectedPhoto]);

  const handleDownload = () => {
    if (selectedPhoto) {
      try {
        const link = document.createElement("a");
        // Use the direct download URL for better experience
        const downloadUrl = selectedPhoto.directDownloadUrl || selectedPhoto.webContentLink;
        
        link.href = downloadUrl;
        link.download = selectedPhoto.name;
        link.target = "_blank"; // Opens in a new tab if direct download isn't supported
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "ดาวน์โหลดเริ่มต้นแล้ว",
          description: `กำลังดาวน์โหลด ${selectedPhoto.name}`
        });
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดาวน์โหลดรูปภาพได้",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  };

  const handleStartSlideshow = () => {
    setIsSlideshowOpen(true);
    setSelectedPhoto(null);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    if (selectedPhoto) {
      const sources = getImageSources(selectedPhoto.id);
      const nextIndex = currentUrlIndex + 1;
      
      if (nextIndex < sources.length) {
        // Try the next URL in the list
        setCurrentUrlIndex(nextIndex);
        setCurrentImageUrl(sources[nextIndex]);
        console.log(`Trying next image URL: ${sources[nextIndex]}`);
      } else {
        setIsImageLoading(false);
        setImageError(true);
        console.error("All image URLs failed to load");
      }
    }
  };

  // Navigate to the next photo in the gallery
  const navigateNext = () => {
    if (!selectedPhoto || photos.length <= 1) return;
    
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  };

  // Navigate to the previous photo in the gallery
  const navigatePrevious = () => {
    if (!selectedPhoto || photos.length <= 1) return;
    
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (e.key === "ArrowRight") {
        navigateNext();
      } else if (e.key === "ArrowLeft") {
        navigatePrevious();
      } else if (e.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto, photos]);

  // Touch gesture handling for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50; // Min distance for a swipe
    
    if (isSwipe) {
      if (distance > 0) {
        // Swiped left -> next photo
        navigateNext();
      } else {
        // Swiped right -> previous photo
        navigatePrevious();
      }
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background/90 backdrop-blur-modal">
        <DialogHeader className="absolute top-2 right-2 z-50">
          <Button variant="outline" size="icon" onClick={() => setSelectedPhoto(null)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-4 h-full">
          <div className="col-span-3 h-full relative"
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={handleTouchEnd}>
               
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full h-12 w-12 border-4 border-t-transparent border-primary animate-spin"></div>
                </div>
              )}
              
              {imageError ? (
                <div className="text-center p-4">
                  <p className="text-destructive mb-2">ไม่สามารถโหลดรูปภาพได้</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (selectedPhoto) {
                        setIsImageLoading(true);
                        setImageError(false);
                        setCurrentUrlIndex(0);
                        const sources = getImageSources(selectedPhoto.id);
                        setCurrentImageUrl(sources[0]);
                      }
                    }}
                  >
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : (
                selectedPhoto && (
                  <img 
                    key={`${currentImageUrl}`}
                    src={currentImageUrl}
                    alt={selectedPhoto.name} 
                    className="max-w-full max-h-full object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy" // Lazy load for performance
                  />
                )
              )}
              
              {/* Navigation arrows - visible on all screen sizes */}
              {photos.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10"
                    onClick={navigatePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10"
                    onClick={navigateNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6 flex flex-col h-full bg-background overflow-y-auto">
            <DialogTitle className={`mb-2 ${settings.font.class} text-lg md:text-xl`} style={{fontSize: `${settings.fontSize.subtitle}px`}}>
              {selectedPhoto?.name}
            </DialogTitle>
            
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="font-semibold">วันที่สร้าง:</span> {selectedPhoto?.createdTime && formatDate(selectedPhoto.createdTime)}
              </div>
              <div>
                <span className="font-semibold">แก้ไขล่าสุด:</span> {selectedPhoto?.modifiedTime && formatDate(selectedPhoto.modifiedTime)}
              </div>
            </div>
            
            <div className="flex justify-center mt-4 md:mt-6">
              <QRCode 
                url={selectedPhoto?.directDownloadUrl || selectedPhoto?.webContentLink || ''} 
                size={Math.min(settings.qrCodeSize * 2, 180)} 
              />
            </div>
            
            <div className="mt-4 md:mt-6 space-y-2">
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" /> ดาวน์โหลด
              </Button>
              <Button onClick={handleStartSlideshow} variant="outline" className="w-full">
                <Play className="mr-2 h-4 w-4" /> เริ่มสไลด์โชว์
              </Button>
            </div>
            
            {/* Photo navigation with text buttons */}
            {photos.length > 1 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={navigatePrevious}
                  className="text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> รูปก่อนหน้า
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={navigateNext}
                  className="text-xs"
                >
                  รูปถัดไป <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
