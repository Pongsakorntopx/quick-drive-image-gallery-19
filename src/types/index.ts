
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
  createdTime?: string;
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
  title: string;
  showTitle: boolean; // Added showTitle setting
  titleSize: number; // Renamed from fontSize.title for simplicity
  theme: Theme;
  themeMode: ThemeMode; // Added theme mode (light/dark)
  language: Language; // Added language setting
  font: Font;
  fontSize: {
    subtitle: number;
    body: number;
  };
  qrCodeSize: number; // Main QR code size (for images)
  headerQRCodeSize: number; // Header QR code size
  viewerQRCodeSize: number; // New property for image viewer QR code size
  refreshInterval: number;
  qrCodePosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center";
  showHeaderQR: boolean;
  logoUrl: string | null;
  logoSize: number;
  bannerUrl: string | null;
  bannerSize: number; // Changed from string to number for pixel-based sizing
  bannerPosition: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
  autoScrollEnabled: boolean;
  autoScrollDirection: "up" | "down";
  autoScrollSpeed: number;
  // Grid layout options
  gridLayout: "googlePhotos" | "auto" | "fixed" | "custom";
  gridColumns: number;
  gridRows: number;
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
