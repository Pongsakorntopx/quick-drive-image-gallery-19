
import React from "react";
import { Photo } from "../types";
import { useAppContext } from "../context/AppContext";
import QRCode from "./QRCode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ImageCardProps {
  photo: Photo;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ photo, onClick }) => {
  const { settings } = useAppContext();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      // Use directDownloadUrl for better download experience without login
      const downloadUrl = photo.directDownloadUrl || photo.webContentLink;
      
      link.href = downloadUrl;
      link.download = photo.name;
      link.target = "_blank"; // Opens in a new tab if direct download isn't supported
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "ดาวน์โหลดเริ่มต้นแล้ว",
        description: `กำลังดาวน์โหลด ${photo.name}`
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดรูปภาพได้",
        variant: "destructive"
      });
    }
  };

  // Function to position QR code based on settings
  const getQrCodePosition = () => {
    switch (settings.qrCodePosition) {
      case "bottomRight":
        return "bottom-2 right-2";
      case "bottomLeft":
        return "bottom-2 left-2";
      case "topRight":
        return "top-2 right-2";
      case "topLeft":
        return "top-2 left-2";
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      default:
        return "bottom-2 right-2";
    }
  };

  return (
    <div 
      className="image-container relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer group"
      onClick={onClick}
    >
      {/* Use thumbnailLink for grid display */}
      <img
        src={photo.thumbnailLink}
        alt={photo.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 w-full p-4 text-white">
          <h3 className="truncate font-medium" style={{fontSize: `${settings.fontSize.subtitle}px`}}>{photo.name}</h3>
        </div>
      </div>

      <div className={`absolute ${getQrCodePosition()} z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
        <QRCode 
          url={photo.directDownloadUrl || photo.webContentLink} 
          size={settings.qrCodeSize} 
          className="shadow-lg bg-white/90 backdrop-blur-sm"
        />
      </div>

      <Button 
        size="icon" 
        onClick={handleDownload}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 hover:bg-white/40 backdrop-blur-sm"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ImageCard;
