
import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiConfig, Photo, AppSettings, Theme, Font } from "../types";
import { fetchPhotosFromDrive } from "../services/googleDriveService";
import { useToast } from "@/components/ui/use-toast";

// Default themes
const themes: Theme[] = [
  { id: "theme1", name: "Blue", color: "#3b82f6", colorClass: "theme1" },
  { id: "theme2", name: "Red", color: "#ef4444", colorClass: "theme2" },
  { id: "theme3", name: "Green", color: "#10b981", colorClass: "theme3" },
  { id: "theme4", name: "Purple", color: "#8b5cf6", colorClass: "theme4" },
  { id: "theme5", name: "Amber", color: "#f59e0b", colorClass: "theme5" },
];

// Default fonts
const fonts: Font[] = [
  { id: "font1", name: "Kanit", family: "Kanit, sans-serif", class: "font-sans" },
  { id: "font2", name: "Noto Sans Thai", family: "Noto Sans Thai, sans-serif", class: "font-display" },
  { id: "font3", name: "Sarabun", family: "Sarabun, sans-serif", class: "font-body" },
  // More fonts will be added
];

const defaultSettings: AppSettings = {
  title: "แกลเลอรี่รูปภาพ Google Drive",
  theme: themes[0],
  font: fonts[0],
  fontSize: {
    title: 24,
    subtitle: 16,
    body: 14,
  },
  refreshInterval: 5,
  qrCodeSize: 64,
  slideShowSpeed: 5,
};

interface AppContextProps {
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  photos: Photo[];
  isLoading: boolean;
  error: string | null;
  refreshPhotos: () => Promise<void>;
  selectedPhoto: Photo | null;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<Photo | null>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  themes: Theme[];
  fonts: Font[];
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSlideshowOpen: boolean;
  setIsSlideshowOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentAudio: HTMLAudioElement | null;
  setCurrentAudio: React.Dispatch<React.SetStateAction<HTMLAudioElement | null>>;
}

const AppContext = createContext<AppContextProps | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const stored = localStorage.getItem("gdrive-api-config");
    return stored ? JSON.parse(stored) : { apiKey: "", folderId: "" };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem("gdrive-app-settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  // Save API config to localStorage
  useEffect(() => {
    localStorage.setItem("gdrive-api-config", JSON.stringify(apiConfig));
  }, [apiConfig]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("gdrive-app-settings", JSON.stringify(settings));
  }, [settings]);

  // Refresh photos periodically
  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      const interval = setInterval(() => {
        refreshPhotos();
      }, settings.refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [apiConfig, settings.refreshInterval]);

  const refreshPhotos = async (): Promise<void> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      setError("API Key และ Folder ID จำเป็นต้องระบุ");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedPhotos = await fetchPhotosFromDrive(apiConfig);
      
      if (fetchedPhotos.length === 0) {
        setError("ไม่พบรูปภาพในโฟลเดอร์ที่ระบุ");
      } else {
        setPhotos(fetchedPhotos);
      }
    } catch (err) {
      console.error("Error refreshing photos:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ");
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลรูปภาพได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        apiConfig,
        setApiConfig,
        photos,
        isLoading,
        error,
        refreshPhotos,
        selectedPhoto,
        setSelectedPhoto,
        settings,
        setSettings,
        themes,
        fonts,
        isPlaying,
        setIsPlaying,
        isSettingsOpen,
        setIsSettingsOpen,
        isSlideshowOpen, 
        setIsSlideshowOpen,
        currentAudio,
        setCurrentAudio
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
