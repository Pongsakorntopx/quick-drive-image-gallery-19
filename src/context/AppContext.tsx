import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ApiConfig, Photo, AppSettings } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { allFonts } from "../config/fonts";
import { AppContextType, SortOrder, defaultSortOrder } from "./AppContextTypes";
import { predefinedThemes, defaultSettings } from "./AppDefaults";
import { 
  fetchAndProcessPhotos, 
  sortPhotos as sortPhotoUtil, 
  checkIfPhotosChanged, 
  findNewPhotos, 
  checkForNewPhotos,
  insertNewPhoto,
  getLatestPhotoTimestamp
} from "./PhotoUtils";

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
  
  // Duration for toast notifications (seconds)
  const [toastDuration, setToastDuration] = useState<number>(() => {
    const savedDuration = localStorage.getItem("gdrive-app-toast-duration");
    return savedDuration ? parseInt(savedDuration) : 3;
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
  
  // Reference for the quick check interval
  const quickCheckIntervalRef = useRef<number | null>(null);
  
  // Last refresh timestamp
  const lastRefreshTimeRef = useRef<number>(Date.now());
  
  // Latest photo timestamp for efficient checking
  const latestPhotoTimestampRef = useRef<string | undefined>(undefined);
  
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
  
  // Save toast duration to local storage
  useEffect(() => {
    localStorage.setItem("gdrive-app-toast-duration", toastDuration.toString());
  }, [toastDuration]);
  
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
    localStorage.removeItem("gdrive-app-toast-duration");
    
    setApiConfig({ apiKey: "", folderId: "" });
    setSettings(defaultSettings);
    setPhotos([]);
    setSelectedPhoto(null);
    setSortOrder(defaultSortOrder);
    setNotificationsEnabled(true);
    setToastDuration(3);
    
    if (notificationsEnabled) {
      toast({
        title: settings.language === "th" ? "ล้างข้อมูลทั้งหมดสำเร็จ" : "All data has been reset successfully",
        description: settings.language === "th" 
          ? "การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้น" 
          : "All settings have been reset to defaults",
        duration: toastDuration * 1000
      });
    }
  };

  // Improved function to quickly check for new photos
  const quickCheckNewPhotos = useCallback(async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      return false;
    }
    
    try {
      console.log("Quick checking for new photos at:", new Date().toISOString());
      
      // Check for new photos without fetching all, passing the latest timestamp we know about
      const latestPhoto = await checkForNewPhotos(
        apiConfig, 
        settings.language, 
        latestPhotoTimestampRef.current
      );
      
      if (latestPhoto) {
        console.log("New photo detected:", latestPhoto.name);
        
        // Update latest timestamp reference
        const newTimestamp = latestPhoto.modifiedTime || latestPhoto.createdTime;
        if (newTimestamp) {
          latestPhotoTimestampRef.current = newTimestamp;
        }
        
        // Add the new photo to the beginning of the array
        const updatedPhotos = insertNewPhoto(photos, latestPhoto, sortOrder);
        
        // Update the photos state
        setPhotos(updatedPhotos);
        
        // Show notification if enabled
        if (notificationsEnabled) {
          toast({
            title: settings.language === "th" ? "พบรูปภาพใหม่" : "New photo detected",
            description: settings.language === "th" 
              ? `รูปภาพใหม่: ${latestPhoto.name}` 
              : `New photo: ${latestPhoto.name}`,
            duration: toastDuration * 1000
          });
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error during quick check for new photos:", err);
      return false;
    }
  }, [apiConfig, photos, settings.language, sortOrder, notificationsEnabled, toast, toastDuration]);

  // Improved refresh photos function with optimized performance
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
        // Update latest photo timestamp reference
        latestPhotoTimestampRef.current = getLatestPhotoTimestamp(result.data);
        
        // Check if there are any new photos to add
        if (photos.length > 0) {
          const hasChanges = checkIfPhotosChanged(photos, result.data);
          
          if (hasChanges) {
            // Find new photos 
            const newPhotos = findNewPhotos(photos, result.data);
            
            // Notify if there are new photos
            if (newPhotos.length > 0 && notificationsEnabled) {
              toast({
                title: settings.language === "th" ? `พบรูปภาพใหม่ ${newPhotos.length} รูป` : `Found ${newPhotos.length} new photos`,
                description: settings.language === "th" ? "รูปภาพใหม่ถูกเพิ่มแล้ว" : "New photos have been added",
                duration: toastDuration * 1000
              });
            }
            
            // Update photos with the latest data
            setPhotos(result.data);
          }
        } else {
          // Initial load
          setPhotos(result.data);
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
  }, [apiConfig, photos, settings.language, sortOrder, notificationsEnabled, toast, toastDuration]);

  // Helper function to clear existing intervals
  const clearIntervals = useCallback(() => {
    if (refreshIntervalRef.current !== null) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (quickCheckIntervalRef.current !== null) {
      clearInterval(quickCheckIntervalRef.current);
      quickCheckIntervalRef.current = null;
    }
  }, []);

  // Set up the refresh interval with improved frequency
  useEffect(() => {
    // Clear any existing interval
    clearIntervals();
    
    // Only set up interval if we have API configs
    if (apiConfig.apiKey && apiConfig.folderId) {
      // Initial fetch when component mounts or dependencies change
      refreshPhotos();
      
      // Set up a full refresh interval
      const fullRefreshMs = Math.max(10000, settings.refreshInterval * 1000); // Minimum 10 seconds
      console.log(`Setting up full refresh interval: ${settings.refreshInterval} seconds`);
      
      // Set up a quick check interval - more frequent (every 3 seconds)
      const quickCheckMs = Math.min(3000, settings.refreshInterval * 250); // 1/4 of full refresh but max 3 seconds
      console.log(`Setting up quick check interval: ${quickCheckMs / 1000} seconds`);
      
      // Use more efficient setTimeout-based polling for full refresh
      const setupNextFullRefresh = () => {
        refreshIntervalRef.current = window.setTimeout(async () => {
          console.log(`Full refresh triggered after ${settings.refreshInterval} seconds`);
          await refreshPhotos();
          // Set up the next refresh after this one completes
          setupNextFullRefresh();
        }, fullRefreshMs);
      };
      
      // Set up quick check interval - more aggressive for better responsiveness
      quickCheckIntervalRef.current = window.setInterval(async () => {
        await quickCheckNewPhotos();
      }, quickCheckMs);
      
      setupNextFullRefresh();
      
      // Clean up on unmount
      return () => {
        clearIntervals();
      };
    }
  }, [apiConfig.apiKey, apiConfig.folderId, settings.refreshInterval, refreshPhotos, clearIntervals, quickCheckNewPhotos]);

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
    toastDuration,
    setToastDuration,
    sortPhotos
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
