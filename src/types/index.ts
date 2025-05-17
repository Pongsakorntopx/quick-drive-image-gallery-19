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

export interface AppSettings {
  title: string;
  theme: Theme;
  font: Font;
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
  };
  fontColor: string;
  useGradientFont: boolean;
  fontGradientStart: string;
  fontGradientEnd: string;
  qrCodeSize: number;
  refreshInterval: number;
  qrCodePosition: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center";
  showHeaderQR: boolean;
  logoUrl: string | null;
  logoSize: number;
  bannerUrl: string | null;
  bannerSize: "small" | "medium" | "large";
  bannerPosition: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
  autoScrollEnabled: boolean;
  autoScrollDirection: "up" | "down";
  autoScrollSpeed: number;
  slideShowEffect: "none" | "fade" | "slide" | "zoom";
}
