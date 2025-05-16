
import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import PhotoGrid from "../components/PhotoGrid";
import ImageViewer from "../components/ImageViewer";

const ViewerMode = () => {
  const { apiConfig, refreshPhotos, isLoading, photos, settings } = useAppContext();

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
  }, [apiConfig, settings.theme]);

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme.isGradient ? settings.theme.gradient : ''}`}>
      <header className={`w-full px-4 md:px-6 py-3 ${settings.theme.isGradient ? 'bg-background/75' : 'bg-background/90'} backdrop-blur-sm border-b sticky top-0 z-10`}>
        <div className="flex items-center justify-center">
          <h1 className={`text-center font-bold text-xl md:text-2xl ${settings.font.class}`}>
            {settings.title}
          </h1>
        </div>
      </header>
      
      <main className="flex-1">
        {photos.length > 0 ? (
          <PhotoGrid />
        ) : (
          <div className="flex items-center justify-center h-64">
            {isLoading ? (
              <div className="rounded-full h-12 w-12 border-4 border-t-transparent border-primary animate-spin"></div>
            ) : (
              <p className="text-muted-foreground">ไม่พบรูปภาพ</p>
            )}
          </div>
        )}
      </main>
      
      <ImageViewer />
      
      <footer className="py-2 px-4 text-center text-sm text-muted-foreground">
        <p>แกลเลอรี่รูปภาพ © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default ViewerMode;
