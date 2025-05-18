
import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import PhotoGrid from "../components/PhotoGrid";
import ImageViewer from "../components/ImageViewer";
import AutoScroll from "../components/AutoScroll";
import QRCode from "../components/QRCode"; // Added missing import

const ViewerMode = () => {
  const { apiConfig, refreshPhotos, settings } = useAppContext();

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      refreshPhotos();
    }
    
    // Set meta viewport for better mobile experience
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
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
    
    return () => {
      // Clean up styles
      const customStyles = document.head.querySelectorAll('style');
      customStyles.forEach(style => {
        if (style.textContent?.includes('.font-styled')) {
          style.remove();
        }
      });
    };
  }, [apiConfig, settings.theme, settings.useGradientFont, settings.fontColor, settings.fontGradientStart, settings.fontGradientEnd, refreshPhotos]);

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
      <header className="w-full px-4 md:px-6 py-3 bg-background/90 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-center">
          {settings.logoUrl && (
            <div className="mb-2 mt-1">
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="max-h-16 max-w-[200px] mx-auto" 
                style={{ maxHeight: `${settings.logoSize}px` }}
              />
            </div>
          )}
          
          <h1 className={`text-center font-bold text-xl md:text-2xl ${settings.font.class} font-styled`}>
            {settings.title}
          </h1>
        </div>
      </header>
      
      <main className="flex-1">
        <PhotoGrid />
      </main>
      
      <ImageViewer />
      <AutoScroll />
      
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
      
      <footer className="py-2 px-4 text-center text-sm text-muted-foreground font-styled">
        <p>แกลเลอรี่รูปภาพ © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default ViewerMode;
