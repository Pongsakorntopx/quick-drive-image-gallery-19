
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { X, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "./QRCode";
import { format } from "date-fns";

const ImageViewer: React.FC = () => {
  const { selectedPhoto, setSelectedPhoto, settings, setIsSlideshowOpen } = useAppContext();

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
              <img 
                src={selectedPhoto?.url} 
                alt={selectedPhoto?.name} 
                className="max-w-full max-h-full object-contain"
              />
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
