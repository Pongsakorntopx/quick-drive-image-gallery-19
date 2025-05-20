
import { Theme, Font } from "../types";
import { AppSettings } from "./AppContextTypes";
import { allFonts } from "../config/fonts";

export const predefinedThemes: Theme[] = [
  {
    id: "default-light",
    name: "Default Light",
    colorClass: "bg-white text-black",
    color: "#FFFFFF",
    isGradient: false,
    gradient: ""
  },
  {
    id: "default-dark",
    name: "Default Dark",
    colorClass: "bg-gray-900 text-white",
    color: "#111827",
    isGradient: false,
    gradient: ""
  },
  {
    id: "zinc",
    name: "Zinc",
    colorClass: "bg-zinc-100 text-zinc-900",
    color: "#f4f4f5",
    isGradient: false,
    gradient: ""
  },
];

export const defaultSettings: AppSettings = {
  themeMode: "light",
  theme: predefinedThemes[0], // Default to first theme
  font: allFonts[0], // Default to first font
  fontSize: {
    title: 24,
    subtitle: 16, 
    body: 14
  },
  titleSize: 24,
  qrCodeSize: 100, // Default QR code size for image cards
  headerQRCodeSize: 128, // QR code in header
  viewerQRCodeSize: 160, // QR code in image viewer
  language: "en",
  galleryName: "Photo Gallery",
  showGalleryName: true,
  title: "Photo Gallery",
  showTitle: true,
  logoUrl: "",
  showLogo: false,
  logoSize: 80,
  bannerUrl: "",
  bannerPosition: "bottomRight",
  bannerSize: 200,
  showHeaderQR: true,
  refreshInterval: 30, // seconds
  gridLayout: "googlePhotos",
  gridColumns: 4,
  gridRows: 2,
  qrCodePosition: "bottomRight",
  // ค่าเริ่มต้นสำหรับการตั้งค่าใหม่
  qrCodePadding: 4,
  qrCodeBorderRadius: 4,
  qrCodeLevel: "H",
  autoRefreshEnabled: true,
  autoRefreshInterval: 30,
  autoScrollEnabled: false,
  autoScrollDirection: "down",
  autoScrollSpeed: 1
};
