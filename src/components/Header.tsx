
import React from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Settings, QrCode, Globe } from "lucide-react";
import QRCode from "./QRCode";
import { getFolderUrl } from "../services/googleDriveService";
import { useTranslation } from "../hooks/useTranslation";

const Header: React.FC = () => {
  const { settings, setIsSettingsOpen, apiConfig } = useAppContext();
  const { t } = useTranslation();
  
  // Generate the Google Drive folder URL
  const folderUrl = apiConfig.folderId ? getFolderUrl(apiConfig.folderId) : "";

  // Toggle dark/light mode locally (will be properly handled by context)
  const toggleLanguage = () => {
    const { setSettings } = useAppContext();
    setSettings(prev => ({
      ...prev,
      language: prev.language === "th" ? "en" : "th"
    }));
  };

  return (
    <header className={`sticky top-0 z-50 w-full px-4 md:px-6 py-3 backdrop-blur-lg bg-background/75 border-b ${settings.font.class}`}>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="hidden md:block w-36">
          {/* Empty div for layout balancing on desktop */}
        </div>
        
        <div className="flex flex-col items-center">
          {settings.logoUrl && (
            <div className="mb-2">
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="max-h-16 max-w-[200px]" 
                style={{ maxHeight: `${settings.logoSize}px` }}
              />
            </div>
          )}
          
          {settings.showTitle && (
            <h1 
              className="text-center font-bold mx-auto md:mx-0 font-styled"
              style={{ fontSize: `${settings.titleSize}px` }}
            >
              {settings.title}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto justify-center md:justify-end">
          <div className="relative">
            {settings.showHeaderQR ? (
              <div className="flex items-center">
                <QRCode url={folderUrl} size={36} />
              </div>
            ) : (
              <div className="relative group">
                <Button variant="outline" size="icon">
                  <QrCode className="h-4 w-4" />
                </Button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block">
                  <QRCode url={folderUrl} size={settings.qrCodeSize * 1.5} />
                </div>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleLanguage}
            title={t("settings.language")}
          >
            <Globe className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsSettingsOpen(true)}
            title={t("settings.title")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
