
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import Header from "../components/Header";
import PhotoGrid from "../components/PhotoGrid";
import ApiSetup from "../components/ApiSetup";
import ImageViewer from "../components/ImageViewer";
import SettingsDialog from "../components/SettingsDialog";
import Slideshow from "../components/Slideshow";

const Index = () => {
  const { apiConfig, refreshPhotos, isLoading, error } = useAppContext();

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      refreshPhotos();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
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
