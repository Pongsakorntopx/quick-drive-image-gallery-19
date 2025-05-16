
export interface Photo {
  id: string;
  name: string;
  url: string;
  directDownloadUrl?: string;
  webContentLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  modifiedTime?: string;
}

export interface ApiConfig {
  apiKey: string;
  folderId: string;
}

export interface Theme {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  gradient?: string;
  isGradient?: boolean;
}

export interface Font {
  id: string;
  name: string;
  family: string;
  class: string;
}

// Update the AppSettings interface to include new settings
export interface AppSettings {
  title: string;
  theme: Theme;
  font: Font;
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
  };
  refreshInterval: number;
  qrCodeSize: number;
  qrCodePosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center";
  showHeaderQR: boolean;
  logoUrl: string | null;
  slideShowSpeed: number;
  slideShowEffect: "fade" | "slide" | "zoom" | "none";
  bannerUrl: string | null;
  bannerSize: "small" | "medium" | "large";
  bannerPosition: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
}
