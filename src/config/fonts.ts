
import { Font } from "../types";

// Thai fonts
const thaiFonts: Font[] = [
  { id: "default", name: "ค่าเริ่มต้น", class: "font-sans" },
  { id: "sarabun", name: "Sarabun", class: "font-sarabun" },
  { id: "prompt", name: "Prompt", class: "font-prompt" },
  { id: "kanit", name: "Kanit", class: "font-kanit" },
  { id: "mitr", name: "Mitr", class: "font-mitr" },
  { id: "trirong", name: "Trirong", class: "font-trirong" },
  { id: "athiti", name: "Athiti", class: "font-athiti" },
  { id: "maitree", name: "Maitree", class: "font-maitree" },
  { id: "pridi", name: "Pridi", class: "font-pridi" },
  { id: "taviraj", name: "Taviraj", class: "font-taviraj" },
  { id: "chakra-petch", name: "Chakra Petch", class: "font-chakra-petch" },
  { id: "chonburi", name: "Chonburi", class: "font-chonburi" },
  { id: "fahkwang", name: "Fahkwang", class: "font-fahkwang" },
  { id: "kodchasan", name: "Kodchasan", class: "font-kodchasan" },
  { id: "k2d", name: "K2D", class: "font-k2d" },
  { id: "niramit", name: "Niramit", class: "font-niramit" },
  { id: "krub", name: "Krub", class: "font-krub" },
  { id: "bai-jamjuree", name: "Bai Jamjuree", class: "font-bai-jamjuree" },
  { id: "mali", name: "Mali", class: "font-mali" },
  { id: "srisakdi", name: "Srisakdi", class: "font-srisakdi" },
];

// Thai handwriting fonts
const thaiHandwritingFonts: Font[] = [
  { id: "maehongson", name: "Mae Hongson", class: "font-mae-hongson" },
  { id: "sriracha", name: "Sriracha", class: "font-sriracha" },
  { id: "charm", name: "Charm", class: "font-charm" },
  { id: "itim", name: "Itim", class: "font-itim" },
  { id: "pattaya", name: "Pattaya", class: "font-pattaya" },
  { id: "charmonman", name: "Charmonman", class: "font-charmonman" },
  { id: "koh-santepheap", name: "Koh Santepheap", class: "font-koh-santepheap" },
  { id: "baloo-thambi", name: "Baloo Thambi", class: "font-baloo-thambi" },
  { id: "baloo-bhaina", name: "Baloo Bhaina", class: "font-baloo-bhaina" },
  { id: "chenla", name: "Chenla", class: "font-chenla" },
];

// English fonts
const englishFonts: Font[] = [
  { id: "roboto", name: "Roboto", class: "font-roboto" },
  { id: "open-sans", name: "Open Sans", class: "font-open-sans" },
  { id: "montserrat", name: "Montserrat", class: "font-montserrat" },
  { id: "raleway", name: "Raleway", class: "font-raleway" },
  { id: "lato", name: "Lato", class: "font-lato" },
  { id: "oswald", name: "Oswald", class: "font-oswald" },
  { id: "merriweather", name: "Merriweather", class: "font-merriweather" },
  { id: "playfair-display", name: "Playfair Display", class: "font-playfair" },
  { id: "poppins", name: "Poppins", class: "font-poppins" },
  { id: "source-sans-pro", name: "Source Sans Pro", class: "font-source-sans" },
  { id: "nunito", name: "Nunito", class: "font-nunito" },
  { id: "ubuntu", name: "Ubuntu", class: "font-ubuntu" },
  { id: "lora", name: "Lora", class: "font-lora" },
  { id: "quicksand", name: "Quicksand", class: "font-quicksand" },
  { id: "rubik", name: "Rubik", class: "font-rubik" },
  { id: "work-sans", name: "Work Sans", class: "font-work-sans" },
  { id: "mulish", name: "Mulish", class: "font-mulish" },
  { id: "titillium-web", name: "Titillium Web", class: "font-titillium" },
  { id: "eb-garamond", name: "EB Garamond", class: "font-eb-garamond" },
  { id: "bitter", name: "Bitter", class: "font-bitter" },
];

