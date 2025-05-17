
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import PhotoGrid from "../components/PhotoGrid";
import ApiSetup from "../components/ApiSetup";
import ImageViewer from "../components/ImageViewer";
import SettingsDialog from "../components/SettingsDialog";
import QRCode from "../components/QRCode";
import AutoScroll from "../components/AutoScroll";

const Index = () => {
  const { apiConfig, refreshPhotos, settings } = useAppContext();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      // Only refresh on initial load to prevent flickering
      if (isInitialLoad) {
        refreshPhotos().finally(() => {
          setIsInitialLoad(false);
        });
      }
    }
    
    // Apply font styles
    const applyFontColorStyles = () => {
      const style = document.createElement('style');
      if (settings.useGradientFont) {
        style.textContent = `
          .font-styled {
            background: linear-gradient(to right, ${settings.fontGradientStart || '#000000'}, ${settings.fontGradientEnd || '#555555'});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `;
      } else {
        style.textContent = `
          .font-styled {
            color: ${settings.fontColor || '#000000'};
          }
        `;
      }
      document.head.appendChild(style);
    };
    
    applyFontColorStyles();
    
    // Set meta viewport for better mobile experience
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }
    
    return () => {
      // Clean up styles
      const customStyles = document.head.querySelectorAll('style');
      customStyles.forEach(style => {
        if (style.textContent?.includes('.font-styled')) {
          style.remove();
        }
      });
    };
  }, [apiConfig.apiKey, apiConfig.folderId, settings.useGradientFont, settings.fontColor, settings.fontGradientStart, settings.fontGradientEnd, refreshPhotos, isInitialLoad]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 w-full">
        {apiConfig.apiKey && apiConfig.folderId ? (
          <PhotoGrid />
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
      
      {/* Header QR code if enabled - only show when banner isn't at topRight position */}
      {settings.showHeaderQR && (!settings.bannerUrl || settings.bannerPosition !== "topRight") && (
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
      <AutoScroll />
    </div>
  );
};

export default Index;
