
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import PhotoGrid from "../components/PhotoGrid";
import ApiSetup from "../components/ApiSetup";
import ImageViewer from "../components/ImageViewer";
import SettingsDialog from "../components/SettingsDialog";
import Slideshow from "../components/Slideshow";
import QRCode from "../components/QRCode";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const { apiConfig, refreshPhotos, settings, isLoading } = useAppContext();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      if (!isConnecting) {
        setIsConnecting(true);
        refreshPhotos().finally(() => {
          setIsConnecting(false);
        });
      }
    }
    
    // Apply theme class to body
    document.body.className = "";
    
    // Apply the correct theme
    if (settings.theme.isGradient) {
      document.body.classList.add(settings.theme.gradient);
    } else {
      document.body.classList.add(`bg-${settings.theme.colorClass}-50`);
    }
      
    // Set meta viewport for better mobile experience
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }
    
    // Display logo if available
    const logoElement = document.getElementById("site-logo");
    if (logoElement) {
      if (settings.logoUrl) {
        logoElement.innerHTML = `<img src="${settings.logoUrl}" alt="Logo" style="max-height: ${settings.logoSize}px;" class="mx-auto" />`;
      } else {
        logoElement.innerHTML = "";
      }
    }
    
    return () => {
      // Clean up any theme classes
      document.body.className = "";
    };
  }, [apiConfig.apiKey, apiConfig.folderId, settings.theme, settings.logoUrl, settings.logoSize, refreshPhotos]);

  // Helper functions for banner positioning and sizing
  function getBannerPosition() {
    switch (settings.bannerPosition) {
      case "bottomLeft":
        return "bottom-8 left-8";
      case "bottomRight":
        return "bottom-8 right-8";
      case "topLeft":
        return "top-20 left-8"; // Adjusted to be below header
      case "topRight":
        return "top-20 right-8"; // Adjusted to be below header
      default:
        return "bottom-8 left-8";
    }
  }

  function getBannerSize() {
    switch (settings.bannerSize) {
      case "small":
        return "max-w-[100px] max-h-[100px]";
      case "medium":
        return "max-w-[200px] max-h-[200px]";
      case "large":
        return "max-w-[300px] max-h-[300px]";
      default:
        return "max-w-[200px] max-h-[200px]";
    }
  }

  // Prepare dynamic class for container based on theme
  const containerClass = () => {
    let baseClass = "min-h-screen flex flex-col";
    
    if (settings.theme.isGradient) {
      return `${baseClass} bg-background/90`;
    } else {
      return `${baseClass} bg-${settings.theme.colorClass}-50`;
    }
  };

  return (
    <div className={containerClass()}>
      <Header />
      
      <main className="flex-1 w-full">
        {apiConfig.apiKey && apiConfig.folderId ? (
          <>
            {isConnecting && (
              <Alert className="m-4 bg-green-50 border-green-300">
                <AlertDescription className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังเชื่อมต่อไปยัง Google Drive... กรุณารอสักครู่
                </AlertDescription>
              </Alert>
            )}
            <PhotoGrid />
          </>
        ) : (
          <ApiSetup />
        )}
      </main>
      
      {/* Banner */}
      {settings.bannerUrl && (
        <div className={`fixed ${getBannerPosition()} ${getBannerSize()} z-10`}>
          <img 
            src={settings.bannerUrl} 
            alt="Banner" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      
      {/* Header QR code if enabled - adjusted position */}
      {settings.showHeaderQR && (
        <div className="fixed top-24 right-24 z-40">
          <QRCode 
            url={window.location.href} 
            size={settings.qrCodeSize} 
            className="shadow-lg bg-white/90 backdrop-blur-sm"
          />
        </div>
      )}
      
      <ImageViewer />
      <SettingsDialog />
      <Slideshow />
    </div>
  );
};

export default Index;
