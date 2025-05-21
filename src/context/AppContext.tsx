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
  getLatestPhotoTimestamp,
  clearServiceCache
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
  
  // Flag to track if new photos have been detected during auto-check
  const newPhotosDetectedRef = useRef<boolean>(false);
  
  // New state for tracking pending photo updates
  const [pendingPhoto, setPendingPhoto] = useState<Photo | null>(null);
  
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
    
    // Clear caches
    clearServiceCache();
    
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

  // Ultra-responsive function to update photos state with new photos immediately
  const addNewPhotoInstantly = useCallback((newPhoto: Photo) => {
    console.log("👁️ Instantly adding new photo:", newPhoto.name);
    
    // First check if the photo already exists
    setPhotos(prevPhotos => {
      if (prevPhotos.some(p => p.id === newPhoto.id)) {
        return prevPhotos; // Photo already exists, no change
      }
      
      // Insert at beginning and maintain sort order
      const updatedPhotos = insertNewPhoto([...prevPhotos], newPhoto, sortOrder);
      
      // Show notification for the new photo if enabled
      if (notificationsEnabled) {
        toast({
          title: settings.language === "th" ? "มีภาพใหม่เพิ่มเข้ามา! 🎉" : "New photo added! 🎉",
          description: settings.language === "th" 
            ? `"${newPhoto.name}" ถูกเพิ่มเข้าในคลังภาพแล้ว` 
            : `"${newPhoto.name}" has been added to the gallery`,
          duration: toastDuration * 1000
        });
      }
      
      return updatedPhotos;
    });
    
    // Reset pending photo
    setPendingPhoto(null);
  }, [settings.language, sortOrder, notificationsEnabled, toast, toastDuration]);

  // Effect to add pending photo when detected
  useEffect(() => {
    if (pendingPhoto) {
      addNewPhotoInstantly(pendingPhoto);
    }
  }, [pendingPhoto, addNewPhotoInstantly]);

  // Improved function to quickly check for new photos with instant updates
  const quickCheckNewPhotos = useCallback(async (): Promise<boolean> => {
    if (!apiConfig.apiKey || !apiConfig.folderId) {
      return false;
    }
    
    try {
      // Shorter log to reduce noise
      console.log("🔎 Quick check for new photos...");
      
      // Check for new photos without fetching all, passing the latest timestamp
      // and forcing a refresh if new photos were previously detected
      const latestPhoto = await checkForNewPhotos(
        apiConfig, 
        settings.language, 
        latestPhotoTimestampRef.current,
        newPhotosDetectedRef.current // Force refresh if new photos were detected
      );
      
      if (latestPhoto) {
        console.log("🌟 New photo detected in quick check!", latestPhoto.name);
        
        // Update latest timestamp reference
        const newTimestamp = latestPhoto.modifiedTime || latestPhoto.createdTime;
        if (newTimestamp) {
          latestPhotoTimestampRef.current = newTimestamp;
        }
        
        // Set pending photo to trigger instant update
        setPendingPhoto(latestPhoto);
        
        // Set the flag to indicate new photos have been detected
        newPhotosDetectedRef.current = true;
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error during quick check for new photos:", err);
      return false;
    }
  }, [apiConfig, settings.language]);

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
      
      console.log("♻️ Full refresh at:", new Date().toLocaleTimeString());
      lastRefreshTimeRef.current = Date.now();
      
      // Reset the new photos detected flag before a full refresh
      const wasNewPhotosDetected = newPhotosDetectedRef.current;
      newPhotosDetectedRef.current = false;
      
      // Fetch and sort photos with optimized background processing
      // Use forceRefresh if new photos were detected
      const result = await fetchAndProcessPhotos(
        apiConfig, 
        settings.language, 
        sortOrder, 
        wasNewPhotosDetected
      );
      
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
              
              // Add each new photo instantly with a small delay between each
              // This creates a nice staggering effect
              newPhotos.forEach((photo, index) => {
                setTimeout(() => {
                  setPendingPhoto(photo);
                }, index * 100); // 100ms delay between each photo
              });
            } else {
              // If no new photos or notifications disabled, still update the photo list
              setPhotos(result.data);
            }
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

  // Set up the refresh interval with improved real-time updates
  useEffect(() => {
    // Clear any existing interval
    clearIntervals();
    
    // Only set up interval if we have API configs
    if (apiConfig.apiKey && apiConfig.folderId) {
      // Initial fetch when component mounts or dependencies change
      refreshPhotos();
      
      // Set up a full refresh interval (ลดลงเหลือ 2 วินาที เพื่อการตอบสนองดีขึ้น)
      const fullRefreshMs = Math.max(2000, settings.refreshInterval * 1000); // Minimum 2 seconds
      console.log(`⏱️ Full refresh interval: ${fullRefreshMs / 1000}s`);
      
      // Set up a quick check interval - much more frequent (every 500ms)
      const quickCheckMs = Math.min(500, settings.refreshInterval * 200); // 1/5 of full refresh but max 500ms
      console.log(`⏱️ Quick check interval: ${quickCheckMs}ms`);
      
      // Use more efficient setTimeout-based polling for full refresh
      const setupNextFullRefresh = () => {
        refreshIntervalRef.current = window.setTimeout(async () => {
          await refreshPhotos();
          // Set up the next refresh after this one completes
          setupNextFullRefresh();
        }, fullRefreshMs);
      };
      
      // Set up quick check interval - more aggressive for better real-time updates
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
