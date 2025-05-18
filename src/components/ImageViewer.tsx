
import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "./QRCode";
import { useTranslation } from "../hooks/useTranslation";

const ImageViewer: React.FC = () => {
  const { photos, selectedPhoto, setSelectedPhoto, settings } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  // Open image when photo is selected
  useEffect(() => {
    if (selectedPhoto) {
      setIsOpen(true);
      // Prevent scrolling of background when viewer is open
      document.body.style.overflow = "hidden";
    } else {
      setIsOpen(false);
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);
  
  if (!isOpen || !selectedPhoto) {
    return null;
  }
  
  const handleClose = () => {
    setSelectedPhoto(null);
  };
  
  // Get current photo index
  const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
  
  // Navigation functions
  const navigateToPreviousPhoto = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };
  
  const navigateToNextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <Button
        size="icon"
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-10"
        onClick={handleClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      {/* Navigation buttons - Previous */}
      {currentIndex > 0 && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white"
          onClick={navigateToPreviousPhoto}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
      
      {/* Navigation buttons - Next */}
      {currentIndex < photos.length - 1 && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white"
          onClick={navigateToNextPhoto}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}
      
      <div className="w-full max-w-5xl h-full max-h-[85vh] px-4 flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative flex-1 h-full max-h-[65vh] md:max-h-[85vh] flex items-center justify-center">
          <img
            src={selectedPhoto.fullSizeUrl || selectedPhoto.url}
            alt={t("viewer.imageAlt")}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
        
        <div className="flex-shrink-0 md:w-1/4 flex flex-col items-center justify-center">
          <div className="bg-white/90 p-2 rounded-lg shadow-lg backdrop-blur-sm">
            <QRCode 
              url={selectedPhoto.webContentLink || selectedPhoto.url} 
              size={settings.qrCodeSize * 2} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
