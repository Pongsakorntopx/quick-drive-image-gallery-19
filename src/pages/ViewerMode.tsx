
import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import PhotoGrid from "../components/PhotoGrid";
import ImageViewer from "../components/ImageViewer";
import AutoScroll from "../components/AutoScroll";
import QRCode from "../components/QRCode";
import { createGoogleFontUrl } from "../config/fonts";
import { useTranslation } from "../hooks/useTranslation";

const ViewerMode = () => {
  const { apiConfig, refreshPhotos, settings, photos } = useAppContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      refreshPhotos();
    }
    
    // Load Google Fonts
    const loadGoogleFonts = () => {
      const existingLink = document.getElementById("google-fonts-link");
      if (existingLink) {
        existingLink.remove();
      }
      
      const link = document.createElement("link");
      link.id = "google-fonts-link";
      link.rel = "stylesheet";
      link.href = createGoogleFontUrl();
      document.head.appendChild(link);
    };
    
    loadGoogleFonts();
    
    // Set meta viewport for better mobile experience
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }
    
  }, [apiConfig, refreshPhotos]);

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
  
  // Use direct image URL format matching the example
  const qrCodeUrl = photos && photos.length > 0 
    ? `https://lh3.googleusercontent.com/d/${photos[0].id}?t=${Date.now()}` 
    : window.location.href;

  return (
    <div className={`min-h-screen flex flex-col bg-background ${settings.font.class}`}>
      <header className="w-full px-4 md:px-6 py-3 bg-background/90 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            {settings.logoUrl && (
              <div className="mb-1 mt-1">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="max-h-16 max-w-[200px] mx-auto transition-transform duration-300 hover:scale-105" 
                  style={{ maxHeight: `${settings.logoSize}px` }}
                />
              </div>
            )}
            
            {settings.showTitle && (
              <h1 className={`text-center font-bold text-xl md:text-2xl font-styled`}
                  style={{ fontSize: `${settings.titleSize}px` }}>
                {settings.title}
              </h1>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <PhotoGrid />
      </main>
      
      <ImageViewer />
      <AutoScroll />
      
      {/* Banner with improved animation */}
      {settings.bannerUrl && (
        <div 
          className={`fixed ${getBannerPosition()} z-10 transition-all duration-300 hover:scale-105 transform`}
          style={{ maxWidth: `${settings.bannerSize}px`, maxHeight: `${settings.bannerSize}px` }}
        >
          <img 
            src={settings.bannerUrl} 
            alt="Banner" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
      
      {/* Header QR code if enabled - only show when banner isn't at topRight position */}
      {settings.showHeaderQR && (!settings.bannerUrl || settings.bannerPosition !== "topRight") && (
        <div className="fixed top-24 right-8 z-40 qr-code-container">
          <QRCode 
            url={qrCodeUrl} 
            size={settings.headerQRCodeSize} 
            className="shadow-lg bg-white/90 backdrop-blur-sm rounded-lg"
          />
        </div>
      )}
      
      <footer className="py-2 px-4 text-center text-sm text-muted-foreground border-t">
        <p>{t("app.footer", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default ViewerMode;
