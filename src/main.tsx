
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preconnect to Google Fonts
const preconnect1 = document.createElement('link');
preconnect1.rel = 'preconnect';
preconnect1.href = 'https://fonts.googleapis.com';
document.head.appendChild(preconnect1);

const preconnect2 = document.createElement('link');
preconnect2.rel = 'preconnect';
preconnect2.href = 'https://fonts.gstatic.com';
preconnect2.crossOrigin = '';
document.head.appendChild(preconnect2);

// Add all fonts
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Anton&family=Architects+Daughter&family=Archivo+Black&family=Athiti:wght@400;500;600&family=Bebas+Neue&family=Caveat:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Covered+By+Your+Grace&family=Crimson+Text:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Fira+Code:wght@400;500;600;700&family=Great+Vibes&family=Homemade+Apple&family=Indie+Flower&family=Kalam:wght@300;400;700&family=Kanit:wght@300;400;500;600&family=Lato:wght@300;400;700;900&family=Lexend:wght@300;400;500;600;700&family=Lora:wght@400;500;600;700&family=Merriweather:wght@300;400;700;900&family=Mitr:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600;700;800;900&family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Noto+Serif:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Pacifico&family=Passion+One:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Reenie+Beanie&family=Righteous&family=Roboto+Mono:wght@300;400;500;600;700&family=Roboto+Slab:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700;900&family=Rock+Salt&family=Sacramento&family=Sarabun:wght@300;400;500;600&family=Satisfy&family=Shadows+Into+Light&family=Source+Code+Pro:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Sriracha&family=Taviraj:wght@300;400;500;600;700&family=Ubuntu:wght@300;400;500;700&display=swap';
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(<App />);
