
import { ApiConfig, Photo, Theme, Font, PhotoFetchResult, Language, ThemeMode } from "../types";

// Context interface
export interface AppContextType {
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
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  sortPhotos: (photos: Photo[]) => Photo[];
}

// Sort order type
export type SortOrder = {
  field: "name" | "modifiedTime" | "createdTime";
  direction: "asc" | "desc";
};

// Default sort order
export const defaultSortOrder: SortOrder = {
  field: "modifiedTime",
  direction: "desc",
};

// AppSettings interface
export interface AppSettings {
  themeMode: 'light' | 'dark';
  theme: Theme;
  font: Font;
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
  };
  titleSize: number;
  qrCodeSize: number;
  headerQRCodeSize: number;
  viewerQRCodeSize: number;
  language: "en" | "th";
  galleryName: string;
  showGalleryName: boolean;
  logoUrl: string;
  showLogo: boolean;
  logoSize: number;
  bannerUrl: string;
  bannerPosition: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
  bannerSize: number;
  showHeaderQR: boolean;
  refreshInterval: number;
  gridLayout: "googlePhotos" | "fixed" | "auto" | "custom";
  gridColumns: number;
  gridRows: number;
  qrCodePosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center";
  // เพิ่มคุณสมบัติสำหรับการปรับแต่ง QR code
  qrCodePadding: number;
  qrCodeBorderRadius: number;
  qrCodeLevel: "L" | "M" | "Q" | "H";
  // เพิ่มสำหรับการอัปเดตอัตโนมัติ
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number; // เวลาเป็นวินาทีสำหรับการรีเฟรชอัตโนมัติ
  // สำหรับ auto scroll
  autoScrollEnabled: boolean;
  autoScrollDirection: "up" | "down";
  autoScrollSpeed: number;
  // สำหรับ title
  title: string;
  showTitle: boolean;
}
