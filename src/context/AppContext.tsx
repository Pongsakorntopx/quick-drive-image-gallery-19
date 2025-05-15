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

// Extended font collection with 50 fonts including handwriting fonts
const fonts: Font[] = [
  // Original fonts
  { id: "font1", name: "Kanit", family: "Kanit, sans-serif", class: "font-sans" },
  { id: "font2", name: "Noto Sans Thai", family: "Noto Sans Thai, sans-serif", class: "font-display" },
  { id: "font3", name: "Sarabun", family: "Sarabun, sans-serif", class: "font-body" },
  
  // Standard fonts
  { id: "font4", name: "Roboto", family: "Roboto, sans-serif", class: "font-roboto" },
  { id: "font5", name: "Open Sans", family: "Open Sans, sans-serif", class: "font-opensans" },
  { id: "font6", name: "Lato", family: "Lato, sans-serif", class: "font-lato" },
  { id: "font7", name: "Montserrat", family: "Montserrat, sans-serif", class: "font-montserrat" },
  { id: "font8", name: "Poppins", family: "Poppins, sans-serif", class: "font-poppins" },
  { id: "font9", name: "Raleway", family: "Raleway, sans-serif", class: "font-raleway" },
  { id: "font10", name: "Ubuntu", family: "Ubuntu, sans-serif", class: "font-ubuntu" },
  
  // Serif fonts
  { id: "font11", name: "Playfair Display", family: "Playfair Display, serif", class: "font-playfair" },
  { id: "font12", name: "Merriweather", family: "Merriweather, serif", class: "font-merriweather" },
  { id: "font13", name: "Crimson Text", family: "Crimson Text, serif", class: "font-crimson" },
  { id: "font14", name: "Lora", family: "Lora, serif", class: "font-lora" },
  { id: "font15", name: "Roboto Slab", family: "Roboto Slab, serif", class: "font-roboto-slab" },
  { id: "font16", name: "Noto Serif", family: "Noto Serif, serif", class: "font-noto-serif" },
  { id: "font17", name: "Cormorant Garamond", family: "Cormorant Garamond, serif", class: "font-cormorant" },
  
  // Display fonts
  { id: "font18", name: "Bebas Neue", family: "Bebas Neue, cursive", class: "font-bebas" },
  { id: "font19", name: "Archivo Black", family: "Archivo Black, sans-serif", class: "font-archivo-black" },
  { id: "font20", name: "Anton", family: "Anton, sans-serif", class: "font-anton" },
  { id: "font21", name: "Passion One", family: "Passion One, cursive", class: "font-passion-one" },
  { id: "font22", name: "Righteous", family: "Righteous, cursive", class: "font-righteous" },
  
  // Monospace fonts
  { id: "font23", name: "Roboto Mono", family: "Roboto Mono, monospace", class: "font-roboto-mono" },
  { id: "font24", name: "Source Code Pro", family: "Source Code Pro, monospace", class: "font-source-code" },
  { id: "font25", name: "Fira Code", family: "Fira Code, monospace", class: "font-fira-code" },
  
  // Handwriting fonts
  { id: "font26", name: "Caveat", family: "Caveat, cursive", class: "font-caveat" },
  { id: "font27", name: "Pacifico", family: "Pacifico, cursive", class: "font-pacifico" },
  { id: "font28", name: "Dancing Script", family: "Dancing Script, cursive", class: "font-dancing-script" },
  { id: "font29", name: "Indie Flower", family: "Indie Flower, cursive", class: "font-indie-flower" },
  { id: "font30", name: "Kalam", family: "Kalam, cursive", class: "font-kalam" },
  { id: "font31", name: "Satisfy", family: "Satisfy, cursive", class: "font-satisfy" },
  { id: "font32", name: "Great Vibes", family: "Great Vibes, cursive", class: "font-great-vibes" },
  { id: "font33", name: "Sacramento", family: "Sacramento, cursive", class: "font-sacramento" },
  { id: "font34", name: "Shadows Into Light", family: "Shadows Into Light, cursive", class: "font-shadows-into-light" },
  { id: "font35", name: "Amatic SC", family: "Amatic SC, cursive", class: "font-amatic-sc" },
  { id: "font36", name: "Architects Daughter", family: "Architects Daughter, cursive", class: "font-architects-daughter" },
  { id: "font37", name: "Homemade Apple", family: "Homemade Apple, cursive", class: "font-homemade-apple" },
  { id: "font38", name: "Reenie Beanie", family: "Reenie Beanie, cursive", class: "font-reenie-beanie" },
  { id: "font39", name: "Rock Salt", family: "Rock Salt, cursive", class: "font-rock-salt" },
  { id: "font40", name: "Covered By Your Grace", family: "Covered By Your Grace, cursive", class: "font-covered-by-your-grace" },
  
  // Thai fonts
  { id: "font41", name: "Prompt", family: "Prompt, sans-serif", class: "font-prompt" },
  { id: "font42", name: "Mitr", family: "Mitr, sans-serif", class: "font-mitr" },
  { id: "font43", name: "Taviraj", family: "Taviraj, serif", class: "font-taviraj" },
  { id: "font44", name: "Athiti", family: "Athiti, sans-serif", class: "font-athiti" },
  { id: "font45", name: "Sriracha", family: "Sriracha, cursive", class: "font-sriracha" },
  
  // Additional modern fonts
  { id: "font46", name: "Lexend", family: "Lexend, sans-serif", class: "font-lexend" },
  { id: "font47", name: "Outfit", family: "Outfit, sans-serif", class: "font-outfit" },
  { id: "font48", name: "DM Sans", family: "DM Sans, sans-serif", class: "font-dm-sans" },
  { id: "font49", name: "Space Grotesk", family: "Space Grotesk, sans-serif", class: "font-space-grotesk" },
  { id: "font50", name: "Plus Jakarta Sans", family: "Plus Jakarta Sans, sans-serif", class: "font-plus-jakarta-sans" },
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
  refreshPhotos: () => Promise<boolean>;
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

  const refreshPhotos = async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      setError("API Key และ Folder ID จำเป็นต้องระบุ");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedPhotos = await fetchPhotosFromDrive(apiConfig);
      
      if (fetchedPhotos.length === 0) {
        setError("ไม่พบรูปภาพในโฟลเดอร์ที่ระบุ");
        return false;
      } else {
        setPhotos(fetchedPhotos);
        return true;
      }
    } catch (err) {
      console.error("Error refreshing photos:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ");
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลรูปภาพได้",
        variant: "destructive",
      });
      return false;
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
