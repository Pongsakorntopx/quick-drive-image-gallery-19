
import React from "react";
import { Photo } from "../types";
import { useAppContext } from "../context/AppContext";
import QRCode from "./QRCode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCardProps {
  photo: Photo;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ photo, onClick }) => {
  const { settings } = useAppContext();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = photo.webContentLink;
    link.download = photo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="image-container relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer group"
      onClick={onClick}
    >
      {/* Use thumbnail for grid display instead of full image */}
      <img
        src={photo.thumbnailUrl}
        alt={photo.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 w-full p-4 text-white">
          <h3 className="truncate font-medium" style={{fontSize: `${settings.fontSize.subtitle}px`}}>{photo.name}</h3>
        </div>
      </div>

      <div className="absolute top-2 right-2 z-10 qr-hover">
        <QRCode url={photo.webContentLink} size={settings.qrCodeSize} className="shadow-lg" />
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
