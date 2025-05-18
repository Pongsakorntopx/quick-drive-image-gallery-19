
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "./QRCode";
import { useTranslation } from "../hooks/useTranslation";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, settings } = useAppContext();
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
  
  const getQRPosition = () => {
    const baseClasses = "z-10 bg-white/90 p-2 rounded-lg shadow-lg backdrop-blur-sm";
    
    switch (settings.qrCodePosition) {
      case "bottomRight":
        return `${baseClasses} absolute bottom-4 right-4`;
      case "bottomLeft":
        return `${baseClasses} absolute bottom-4 left-4`;
      case "topRight":
        return `${baseClasses} absolute top-4 right-4`;
      case "topLeft":
        return `${baseClasses} absolute top-4 left-4`;
      case "center":
        return `${baseClasses} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseClasses} absolute bottom-4 right-4`;
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
      
      <div className="w-full max-w-5xl h-full max-h-[85vh] px-4 flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative flex-1 h-full max-h-[65vh] md:max-h-[85vh] flex items-center justify-center">
          <img
            src={selectedPhoto.fullSizeUrl || selectedPhoto.url}
            alt={t("viewer.imageAlt")}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <div className="flex-shrink-0 md:w-1/4 flex flex-col items-center justify-center">
          <div className={getQRPosition().replace("absolute", "")}>
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
