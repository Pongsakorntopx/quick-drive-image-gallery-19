
import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiConfig, Photo, AppSettings, Theme, Font, PhotoFetchResult, Language, ThemeMode } from "../types";
import { fetchPhotosFromDrive } from "../services/googleDriveService";
import { useToast } from "@/components/ui/use-toast";
import { allFonts } from "../config/fonts";

// Define the predefined themes
const predefinedThemes: Theme[] = [
  {
    id: "default",
    name: "ค่าเริ่มต้น",
    colorClass: "slate",
    color: "#f8fafc",
    isGradient: false,
    gradient: "",
  },
  {
    id: "blue",
    name: "น้ำเงิน",
    colorClass: "blue",
    color: "#eff6ff",
    isGradient: false,
    gradient: "",
  },
  {
    id: "green",
    name: "เขียว",
    colorClass: "green",
    color: "#f0fdf4",
    isGradient: false,
    gradient: "",
  },
  {
    id: "purple",
    name: "ม่วง",
    colorClass: "purple",
    color: "#f3e8ff",
    isGradient: false,
    gradient: "",
  },
  {
    id: "golden",
    name: "ทอง",
    colorClass: "yellow",
    color: "#fffbeb",
    isGradient: false,
    gradient: "",
  },
  {
    id: "gray",
    name: "เทา",
    colorClass: "gray",
    color: "#f9fafb",
    isGradient: false,
    gradient: "",
  },
];

// Default settings
const defaultSettings: AppSettings = {
  title: "แกลเลอรี่รูปภาพ Google Drive",
  showTitle: true, // Added showTitle setting
  titleSize: 24, // Changed from fontSize.title
  theme: predefinedThemes[0],
  themeMode: "light" as ThemeMode, // Added theme mode
  language: "th" as Language, // Added language setting
  font: allFonts[0],
  fontSize: {
    subtitle: 16,
    body: 14,
  },
  qrCodeSize: 64,
  refreshInterval: 5,
  qrCodePosition: "bottomRight",
  showHeaderQR: false,
  logoUrl: null,
  logoSize: 100,
  bannerUrl: null,
  bannerSize: "medium",
  customBannerSize: { width: 200, height: 200 }, // New for custom banner size
  bannerPosition: "bottomLeft",
  autoScrollEnabled: false,
  autoScrollDirection: "down",
  autoScrollSpeed: 10,
};

// Context interface
interface AppContextType {
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  isLoading: boolean;
  error: string | null;
  refreshPhotos: () => Promise<boolean>;
  selectedPhoto: Photo | null;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<Photo | null>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  themes: Theme[];
  fonts: Font[];
  resetAllData: () => void; // New function to reset all data
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Toast notification
  const { toast } = useToast();

  // API Configuration state
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const savedConfig = localStorage.getItem("gdrive-app-config");
    return savedConfig
      ? JSON.parse(savedConfig)
      : { apiKey: "", folderId: "" };
  });

  // Photos state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selected photo for the viewer
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem("gdrive-app-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as AppSettings;
        
        // Make sure we have a theme object
        if (parsed.theme && typeof parsed.theme === 'object' && 'id' in parsed.theme) {
          const foundTheme = predefinedThemes.find(t => t.id === parsed.theme.id);
          if (foundTheme) {
            parsed.theme = foundTheme;
          }
        }
        
        // Make sure we have a font object
        if (parsed.font && typeof parsed.font === 'object' && 'id' in parsed.font) {
          const foundFont = allFonts.find(f => f.id === parsed.font.id);
          if (foundFont) {
            parsed.font = foundFont;
          }
        }
        
        // Ensure all new settings have default values
        return { 
          ...defaultSettings, 
          ...parsed,
          // For backward compatibility, copy old fontSize.title to titleSize if exists
          titleSize: parsed.fontSize?.title || parsed.titleSize || defaultSettings.titleSize
        };
      } catch (e) {
        console.error("Error parsing saved settings:", e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  
  // Settings dialog
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Save API config to local storage
  useEffect(() => {
    localStorage.setItem("gdrive-app-config", JSON.stringify(apiConfig));
  }, [apiConfig]);
  
  // Save settings to local storage
  useEffect(() => {
    localStorage.setItem("gdrive-app-settings", JSON.stringify(settings));
  }, [settings]);
  
  // Function to reset all data
  const resetAllData = () => {
    localStorage.removeItem("gdrive-app-config");
    localStorage.removeItem("gdrive-app-settings");
    
    setApiConfig({ apiKey: "", folderId: "" });
    setSettings(defaultSettings);
    setPhotos([]);
    setSelectedPhoto(null);
    
    toast({
      title: settings.language === "th" ? "ล้างข้อมูลทั้งหมดสำเร็จ" : "All data has been reset successfully",
      description: settings.language === "th" 
        ? "การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้น" 
        : "All settings have been reset to defaults",
    });
  };

  // Helper function to check if photos array has actually changed
  const checkIfPhotosChanged = (oldPhotos: Photo[], newPhotos: Photo[]): boolean => {
    if (oldPhotos.length !== newPhotos.length) {
      return true;
    }
    
    // Check if any IDs are different
    const oldIds = new Set(oldPhotos.map(p => p.id));
    return newPhotos.some(p => !oldIds.has(p.id));
  };

  // Modified refresh photos function to prevent flickering
  const refreshPhotos = async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      setError("กรุณาระบุ API Key และ Folder ID");
      return false;
    }
    
    try {
      if (photos.length === 0) {
        setIsLoading(true);
      }
      
      // Convert the response to match our PhotoFetchResult interface
      const photosData = await fetchPhotosFromDrive(apiConfig);
      
      // Create a PhotoFetchResult object from the photos array
      const result: PhotoFetchResult = {
        success: true,
        data: photosData as Photo[]
      };
      
      if (result.success && result.data) {
        // Only update the state if the photos have actually changed
        if (checkIfPhotosChanged(photos, result.data)) {
          // Sort photos by modified time (newest first)
          const sortedPhotos = [...result.data].sort((a, b) => {
            if (a.modifiedTime && b.modifiedTime) {
              return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
            }
            return 0;
          });
          
          setPhotos(sortedPhotos);
        }
        
        setError(null);
        return true;
      } else {
        setError(result.error || "ไม่สามารถดึงข้อมูลรูปภาพได้");
        return false;
      }
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh photos periodically
  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      const interval = setInterval(() => {
        refreshPhotos();
      }, settings.refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [apiConfig, settings.refreshInterval]);

  // Apply theme mode
  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      if (settings.themeMode === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
  }, [settings.themeMode]);

  const contextValue: AppContextType = {
    apiConfig,
    setApiConfig,
    photos,
    setPhotos,
    isLoading,
    error,
    refreshPhotos,
    selectedPhoto,
    setSelectedPhoto,
    settings,
    setSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    themes: predefinedThemes,
    fonts: allFonts,
    resetAllData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
