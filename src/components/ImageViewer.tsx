
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { QRCode } from "./QRCode";
import { toast } from "@/components/ui/use-toast";

const ImageViewer = () => {
  const { selectedPhoto, setSelectedPhoto, photos } = useAppContext();

  // Add keyboard navigation
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhoto(null);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, photos]);

  if (!selectedPhoto) return null;

  // Current image index
  const currentIndex = photos.findIndex((photo) => photo.id === selectedPhoto.id);

  // Handle navigation
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    } else {
      setSelectedPhoto(photos[0]); // Loop to the beginning
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    } else {
      setSelectedPhoto(photos[photos.length - 1]); // Loop to the end
    }
  };

  const handleDownload = () => {
    if (selectedPhoto?.directDownloadUrl) {
      const link = document.createElement("a");
      link.href = selectedPhoto.directDownloadUrl;
      link.download = selectedPhoto.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "กำลังดาวน์โหลด",
        description: `กำลังดาวน์โหลดไฟล์ ${selectedPhoto.name}`
      });
    }
  };
  
  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-lg">
        <div className="relative w-full h-full max-h-[80vh] flex flex-col">
          <div className="absolute top-2 right-2 z-10">
            <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[60vh] object-contain rounded shadow-lg"
            />
          </div>
          
          <div className="p-4 border-t flex items-center justify-between gap-4">
            <div className="flex-1 truncate">
              <h2 className="font-medium text-lg truncate">{selectedPhoto.name}</h2>
              {selectedPhoto.modifiedTime && (
                <p className="text-sm text-muted-foreground">
                  อัปโหลดเมื่อ: {new Date(selectedPhoto.modifiedTime).toLocaleString('th-TH')}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleDownload}>ดาวน์โหลด</Button>
              
              <div className="bg-white p-1 rounded shadow-sm">
                <QRCode
                  url={selectedPhoto.directDownloadUrl || selectedPhoto.webContentLink || ''}
                  size={64}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
