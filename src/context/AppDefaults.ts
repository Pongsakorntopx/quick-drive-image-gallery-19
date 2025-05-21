
import { AppSettings, Theme, Font } from "../types";
import { allFonts } from "../config/fonts";

export const predefinedThemes: Theme[] = [
  {
    id: "default-light",
    name: "Default Light",
    colorClass: "bg-white text-gray-900",
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
    colorClass: "bg-zinc-50 text-zinc-900",
    color: "#fafafa",
    isGradient: false,
    gradient: ""
  },
];

export const defaultSettings: AppSettings = {
  themeMode: "light",
  theme: predefinedThemes[0], // Default to first theme
  font: {
    id: "roboto",
    name: "Roboto",
    class: "font-roboto"
  },
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
  // Adding the missing properties with default values
  title: "Photo Gallery", // Same as galleryName by default
  showTitle: true
};
