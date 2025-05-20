
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ApiConfig, Photo, AppSettings } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { allFonts } from "../config/fonts";
import { AppContextType, SortOrder, defaultSortOrder } from "./AppContextTypes";
import { predefinedThemes, defaultSettings } from "./AppDefaults";
import { fetchAndProcessPhotos, sortPhotos as sortPhotoUtil } from "./PhotoUtils";

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
  
  // Sort order state
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const savedSortOrder = localStorage.getItem("gdrive-app-sort");
    return savedSortOrder ? JSON.parse(savedSortOrder) : defaultSortOrder;
  });
  
  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const savedNotificationsState = localStorage.getItem("gdrive-app-notifications");
    return savedNotificationsState ? JSON.parse(savedNotificationsState) : true;
  });

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
  
  // Save sort order to local storage
  useEffect(() => {
    localStorage.setItem("gdrive-app-sort", JSON.stringify(sortOrder));
  }, [sortOrder]);
  
  // Save notifications state to local storage
  useEffect(() => {
    localStorage.setItem("gdrive-app-notifications", JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);
  
  // Function to apply sort order to photos
  const sortPhotos = (photosToSort: Photo[]) => {
    return sortPhotoUtil(photosToSort, sortOrder);
  };
  
  // Function to reset all data
  const resetAllData = () => {
    localStorage.removeItem("gdrive-app-config");
    localStorage.removeItem("gdrive-app-settings");
    localStorage.removeItem("gdrive-app-sort");
    localStorage.removeItem("gdrive-app-notifications");
    
    setApiConfig({ apiKey: "", folderId: "" });
    setSettings(defaultSettings);
    setPhotos([]);
    setSelectedPhoto(null);
    setSortOrder(defaultSortOrder);
    setNotificationsEnabled(true);
    
    if (notificationsEnabled) {
      toast({
        title: settings.language === "th" ? "ล้างข้อมูลทั้งหมดสำเร็จ" : "All data has been reset successfully",
        description: settings.language === "th" 
          ? "การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้น" 
          : "All settings have been reset to defaults",
      });
    }
  };

  // Modified refresh photos function with improved performance
  const refreshPhotos = useCallback(async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      setError(settings.language === "th" ? "กรุณาระบุ API Key และ Folder ID" : "Please provide API Key and Folder ID");
      return false;
    }
    
    try {
      if (photos.length === 0) {
        setIsLoading(true);
      }
      
      // Fetch and sort photos
      const result = await fetchAndProcessPhotos(apiConfig, settings.language, sortOrder);
      
      if (result.success && result.data) {
        // Find new photos (not in the current photos array)
        if (photos.length > 0) {
          const currentIds = new Set(photos.map(p => p.id));
          const newPhotos = result.data.filter(p => !currentIds.has(p.id));
          
          // If we have new photos, notify user if notifications are enabled
          if (newPhotos.length > 0 && notificationsEnabled) {
            toast({
              title: settings.language === "th" ? "พบรูปภาพใหม่" : "New photos found",
              description: settings.language === "th" 
                ? `พบรูปภาพใหม่ ${newPhotos.length} รูป` 
                : `Found ${newPhotos.length} new photos`
            });
          }
        }
        
        // Apply sorting and update photos
        setPhotos(result.data);
        setError(null);
        return true;
      } else {
        setError(result.error || (settings.language === "th" ? 
          "ไม่สามารถดึงข้อมูลรูปภาพได้" : 
          "Could not fetch images")
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
  }, [apiConfig, photos.length, settings.language, sortOrder, notificationsEnabled, toast]);

  // Refresh photos periodically with the correct interval from settings
  useEffect(() => {
    if (apiConfig.apiKey && apiConfig.folderId) {
      // Initial fetch when component mounts or dependencies change
      refreshPhotos();
      
      // Set up the interval
      const interval = setInterval(() => {
        refreshPhotos();
      }, settings.refreshInterval * 1000); // Convert seconds to milliseconds
      
      // Clean up interval on unmount or when dependencies change
      return () => clearInterval(interval);
    }
  }, [apiConfig, settings.refreshInterval, refreshPhotos]);

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
    themes: predefinedThemes, // Now only contains default theme
    fonts: allFonts,
    resetAllData,
    sortOrder,
    setSortOrder,
    notificationsEnabled,
    setNotificationsEnabled,
    sortPhotos
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
