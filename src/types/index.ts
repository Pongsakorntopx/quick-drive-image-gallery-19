
export interface ApiConfig {
  apiKey: string;
  folderId: string;
}

export interface Photo {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
  webContentLink: string;
}

export interface Theme {
  id: string;
  name: string;
  color: string;
  colorClass: string;
}

export interface Font {
  id: string;
  name: string;
  family: string;
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
  refreshInterval: number;
  qrCodeSize: number;
  slideShowSpeed: number;
}
