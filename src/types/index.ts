
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
  colors?: Record<string, string>; // Add colors field for theme customization
}

export interface Font {
  id: string;
  name: string;
  class: string;
  category?: string; // Added optional category field
}

export type Language = "th" | "en";

export type ThemeMode = "light" | "dark";

// Remove AppSettings from here since it's now defined in AppContextTypes.ts

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
