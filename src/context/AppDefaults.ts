
import { AppSettings, Language, ThemeMode, Theme, Font } from "../types";
import { allFonts } from "../config/fonts";

// Define the predefined themes - Simplified to just light/dark
export const predefinedThemes: Theme[] = [
  {
    id: "default",
    name: "ค่าเริ่มต้น",
    colorClass: "slate",
    color: "#f8fafc",
    isGradient: false,
    gradient: "",
  },
];

// Default settings
export const defaultSettings: AppSettings = {
  title: "แกลเลอรี่รูปภาพ Google Drive",
  showTitle: true,
  titleSize: 24,
  theme: predefinedThemes[0],
  themeMode: "light" as ThemeMode,
  language: "th" as Language,
  font: allFonts[0],
  fontSize: {
    subtitle: 16,
    body: 14,
  },
  qrCodeSize: 64,                // General QR code size for gallery items
  headerQRCodeSize: 48,          // QR code size in header 
  viewerQRCodeSize: 80,          // QR code size for image viewer
  refreshInterval: 5,
  qrCodePosition: "bottomRight",
  showHeaderQR: false,
  logoUrl: null,
  logoSize: 100,
  bannerUrl: null,
  bannerSize: 200,
  bannerPosition: "bottomLeft",
  autoScrollEnabled: false,
  autoScrollDirection: "down",
  autoScrollSpeed: 10,
  gridLayout: "googlePhotos",
  gridColumns: 4,
  gridRows: 0,
};
