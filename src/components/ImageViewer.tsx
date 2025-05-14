
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "./QRCode";
import { format } from "date-fns";
import { getDirectImageUrl } from "../services/googleDriveService";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, settings, setIsSlideshowOpen } = useAppContext();
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Reset loading state when a new photo is selected
    if (selectedPhoto) {
      setIsImageLoading(true);
      setImageError(false);
    }
  }, [selectedPhoto]);

  const handleDownload = () => {
    if (selectedPhoto) {
      const link = document.createElement("a");
      link.href = selectedPhoto.webContentLink;
      link.download = selectedPhoto.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    setIsImageLoading(false);
    setImageError(true);
  };

  // Try multiple URL formats for Google Drive images
  const getImageSources = () => {
    if (!selectedPhoto) return [];
    
    return [
      selectedPhoto.fullSizeUrl,
      getDirectImageUrl(selectedPhoto.id),
      `https://drive.google.com/uc?export=view&id=${selectedPhoto.id}&t=${Date.now()}`, // Add timestamp to prevent caching
      selectedPhoto.url
    ];
  };

  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-background/90 backdrop-blur-modal">
        <DialogHeader className="absolute top-4 right-4 z-50">
          <Button variant="outline" size="icon" onClick={() => setSelectedPhoto(null)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-4 h-full">
          <div className="col-span-3 h-full relative">
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
                      setIsImageLoading(true);
                      setImageError(false);
                      // Force a re-render of the image
                      setSelectedPhoto({...selectedPhoto!});
                    }}
                  >
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : (
                selectedPhoto && (
                  <img 
                    key={`${selectedPhoto.id}-full`}
                    src={getImageSources()[0]}
                    alt={selectedPhoto.name} 
                    className="max-w-full max-h-full object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col h-full bg-background">
            <DialogTitle className={`mb-2 ${settings.font.class}`} style={{fontSize: `${settings.fontSize.subtitle}px`}}>
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
            
            <div className="flex justify-center mt-6">
              <QRCode url={selectedPhoto?.webContentLink || ''} size={180} />
            </div>
            
            <div className="mt-6 space-y-2">
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" /> ดาวน์โหลด
              </Button>
              <Button onClick={handleStartSlideshow} variant="outline" className="w-full">
                <Play className="mr-2 h-4 w-4" /> เริ่มสไลด์โชว์
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
