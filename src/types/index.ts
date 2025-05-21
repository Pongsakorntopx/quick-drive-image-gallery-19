
export interface ApiConfig {
  apiKey: string;
  folderId: string;
}

export interface Photo {
  id: string;
  name: string;
  url: string;
  thumbnailLink: string;
  webContentLink: string;
  directDownloadUrl?: string;
  fullSizeUrl?: string;
  modifiedTime?: string;
  iconLink?: string; // Added iconLink property
}

export interface Theme {
  id: string;
  name: string;
  colorClass: string;
  color: string;
  isGradient: boolean;
  gradient: string;
}

export interface Font {
  id: string;
  name: string;
  class: string;
}

export type Language = "th" | "en";

export type ThemeMode = "light" | "dark";

export interface AppSettings {
  themeMode: ThemeMode;
  theme: Theme;
  font: Font;
  fontSize: {
    title: number; // Added title property
    subtitle: number;
    body: number;
  };
  titleSize: number;
  qrCodeSize: number;
  headerQRCodeSize: number;
  viewerQRCodeSize: number;
  language: Language;
  galleryName: string; // Added galleryName property
  showGalleryName: boolean; // Added showGalleryName property
  logoUrl: string | null;
  showLogo: boolean; // Added showLogo property
  logoSize: number;
  bannerUrl: string | null;
  bannerPosition: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
  bannerSize: number;
  showHeaderQR: boolean;
  refreshInterval: number;
  gridLayout: "googlePhotos" | "auto" | "fixed" | "custom";
  gridColumns: number;
  gridRows: number;
  qrCodePosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center";
  autoScrollEnabled?: boolean;
  autoScrollDirection?: "up" | "down";
  autoScrollSpeed?: number;
}

// Add interface for photo fetch result to fix the context errors
export interface PhotoFetchResult {
  success: boolean;
  data?: Photo[];
  error?: string;
}

// Add translation interface
export interface Translation {
  [key: string]: {
    th: string;
    en: string;
  };
}

// New types for sort order
export interface SortOptions {
  field: "name" | "modifiedTime" | "createdTime";
  direction: "asc" | "desc";
}
