
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";

// Import refactored components
import ViewerControls from "./image-viewer/ViewerControls";
import StandardView from "./image-viewer/StandardView";
import CarouselView from "./image-viewer/CarouselView";
import ViewerStyles from "./image-viewer/viewerStyles";
import { useKeyboardNavigation } from "./image-viewer/useKeyboardNavigation";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, photos, notificationsEnabled } = useAppContext();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
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

  // Handle keyboard navigation
  useKeyboardNavigation({
    selectedPhoto,
    onPrevious: handlePrevious,
    onNext: handleNext,
    onClose: () => setSelectedPhoto(null),
  });

  if (!selectedPhoto) {
    return null;
  }

  const photoUrl = selectedPhoto.fullSizeUrl || selectedPhoto.url;

  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-2 shadow-xl">
        <div className="relative flex flex-col w-full h-full p-2 md:p-4">
          {/* Controls */}
          <ViewerControls
            onClose={() => setSelectedPhoto(null)}
            onToggleViewMode={toggleViewMode}
            showViewModeToggle={viewMode === "carousel"} // Only show toggle in carousel mode
          />
          
          {/* Image name/caption */}
          <div className="text-center mb-2 font-semibold">
            {selectedPhoto.name}
          </div>
          
          {/* Main content based on view mode */}
          {viewMode === "standard" ? (
            <StandardView
              photo={selectedPhoto}
              photoUrl={photoUrl}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onDownload={handleDownload}
            />
          ) : (
            <CarouselView
              photos={photos}
              emblaRef={emblaRef}
              onSelect={() => {
                if (emblaApi && photos.length > 0) {
                  const index = emblaApi.selectedScrollSnap();
                  setSelectedPhoto(photos[index]);
                }
              }}
            />
          )}
          
          {/* Animation styles */}
          <ViewerStyles />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
