
import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import PhotoGrid from "../components/PhotoGrid";
import ImageViewer from "../components/ImageViewer";
import AutoScroll from "../components/AutoScroll";
import QRCode from "../components/QRCode";
import { createGoogleFontUrl } from "../config/fonts";
import { useTranslation } from "../hooks/useTranslation";

const ViewerMode = () => {
  const { apiConfig, refreshPhotos, settings } = useAppContext();
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

  function getBannerSize() {
    if (settings.bannerSize === "custom" && settings.customBannerSize) {
      return `max-w-[${settings.customBannerSize.width}px] max-h-[${settings.customBannerSize.height}px]`;
    }
    
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
    <div className={`min-h-screen flex flex-col bg-background ${settings.font.class}`}>
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
          
          {settings.showTitle && (
            <h1 className={`text-center font-bold text-xl md:text-2xl font-styled`}
                style={{ fontSize: `${settings.titleSize}px` }}>
              {settings.title}
            </h1>
          )}
        </div>
      </header>
      
      <main className="flex-1">
        <PhotoGrid />
      </main>
      
      <ImageViewer />
      <AutoScroll />
      
      {/* Banner */}
      {settings.bannerUrl && (
        <div 
          className={`fixed ${getBannerPosition()} z-10`}
          style={
            settings.bannerSize === "custom" && settings.customBannerSize
              ? { 
                  maxWidth: `${settings.customBannerSize.width}px`, 
                  maxHeight: `${settings.customBannerSize.height}px` 
                }
              : {}
          }
        >
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
      
      <footer className="py-2 px-4 text-center text-sm text-muted-foreground">
        <p>{t("app.footer", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default ViewerMode;
