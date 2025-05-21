
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import PhotoGrid from "../components/PhotoGrid";
import ApiSetup from "../components/ApiSetup";
import ImageViewer from "../components/ImageViewer";
import SettingsDialog from "../components/SettingsDialog";
import QRCode from "../components/QRCode";
import AutoScroll from "../components/AutoScroll";
import { createGoogleFontUrl } from "../config/fonts";
import { getFolderUrl } from "../services/googleDriveService";

const Index = () => {
  const { apiConfig, refreshPhotos, settings, photos } = useAppContext();
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
    
  }, [apiConfig.apiKey, apiConfig.folderId, refreshPhotos, isInitialLoad]);

  // Helper functions for banner positioning
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
  
  // ใช้ URL ของภาพแรกในคอลเลกชันถ้ามี หรือมิฉะนั้นใช้ URL ของโฟลเดอร์
  const qrCodeUrl = photos && photos.length > 0 
    ? (photos[0].fullSizeUrl || photos[0].url) 
    : apiConfig.folderId ? getFolderUrl(apiConfig.folderId) : "";

  return (
    <div className={`min-h-screen flex flex-col bg-background ${settings.font.class}`}>
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
        <div 
          className={`fixed ${getBannerPosition()} z-10`}
          style={{ 
            maxWidth: `${settings.bannerSize}px`, 
            maxHeight: `${settings.bannerSize}px` 
          }}
        >
          <img 
            src={settings.bannerUrl} 
            alt="Banner" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      
      {/* Header QR code if enabled - ปรับตำแหน่งให้อยู่ชิดขวามากขึ้น */}
      {settings.showHeaderQR && (!settings.bannerUrl || settings.bannerPosition !== "topRight") && (
        <div className="fixed top-24 right-8 z-40">
          <QRCode 
            url={qrCodeUrl} 
            size={settings.headerQRCodeSize} 
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
