
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "./QRCode";
import { useTranslation } from "../hooks/useTranslation";

const ImageViewer: React.FC = () => {
  const { photos, selectedPhoto, setSelectedPhoto, settings } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const viewerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Get current photo index
  const currentIndex = selectedPhoto ? photos.findIndex(photo => photo.id === selectedPhoto.id) : -1;
  
  // Navigation functions
  const navigateToPreviousPhoto = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  }, [currentIndex, photos, setSelectedPhoto]);
  
  const navigateToNextPhoto = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  }, [currentIndex, photos, photos.length, setSelectedPhoto]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          navigateToPreviousPhoto();
          break;
        case "ArrowRight":
          navigateToNextPhoto();
          break;
        case "Escape":
          setSelectedPhoto(null);
          break;
        // Space to toggle play/pause if we add slideshow in the future
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, navigateToNextPhoto, navigateToPreviousPhoto, setSelectedPhoto]);
  
  if (!isOpen || !selectedPhoto) {
    return null;
  }

  const handleClose = () => {
    setSelectedPhoto(null);
  };

  return (
    <div
      ref={viewerRef}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center"
    >
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
      
      <div className="w-full max-w-6xl h-full max-h-[85vh] px-4 flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative flex-1 h-full max-h-[65vh] md:max-h-[85vh] flex items-center justify-center">
          {/* Enhanced decorative frame around the image */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-2">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 opacity-80 z-0 animate-pulse"></div>
            
            <div className="viewer-image-container relative z-10">
              <img
                src={selectedPhoto.fullSizeUrl || selectedPhoto.url}
                alt={t("viewer.imageAlt")}
                className="viewer-image max-w-full max-h-[60vh] md:max-h-[80vh] object-contain"
                draggable={false}
              />
              
              {/* Add photo name overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center">
                <h3 className="text-white font-medium truncate">{selectedPhoto.name}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 md:w-1/4 flex flex-col items-center justify-center">
          <div className="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-900/85 p-4 rounded-xl shadow-2xl backdrop-blur-sm transform transition-all duration-200 hover:scale-105 border border-white/20 dark:border-gray-700/30">
            <div className="mb-3 text-center text-gray-800 dark:text-gray-200 font-medium">
              <p>{t("viewer.scanQR")}</p>
            </div>
            <QRCode 
              url={selectedPhoto.webContentLink || selectedPhoto.url} 
              size={settings.qrCodeSize * 2} 
              className="shadow-md"
            />
            <div className="mt-3 text-center text-xs text-gray-600 dark:text-gray-400">
              <p>{t("viewer.scanToDownload")}</p>
            </div>
          </div>
          
          <div className="mt-4 text-white/70 text-sm text-center">
            <p>{t("viewer.keyboardTip")}</p>
          </div>
        </div>
      </div>
      
      {/* Pagination indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1 text-white">
        {currentIndex + 1} / {photos.length}
      </div>
      
      {/* Keyboard navigation hints */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
        <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs">←</kbd>
        <span className="text-xs">{t("viewer.previous")}</span>
        <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs ml-2">→</kbd>
        <span className="text-xs">{t("viewer.next")}</span>
        <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs ml-2">ESC</kbd>
        <span className="text-xs">{t("viewer.close")}</span>
      </div>
    </div>
  );
};

export default ImageViewer;
