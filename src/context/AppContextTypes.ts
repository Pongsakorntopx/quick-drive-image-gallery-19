import { Photo, Theme, Font } from "../types";

export interface SortOrder {
  field: keyof Photo;
  direction: "asc" | "desc";
}

export const defaultSortOrder: SortOrder = {
  field: "modifiedTime",
  direction: "desc",
};

export interface AppSettings {
  themeMode: "light" | "dark";
  language: "en" | "th";
  title: string;
  showTitle: boolean;
  titleSize: number;
  refreshInterval: number;
  qrCodeSize: number;
  qrCodePosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center";
  showHeaderQR: boolean;
  logoUrl: string | null;
  logoSize: number;
  bannerUrl: string | null;
  bannerSize: number;
  bannerPosition: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
  autoScrollEnabled: boolean;
  autoScrollSpeed: number;
  autoScrollDirection: "up" | "down";
  font: Font;
  fontSize: {
    subtitle: number;
    body: number;
  };
  theme: Theme;
  headerQRCodeSize: number;
  viewerQRCodeSize: number;
  gridLayout: "googlePhotos" | "fixed" | "custom" | "auto";
  gridColumns: number;
  gridRows: number;
  autoRefreshOnNewPhotos: boolean; // New setting for auto-refresh on new photos
}

export interface AppContextType {
  apiConfig: { apiKey: string; folderId: string };
  setApiConfig: React.Dispatch<React.SetStateAction<{ apiKey: string; folderId: string }>>;
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
  toastDuration: number;
  setToastDuration: React.Dispatch<React.SetStateAction<number>>;
  sortPhotos: (photosToSort: Photo[]) => Photo[];
}
