
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ApiConfig, Photo, AppSettings } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { allFonts } from "../config/fonts";
import { AppContextType, SortOrder, defaultSortOrder } from "./AppContextTypes";
import { predefinedThemes, defaultSettings } from "./AppDefaults";
import { fetchAndProcessPhotos, sortPhotos as sortPhotoUtil, checkIfPhotosChanged } from "./PhotoUtils";

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
  
  // Reference for the refresh interval
  const refreshIntervalRef = useRef<number | null>(null);
  
  // Last refresh timestamp
  const lastRefreshTimeRef = useRef<number>(Date.now());
  
  // Previous photos reference for comparison
  const previousPhotosRef = useRef<Photo[]>([]);
  
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

  // Improved refresh photos function with real-time updates
  const refreshPhotos = useCallback(async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      setError(settings.language === "th" ? "กรุณาระบุ API Key และ Folder ID" : "Please provide API Key and Folder ID");
      return false;
    }
    
    try {
      // Only show loading state on initial load
      if (photos.length === 0) {
        setIsLoading(true);
      }
      
      console.log("Refreshing photos at:", new Date().toISOString());
      lastRefreshTimeRef.current = Date.now();
      
      // Fetch and sort photos with optimized background processing
      const result = await fetchAndProcessPhotos(apiConfig, settings.language, sortOrder);
      
      if (result.success && result.data) {
        // Check if photos have actually changed using the enhanced comparison function
        const hasChanges = checkIfPhotosChanged(previousPhotosRef.current, result.data);
        
        if (hasChanges) {
          console.log("Photos have changed, updating state...");
          // Update photos state with the new data
          setPhotos(result.data);
          
          // Show notification for new photos if there are more photos than before
          if (notificationsEnabled && previousPhotosRef.current.length > 0 && result.data.length > previousPhotosRef.current.length) {
            const newPhotoCount = result.data.length - previousPhotosRef.current.length;
            toast({
              title: settings.language === "th" 
                ? `พบรูปภาพใหม่ ${newPhotoCount} รูป` 
                : `Found ${newPhotoCount} new photos`,
              description: settings.language === "th"
                ? "รูปภาพใหม่ถูกเพิ่มเข้ามาและแสดงแล้ว"
                : "New photos have been added and displayed",
            });
          }
          
          // Update the reference to current photos for future comparison
          previousPhotosRef.current = result.data;
        } else {
          console.log("No changes detected in photos");
        }
        
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
  }, [apiConfig, photos.length, settings.language, sortOrder, notificationsEnabled]);

  // Helper function to clear existing interval
  const clearRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current !== null) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Set up the refresh interval whenever settings.refreshInterval changes
  useEffect(() => {
    // Clear any existing interval
    clearRefreshInterval();
    
    // Only set up interval if we have API configs
    if (apiConfig.apiKey && apiConfig.folderId) {
      // Initial fetch when component mounts or dependencies change
      refreshPhotos();
      
      // Set up a new interval with the current refreshInterval (convert to milliseconds)
      const intervalMs = Math.max(1000, settings.refreshInterval * 1000); 
      console.log(`Setting up refresh interval: ${settings.refreshInterval} seconds`);
      
      // Use more efficient setTimeout-based polling instead of setInterval
      // This ensures we don't stack refreshes if one takes longer than the interval
      const setupNextRefresh = () => {
        refreshIntervalRef.current = window.setTimeout(async () => {
          console.log(`Auto refresh triggered after ${settings.refreshInterval} seconds`);
          await refreshPhotos();
          // Set up the next refresh after this one completes
          setupNextRefresh();
        }, intervalMs);
      };
      
      setupNextRefresh();
      
      // Clean up on unmount
      return () => {
        clearRefreshInterval();
      };
    }
  }, [apiConfig.apiKey, apiConfig.folderId, settings.refreshInterval, refreshPhotos, clearRefreshInterval]);

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