// English handwriting fonts
const englishHandwritingFonts: Font[] = [
  { id: "dancing-script", name: "Dancing Script", class: "font-dancing-script" },
  { id: "caveat", name: "Caveat", class: "font-caveat" },
  { id: "shadows-into-light", name: "Shadows Into Light", class: "font-shadows-into-light" },
  { id: "indie-flower", name: "Indie Flower", class: "font-indie-flower" },
  { id: "pacifico", name: "Pacifico", class: "font-pacifico" },
  { id: "kaushan-script", name: "Kaushan Script", class: "font-kaushan-script" },
  { id: "crafty-girls", name: "Crafty Girls", class: "font-crafty-girls" },
  { id: "sacramento", name: "Sacramento", class: "font-sacramento" },
  { id: "satisfy", name: "Satisfy", class: "font-satisfy" },
  { id: "amatic-sc", name: "Amatic SC", class: "font-amatic-sc" },
  { id: "permanent-marker", name: "Permanent Marker", class: "font-permanent-marker" },
  { id: "rock-salt", name: "Rock Salt", class: "font-rock-salt" },
  { id: "reenie-beanie", name: "Reenie Beanie", class: "font-reenie-beanie" },
  { id: "cedarville-cursive", name: "Cedarville Cursive", class: "font-cedarville" },
  { id: "damion", name: "Damion", class: "font-damion" },
];

// Extend with more fonts to reach ~100 total
const additionalFonts: Font[] = [
  { id: "serif", name: "ตัวอักษรมีหัว", class: "font-serif" },
  { id: "mono", name: "โมโนสเปซ", class: "font-mono" },
  { id: "architects-daughter", name: "Architects Daughter", class: "font-architects-daughter" },
  { id: "cormorant", name: "Cormorant", class: "font-cormorant" },
  { id: "dm-sans", name: "DM Sans", class: "font-dm-sans" },
  { id: "dm-serif", name: "DM Serif", class: "font-dm-serif" },
  { id: "exo", name: "Exo", class: "font-exo" },
  { id: "josefin-sans", name: "Josefin Sans", class: "font-josefin-sans" },
  { id: "manrope", name: "Manrope", class: "font-manrope" },
  { id: "noto-sans", name: "Noto Sans", class: "font-noto-sans" },
  { id: "noto-serif", name: "Noto Serif", class: "font-noto-serif" },
  { id: "patrick-hand", name: "Patrick Hand", class: "font-patrick-hand" },
  { id: "give-you-glory", name: "Give You Glory", class: "font-give-you-glory" },
  { id: "yellowtail", name: "Yellowtail", class: "font-yellowtail" },
  { id: "covered-by-your-grace", name: "Covered By Your Grace", class: "font-covered" },
  { id: "just-another-hand", name: "Just Another Hand", class: "font-just-another-hand" },
  { id: "pinyon-script", name: "Pinyon Script", class: "font-pinyon-script" },
  { id: "homemade-apple", name: "Homemade Apple", class: "font-homemade-apple" },
  { id: "allura", name: "Allura", class: "font-allura" },
  { id: "marck-script", name: "Marck Script", class: "font-marck-script" },
  { id: "kreon", name: "Kreon", class: "font-kreon" },
  { id: "oxygen", name: "Oxygen", class: "font-oxygen" },
  { id: "petit-formal-script", name: "Petit Formal Script", class: "font-petit-formal-script" },
  { id: "literata", name: "Literata", class: "font-literata" },
  { id: "markazi-text", name: "Markazi Text", class: "font-markazi-text" },
];

