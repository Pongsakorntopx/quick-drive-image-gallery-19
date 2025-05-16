
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import PhotoGrid from "../components/PhotoGrid";
import ApiSetup from "../components/ApiSetup";
import ImageViewer from "../components/ImageViewer";
import SettingsDialog from "../components/SettingsDialog";
import Slideshow from "../components/Slideshow";

const Index = () => {
  const { apiConfig, refreshPhotos, settings } = useAppContext();

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      refreshPhotos();
    }
    
    // Apply theme class to body
    document.body.className = settings.theme.isGradient 
      ? settings.theme.gradient 
      : `bg-${settings.theme.colorClass}-50`;
      
    // Set meta viewport for better mobile experience
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }
    
    return () => {
      // Clean up any theme classes
      document.body.className = "";
    };
  }, [apiConfig.apiKey, apiConfig.folderId, settings.theme]);

  return (
    <div className={`min-h-screen flex flex-col bg-background ${settings.theme.isGradient ? 'bg-opacity-90' : ''}`}>
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
      
      <ImageViewer />
      <SettingsDialog />
      <Slideshow />
    </div>
  );
  
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
};

export default Index;
