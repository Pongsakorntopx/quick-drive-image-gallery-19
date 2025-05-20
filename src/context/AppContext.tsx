
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ApiConfig, Photo } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { allFonts } from "../config/fonts";
import { AppContextType, SortOrder, defaultSortOrder, AppSettings } from "./AppContextTypes";
import { predefinedThemes, defaultSettings } from "./AppDefaults";
import { fetchAndProcessPhotos, sortPhotos as sortPhotoUtil, findNewPhotos } from "./PhotoUtils";

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
        
        // Ensure all new settings have default values by merging with defaultSettings
        return { 
          ...defaultSettings, 
          ...parsed,
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
  const autoRefreshIntervalRef = useRef<number | null>(null);
  
  // Last refresh timestamp
  const lastRefreshTimeRef = useRef<number>(Date.now());
  
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

  // ปรับปรุงฟังก์ชันรีเฟรชรูปภาพเพื่อตรวจจับรูปภาพใหม่และแจ้งเตือน
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
        // เพิ่มการตรวจจับรูปภาพใหม่
        const newPhotos = findNewPhotos(photos, result.data);
        
        // อัปเดตรูปภาพทันทีถ้ามีรูปภาพใหม่หรือเป็นการโหลดครั้งแรก
        if (newPhotos.length > 0 || photos.length === 0) {
          console.log(`Found ${newPhotos.length} new photos, updating display instantly`);
          
          if (newPhotos.length > 0 && photos.length > 0 && notificationsEnabled) {
            // แจ้งเตือนเมื่อพบรูปภาพใหม่
            toast({
              title: settings.language === "th" 
                ? `พบรูปภาพใหม่ ${newPhotos.length} รูป` 
                : `Found ${newPhotos.length} new photos`,
              description: settings.language === "th"
                ? "อัปเดตแกลเลอรีแล้ว"
                : "Gallery has been updated",
              duration: 3000
            });
          }
          
          // อัปเดตรายการรูปภาพ
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
  }, [apiConfig, photos, settings.language, sortOrder, notificationsEnabled, toast]);

  // ฟังก์ชันช่วยเหลือในการล้าง interval ที่มีอยู่
  const clearRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current !== null) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    if (autoRefreshIntervalRef.current !== null) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
  }, []);

  // ตั้งค่า refresh interval เมื่อมีการเปลี่ยนแปลงการตั้งค่า refreshInterval
  useEffect(() => {
    // ล้าง interval ที่มีอยู่
    clearRefreshInterval();
    
    // ตั้งค่า interval ใหม่เฉพาะเมื่อมีการกำหนดค่า API
    if (apiConfig.apiKey && apiConfig.folderId) {
      // รีเฟรชข้อมูลเมื่อคอมโพเนนต์ถูกโหลดหรือเมื่อการตั้งค่าเปลี่ยนแปลง
      refreshPhotos();
      
      // ตั้งค่า interval ใหม่ด้วย refreshInterval ปัจจุบัน (แปลงเป็นมิลลิวินาที)
      const intervalMs = Math.max(1000, settings.refreshInterval * 1000); 
      console.log(`Setting up refresh interval: ${settings.refreshInterval} seconds`);
      
      // เพิ่มการตรวจสอบการเปิดใช้งาน autoRefresh
      if (settings.autoRefreshEnabled) {
        const autoRefreshIntervalMs = Math.max(5000, settings.autoRefreshInterval * 1000);
        console.log(`Setting up auto refresh interval: ${settings.autoRefreshInterval} seconds`);
        
        // ใช้การตั้งเวลาแบบ setTimeout แทน setInterval เพื่อป้องกันการซ้อนทับ
        const setupNextAutoRefresh = () => {
          autoRefreshIntervalRef.current = window.setTimeout(async () => {
            console.log(`Auto refresh triggered after ${settings.autoRefreshInterval} seconds`);
            await refreshPhotos();
            // ตั้งค่าการรีเฟรชถัดไปหลังจากเสร็จสิ้น
            setupNextAutoRefresh();
          }, autoRefreshIntervalMs);
        };
        
        setupNextAutoRefresh();
      }
      
      // ล้างข้อมูลเมื่อถูกยกเลิก
      return () => {
        clearRefreshInterval();
      };
    }
  }, [
    apiConfig.apiKey, 
    apiConfig.folderId, 
    settings.refreshInterval, 
    settings.autoRefreshEnabled, 
    settings.autoRefreshInterval, 
    refreshPhotos, 
    clearRefreshInterval
  ]);

  // ใช้ theme mode
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
