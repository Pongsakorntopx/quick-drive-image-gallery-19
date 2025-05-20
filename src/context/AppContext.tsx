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
  showTitle: true,
  titleSize: 24,
  theme: predefinedThemes[0],
  themeMode: "light" as ThemeMode,
  language: "th" as Language,
  font: allFonts[0],
  fontSize: {
    subtitle: 16,
    body: 14,
  },
  qrCodeSize: 64,
  headerQRCodeSize: 48,
  viewerQRCodeSize: 80, // Default size for image viewer QR code
  refreshInterval: 5,
  qrCodePosition: "bottomRight",
  showHeaderQR: false,
  logoUrl: null,
  logoSize: 100,
  bannerUrl: null,
  bannerSize: 200, // Changed from string to number (pixels)
  bannerPosition: "bottomLeft",
  autoScrollEnabled: false,
  autoScrollDirection: "down",
  autoScrollSpeed: 10,
  gridLayout: "googlePhotos", // Set to googlePhotos as the default layout
  gridColumns: 4,
  gridRows: 0,
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
  resetAllData: () => void;
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
          // For backward compatibility
          titleSize: parsed.titleSize || defaultSettings.titleSize,
          // For new properties
          headerQRCodeSize: parsed.headerQRCodeSize || defaultSettings.headerQRCodeSize,
          viewerQRCodeSize: parsed.viewerQRCodeSize || defaultSettings.viewerQRCodeSize,
          gridLayout: parsed.gridLayout || defaultSettings.gridLayout,
          gridColumns: parsed.gridColumns || defaultSettings.gridColumns,
          gridRows: parsed.gridRows || defaultSettings.gridRows,
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

  // Modified refresh photos function to always place new photos at the top
  const refreshPhotos = async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      setError(settings.language === "th" ? "กรุณาระบุ API Key และ Folder ID" : "Please provide API Key and Folder ID");
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
        // Always sort by modified time (newest first)
        const sortedPhotos = [...result.data].sort((a, b) => {
          if (a.modifiedTime && b.modifiedTime) {
            return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
          }
          return 0;
        });
        
        // Find new photos (not in the current photos array)
        if (photos.length > 0) {
          const currentIds = new Set(photos.map(p => p.id));
          const newPhotos = sortedPhotos.filter(p => !currentIds.has(p.id));
          const existingPhotos = sortedPhotos.filter(p => currentIds.has(p.id));
          
          // If we have new photos, place them at the beginning
          if (newPhotos.length > 0) {
            setPhotos([...newPhotos, ...existingPhotos]);
          } else {
            setPhotos(sortedPhotos);
          }
        } else {
          setPhotos(sortedPhotos);
        }
        
        setError(null);
        return true;
      } else {
        setError(settings.language === "th" ? 
          "ไม่สามารถดึงข้อมูลรูปภาพได้" : 
          "Could not fetch images"
        );
        return false;
      }
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError(settings.language === "th" ? 
        "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ" : 
        "Error fetching images"
      );
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
