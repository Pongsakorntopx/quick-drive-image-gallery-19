
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import QRCode from "./QRCode";
import { useTranslation } from "../hooks/useTranslation";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, photos, settings } = useAppContext();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const { t } = useTranslation();
  
  useEffect(() => {
    if (selectedPhoto) {
      const index = photos.findIndex(photo => photo.id === selectedPhoto.id);
      if (index !== -1) {
        setCurrentPhotoIndex(index);
      }
    }
  }, [selectedPhoto, photos]);

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

  if (!selectedPhoto) {
    return null;
  }

  const photoUrl = selectedPhoto.fullSizeUrl || selectedPhoto.url;
  const downloadUrl = selectedPhoto.directDownloadUrl || selectedPhoto.webContentLink;

  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-md border-2 shadow-xl">
        <div className="relative flex flex-col w-full h-full p-2 md:p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Image name/caption */}
          <div className="text-center mb-2 font-semibold">
            {selectedPhoto.name}
          </div>
          
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Main content container */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 rounded-xl bg-black/10 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-lg w-full h-full">
              {/* Image container */}
              <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
                <img
                  src={photoUrl}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md viewer-image"
                />
              </div>
              
              {/* QR code container - only on medium screens and up */}
              <div className="md:w-1/4 p-3 flex flex-col items-center justify-center">
                <div className="mb-2 text-sm font-medium text-center">
                  {settings.language === "th" ? "สแกนเพื่อดาวน์โหลด" : "Scan to download"}
                </div>
                <div className="bg-white/95 dark:bg-black/50 p-3 rounded-lg shadow-md">
                  <QRCode
                    url={photoUrl}
                    size={settings.viewerQRCodeSize}
                    className="mx-auto"
                  />
                </div>
                {downloadUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.open(downloadUrl, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {settings.language === "th" ? "ดาวน์โหลด" : "Download"}
                  </Button>
                )}
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
          
          {/* Removed the image counter text as requested */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
