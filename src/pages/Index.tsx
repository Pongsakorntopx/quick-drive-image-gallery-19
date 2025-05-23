
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
import { motion } from "framer-motion";

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
  
  // Generate the Google Drive folder URL for QR code
  const folderUrl = apiConfig.folderId ? getFolderUrl(apiConfig.folderId) : "";

  return (
    <div className={`min-h-screen flex flex-col bg-background/95 bg-gradient-to-b from-background to-background/80 ${settings.font.class}`}>
      <Header />
      
      <main className="flex-1 w-full pt-2 pb-8">
        {apiConfig.apiKey && apiConfig.folderId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PhotoGrid />
          </motion.div>
        ) : (
          <ApiSetup />
        )}
      </main>
      
      {/* Banner */}
      {settings.bannerUrl && (
        <motion.div 
          className={`fixed ${getBannerPosition()} z-10`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ 
            maxWidth: `${settings.bannerSize}px`, 
            maxHeight: `${settings.bannerSize}px` 
          }}
        >
          <img 
            src={settings.bannerUrl} 
            alt="Banner" 
            className="max-w-full max-h-full object-contain drop-shadow-lg"
          />
        </motion.div>
      )}
      
      {/* Header QR code if enabled */}
      {settings.showHeaderQR && (!settings.bannerUrl || settings.bannerPosition !== "topRight") && (
        <motion.div 
          className="fixed top-24 right-8 z-40"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <QRCode 
            url={folderUrl} 
            size={settings.headerQRCodeSize} 
            className="shadow-lg bg-white/90 backdrop-blur-sm rounded-lg"
          />
        </motion.div>
      )}
      
      <ImageViewer />
      <SettingsDialog />
      <AutoScroll />
    </div>
  );
};

export default Index;
