
import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import PhotoGrid from "../components/PhotoGrid";
import ImageViewer from "../components/ImageViewer";

const ViewerMode = () => {
  const { apiConfig, refreshPhotos, isLoading, error, photos } = useAppContext();

  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      refreshPhotos();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full px-4 md:px-6 py-3 bg-background/75 border-b">
        <div className="flex items-center justify-center">
          <h1 className="text-center font-bold text-2xl">แกลเลอรี่รูปภาพ</h1>
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
    </div>
  );
};

export default ViewerMode;
