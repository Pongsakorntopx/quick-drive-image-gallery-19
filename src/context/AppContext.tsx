
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
  language: "th" as Language, // Keep default as Thai
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
          // Force language to Thai (as we're removing language selection)
          language: "th" as Language,
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
      title: "ล้างข้อมูลทั้งหมดสำเร็จ",
      description: "การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้น"
    });
  };

  // Modified refresh photos function to always place new photos at the top
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
        // Always sort by modified time (newest first)
        const sortedPhotos = [...result.data].sort((a, b) => {
          if (a.modifiedTime && b.modifiedTime) {
            return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
          }
          return 0;
        });
        
        // Find new photos that weren't in the previous array
        if (photos.length > 0) {
          const existingIds = new Set(photos.map(p => p.id));
          const newPhotos = sortedPhotos.filter(p => !existingIds.has(p.id));
          
          if (newPhotos.length > 0) {
            console.log(`Found ${newPhotos.length} new photos. Placing them at the top.`);
            // Place new photos at the top, followed by existing photos in their current order
            // This preserves the existing order while adding new photos at the top
            setPhotos(prevPhotos => [...newPhotos, ...prevPhotos]);
            
            // Show a toast notification when new photos are added
            if (newPhotos.length === 1) {
              toast({
                title: "มีรูปภาพใหม่",
                description: `เพิ่มรูปภาพใหม่ 1 รูป`
              });
            } else {
              toast({
                title: "มีรูปภาพใหม่",
                description: `เพิ่มรูปภาพใหม่ ${newPhotos.length} รูป`
              });
            }
          } else {
            // If no new photos, just check for any changes in the existing ones (like modified time)
            const updatedPhotos = sortedPhotos.map(newPhoto => {
              const existingPhoto = photos.find(p => p.id === newPhoto.id);
              // If the photo has been modified, use the new version, otherwise keep the existing
              return existingPhoto && 
                     existingPhoto.modifiedTime === newPhoto.modifiedTime ? 
                     existingPhoto : newPhoto;
            });
            setPhotos(updatedPhotos);
          }
        } else {
          // Initial load
          setPhotos(sortedPhotos);
        }
        
        setError(null);
        return true;
      } else {
        setError("ไม่สามารถดึงข้อมูลรูปภาพได้");
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

  // Background refresh photos every 5 seconds
  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      // Initial load
      refreshPhotos();
      
      // Setup interval for background updates
      const interval = setInterval(() => {
        refreshPhotos().then(success => {
          if (success) {
            console.log("Background photo refresh completed successfully");
          }
        });
      }, 5000); // refresh every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [apiConfig.apiKey, apiConfig.folderId]);

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