// Group fonts by category with descriptive names
export const fontCategories = {
  thai: {
    name: "ฟ้อนต์ภาษาไทย",
    fonts: thaiFonts
  },
  thaiHandwriting: {
    name: "ฟ้อนต์ลายมือภาษาไทย",
    fonts: thaiHandwritingFonts
  },
  english: {
    name: "ฟ้อนต์ภาษาอังกฤษ",
    fonts: englishFonts
  },
  englishHandwriting: {
    name: "ฟ้อนต์ลายมือภาษาอังกฤษ",
    fonts: englishHandwritingFonts
  },
  additional: {
    name: "ฟ้อนต์อื่นๆ",
    fonts: additionalFonts
  }
};

// Get all fonts in a single array
export const allFonts: Font[] = [
  ...thaiFonts,
  ...thaiHandwritingFonts,
  ...englishFonts,
  ...englishHandwritingFonts,
  ...additionalFonts
];

// Create Google Font import URL
export const createGoogleFontUrl = () => {
  // List of font families to import
  const fontFamilies = [
    // Thai fonts
    'Sarabun:400,700',
    'Prompt:400,700',
    'Kanit:400,700',
    'Mitr:400,700',
    'Trirong:400,700',
    'Athiti:400,700',
    'Maitree:400,700',
    'Pridi:400,700',
    'Taviraj:400,700',
    'Chakra+Petch:400,700',
    'Chonburi:400',
    'Fahkwang:400,700',
    'Kodchasan:400,700',
    'K2D:400,700',
    'Niramit:400,700',
    'Krub:400,700',
    'Bai+Jamjuree:400,700',
    'Mali:400,700',
    'Srisakdi:400,700',
    
    // Thai handwriting fonts
    'Sriracha:400',
    'Charm:400,700',
    'Itim:400',
    'Pattaya:400',
    'Charmonman:400,700',
    
    // English fonts
    'Roboto:400,700',
    'Open+Sans:400,700',
    'Montserrat:400,700',
    'Raleway:400,700',
    'Lato:400,700',
    'Oswald:400,700',
    'Merriweather:400,700',
    'Playfair+Display:400,700',
    'Poppins:400,700',
    'Source+Sans+Pro:400,700',
    'Nunito:400,700',
    'Ubuntu:400,700',
    'Lora:400,700',
    'Quicksand:400,700',
    'Rubik:400,700',
    'Work+Sans:400,700',
    'Mulish:400,700',
    'Titillium+Web:400,700',
    'EB+Garamond:400,700',
    'Bitter:400,700',
    
    // English handwriting fonts
    'Dancing+Script:400,700',
    'Caveat:400,700',
    'Shadows+Into+Light:400',
    'Indie+Flower:400',
    'Pacifico:400',
    'Kaushan+Script:400',
    'Sacramento:400',
    'Satisfy:400',
    'Amatic+SC:400,700',
    'Permanent+Marker:400',
    'Rock+Salt:400',
    'Reenie+Beanie:400',
    
    // Additional fonts
    'Architects+Daughter:400',
    'Cormorant:400,700',
    'DM+Sans:400,700',
    'DM+Serif+Text:400',
    'Exo:400,700',
    'Josefin+Sans:400,700',
    'Manrope:400,700',
    'Noto+Sans:400,700',
    'Noto+Serif:400,700',
    'Patrick+Hand:400',
    'Give+You+Glory:400',
    'Yellowtail:400',
    'Covered+By+Your+Grace:400',
    'Just+Another+Hand:400',
    'Pinyon+Script:400',
    'Homemade+Apple:400',
    'Allura:400',
    'Marck+Script:400',
    'Kreon:400,700',
    'Oxygen:400,700',
    'Petit+Formal+Script:400',
  ];
  
  // Build the Google Fonts URL
  return `https://fonts.googleapis.com/css2?${fontFamilies.map(family => `family=${family}`).join('&')}&display=swap`;
};
