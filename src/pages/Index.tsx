
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
      
      <ImageViewer />
      <SettingsDialog />
      <Slideshow />
    </div>
  );
};

export default Index;
