
import React, { useState, useEffect } from "react";
import { Photo } from "../types";
import { useAppContext } from "../context/AppContext";
import QRCode from "./QRCode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImageCardProps {
  photo: Photo;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ photo, onClick }) => {
  const { settings, notificationsEnabled } = useAppContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();
  
  // Preload high-quality image
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);
  const [highQualityUrl, setHighQualityUrl] = useState<string | null>(null);
  
  // Preload high-quality version in the background
  useEffect(() => {
    if (photo.thumbnailLink) {
      const img = new Image();
      // Try to get a higher quality thumbnail for smoother experience
      const betterQualityUrl = photo.thumbnailLink.replace('=s220', '=s400');
      img.onload = () => {
        setHighQualityUrl(betterQualityUrl);
        setHighQualityLoaded(true);
      };
      img.src = betterQualityUrl;
    }
  }, [photo.thumbnailLink]);

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
      
      if (notificationsEnabled) {
        toast({
          title: settings.language === "th" ? "ดาวน์โหลดเริ่มต้นแล้ว" : "Download started",
          description: settings.language === "th" ? `กำลังดาวน์โหลด ${photo.name}` : `Downloading ${photo.name}`
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      if (notificationsEnabled) {
        toast({
          title: settings.language === "th" ? "เกิดข้อผิดพลาด" : "Error",
          description: settings.language === "th" ? "ไม่สามารถดาวน์โหลดรูปภาพได้" : "Could not download the image",
          variant: "destructive"
        });
      }
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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer group h-full touch-manipulation"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={() => setIsHovering(true)}
    >
      {/* Image and overlay */}
      <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
        {/* Initial low-quality image for fast loading */}
        <img
          src={photo.thumbnailLink || `https://drive.google.com/thumbnail?id=${photo.id}`}
          alt={photo.name}
          loading="lazy"
          className={`w-full h-auto object-contain transition-transform duration-500 ${(isHovering || isMobile) ? 'scale-105' : ''} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          style={{
            transform: `scale(${isHovering || isMobile ? '1.05' : '1'})`,
            opacity: imageLoaded ? 1 : 0,
            transition: 'transform 0.5s ease, opacity 0.3s ease'
          }}
          onError={(e) => {
            // Fallback chain if thumbnail fails
            const imgElement = e.target as HTMLImageElement;
            if (imgElement.src !== `https://drive.google.com/thumbnail?id=${photo.id}`) {
              imgElement.src = `https://drive.google.com/thumbnail?id=${photo.id}`;
            } else if (photo.iconLink) {
              // Only use iconLink if it exists
              imgElement.src = photo.iconLink;
            }
          }}
        />
        
        {/* High-quality image that fades in when loaded */}
        {highQualityLoaded && highQualityUrl && (
          <img
            src={highQualityUrl}
            alt={photo.name}
            className="absolute inset-0 w-full h-auto object-contain transition-opacity duration-300 opacity-0"
            style={{
              opacity: highQualityLoaded ? 1 : 0,
              transform: `scale(${isHovering || isMobile ? '1.05' : '1'})`,
              transition: 'transform 0.5s ease, opacity 0.3s ease'
            }}
          />
        )}
        
        {/* Loader placeholder until image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Overlay with gradient effect - visible on mobile or hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 ${
            isMobile || isHovering ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="absolute bottom-0 w-full p-3">
            <h3 
              className="truncate font-medium text-white" 
              style={{fontSize: `${settings.fontSize.subtitle}px`}}
            >
              {photo.name}
            </h3>
          </div>
        </div>
      </div>

      {/* QR Code with improved appearance - changed to use fullSizeUrl for direct image view */}
      <div className={`absolute ${getQrCodePosition()} z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100 ${isMobile ? 'opacity-100 scale-100' : ''}`}>
        <QRCode 
          url={photo.fullSizeUrl || getDirectImageUrl(photo.id)} 
          size={settings.qrCodeSize} 
          className="shadow-lg bg-white/90 backdrop-blur-sm rounded-lg"
        />
      </div>

      {/* Download button with improved styling - more visible on mobile */}
      <Button 
        size="icon" 
        onClick={handleDownload}
        className={`absolute top-2 left-2 z-10 transition-all duration-300 bg-white/20 hover:bg-white/40 backdrop-blur-sm transform ${
          isMobile || isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
        }`}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Helper function to get direct image URL format (same as in googleDriveService.ts)
const getDirectImageUrl = (photoId: string): string => {
  return `https://lh3.googleusercontent.com/d/${photoId}?t=${Date.now()}`;
};

export default ImageCard;

