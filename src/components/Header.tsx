
import React from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Settings, Play, QrCode } from "lucide-react";
import QRCode from "./QRCode";

const Header: React.FC = () => {
  const { settings, setIsSettingsOpen, setIsSlideshowOpen, photos } = useAppContext();
  
  // Create a viewer mode URL by adding '/view' to the current URL
  const viewerModeUrl = `${window.location.origin}/view`;

  return (
    <header className={`sticky top-0 z-50 w-full px-4 md:px-6 py-3 backdrop-blur-lg bg-background/75 border-b ${settings.font.class}`}>
      <div className="flex items-center justify-between">
        <h1 
          className="text-center font-bold"
          style={{ fontSize: `${settings.fontSize.title}px`, color: `var(--${settings.theme.colorClass})` }}
        >
          {settings.title}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsSlideshowOpen(true)} disabled={photos.length === 0}>
            <Play className="h-4 w-4" />
          </Button>

          <div className="relative group">
            <Button variant="outline" size="icon">
              <QrCode className="h-4 w-4" />
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block">
              <QRCode url={viewerModeUrl} size={settings.qrCodeSize * 1.5} />
            </div>
          </div>
          
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
