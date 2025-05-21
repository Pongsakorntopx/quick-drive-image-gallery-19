
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import QRCode from "./QRCode";
import { useTranslation } from "../hooks/useTranslation";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, photos, settings, notificationsEnabled } = useAppContext();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"standard" | "carousel">("standard");
  const isMobile = useIsMobile();
  
  // Carousel embla ref
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
  useEffect(() => {
    if (selectedPhoto) {
      const index = photos.findIndex(photo => photo.id === selectedPhoto.id);
      if (index !== -1) {
        setCurrentPhotoIndex(index);
        
        // Slide to this photo in carousel mode
        if (emblaApi && viewMode === "carousel") {
          emblaApi.scrollTo(index);
        }
      }
    }
  }, [selectedPhoto, photos, emblaApi, viewMode]);
  
  // Use carousel on mobile by default
  useEffect(() => {
    setViewMode(isMobile ? "carousel" : "standard");
  }, [isMobile]);

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentPhotoIndex + 1]);
    } else {
      setSelectedPhoto(photos[0]); // Loop back to the first photo
    }
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(photos[currentPhotoIndex - 1]);
    } else {
      setSelectedPhoto(photos[photos.length - 1]); // Loop to the last photo
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          setSelectedPhoto(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhotoIndex, photos, selectedPhoto]);
  
  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === "standard" ? "carousel" : "standard");
  };
  
  // Handle download
  const handleDownload = () => {
    if (!selectedPhoto) return;
    
    try {
      const downloadUrl = selectedPhoto.directDownloadUrl || selectedPhoto.webContentLink;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = selectedPhoto.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (notificationsEnabled) {
        // Toast is not shown here as it's handled in ImageCard
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  if (!selectedPhoto) {
    return null;
  }

  const photoUrl = selectedPhoto.fullSizeUrl || selectedPhoto.url;

  // Standard view mode
  if (viewMode === "standard") {
    return (
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-2 shadow-xl">
          <div className="relative flex flex-col w-full h-full p-2 md:p-4">
            {/* Controls */}
            <div className="absolute top-2 right-2 z-50 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Image name/caption */}
            <div className="text-center mb-2 font-semibold">
              {selectedPhoto.name}
            </div>
            
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {/* Main content container with animation */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-black/10 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-lg w-full h-full animate-scale-in">
                {/* Image container - adjusted to be on left side */}
                <div className="md:w-3/5 h-full flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={photoUrl}
                    alt={selectedPhoto.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md viewer-image animate-fade-in"
                  />
                </div>
                
                {/* QR code container - enlarged and positioned on right side */}
                <div className="md:w-2/5 p-5 flex flex-col items-center justify-center bg-white/10 dark:bg-black/20 rounded-lg backdrop-blur-sm shadow-inner">
                  <div className="mb-4 text-lg font-medium text-center">
                    {settings.language === "th" ? "สแกนเพื่อดาวน์โหลด" : "Scan to download"}
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <QRCode
                      url={photoUrl}
                      size={settings.viewerQRCodeSize * 1.5}
                      className="mx-auto"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-6"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {settings.language === "th" ? "ดาวน์โหลด" : "Download"}
                  </Button>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Carousel view mode
  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-2 shadow-xl">
        <div className="relative flex flex-col w-full h-full p-2 md:p-4">
          {/* Controls */}
          <div className="absolute top-2 right-2 z-50 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Image name/caption */}
          <div className="text-center mb-2 font-semibold">
            {selectedPhoto.name}
          </div>
          
          {/* Carousel */}
          <div className="flex-1 overflow-hidden">
            <Carousel 
              className="w-full h-full" 
              ref={emblaRef}
              onSelect={() => {
                if (emblaApi && photos.length > 0) {
                  const index = emblaApi.selectedScrollSnap();
                  setSelectedPhoto(photos[index]);
                }
              }}
            >
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id} className="flex items-center justify-center">
                    <div className="h-full w-full flex flex-col items-center justify-center p-4">
                      <img 
                        src={photo.fullSizeUrl || photo.url}
                        alt={photo.name}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md animate-fade-in"
                      />
                      
                      <div className="mt-4 text-sm">{photo.name}</div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const downloadUrl = photo.directDownloadUrl || photo.webContentLink;
                          window.open(downloadUrl, "_blank");
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {settings.language === "th" ? "ดาวน์โหลด" : "Download"}
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
        
        {/* Fixed the style element by removing jsx and global properties */}
        <style>{`
          .animate-scale-in {
            animation: scaleIn 0.3s ease-out forwards;
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
