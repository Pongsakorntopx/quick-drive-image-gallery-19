
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "../context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCw, Monitor, Smartphone, Tablet, Image, QrCode, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fontCategories } from "../config/fonts";
import { useTranslation } from "../hooks/useTranslation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SettingsLock from "./SettingsLock";

const SettingsDialog: React.FC = () => {
  const { t } = useTranslation();
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    setSettings,
    themes,
    fonts,
    apiConfig,
    setApiConfig,
    refreshPhotos,
    resetAllData
  } = useAppContext();

  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [folderId, setFolderId] = useState(apiConfig.folderId);
  const [title, setTitle] = useState(settings.title);
  const [showTitle, setShowTitle] = useState(settings.showTitle);
  const [qrCodeSize, setQrCodeSize] = useState(settings.qrCodeSize);
  const [refreshInterval, setRefreshInterval] = useState(settings.refreshInterval);
  const [titleFont, setTitleFont] = useState(settings.font.id);
  const [titleSize, setTitleSize] = useState(settings.titleSize);
  const [subtitleSize, setSubtitleSize] = useState(settings.fontSize.subtitle);
  const [bodySize, setBodySize] = useState(settings.fontSize.body);
  const [themeId, setThemeId] = useState(settings.theme.id);
  const [themeMode, setThemeMode] = useState(settings.themeMode);
  const [language, setLanguage] = useState(settings.language);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Settings for QR code and logo
  const [qrCodePosition, setQrCodePosition] = useState(settings.qrCodePosition);
  const [showHeaderQR, setShowHeaderQR] = useState(settings.showHeaderQR);
  const [logoSize, setLogoSize] = useState(settings.logoSize || 100);
  
  // Banner settings
  const [bannerSize, setBannerSize] = useState(settings.bannerSize);
  const [customBannerWidth, setCustomBannerWidth] = useState(settings.customBannerSize?.width || 200);
  const [customBannerHeight, setCustomBannerHeight] = useState(settings.customBannerSize?.height || 200);
  const [bannerPosition, setBannerPosition] = useState(settings.bannerPosition);
  
  // Auto-scroll settings
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(settings.autoScrollEnabled || false);
  const [autoScrollDirection, setAutoScrollDirection] = useState(settings.autoScrollDirection || "down");
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(settings.autoScrollSpeed || 10);
  
  // Settings lock
  const [settingsLocked, setSettingsLocked] = useState(settings.settingsLocked);
  const [settingsPin, setSettingsPin] = useState(settings.settingsPin);
  const [settingsPinLength, setSettingsPinLength] = useState<4 | 6 | 8>(
    settings.settingsPinLength || 4
  );
  
  // File upload references
  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [bannerPreview, setBannerPreview] = useState<string | null>(settings.bannerUrl);

  // Check if settings are locked when opening the dialog
  useEffect(() => {
    if (isSettingsOpen && settings.settingsLocked && !settingsPin) {
      // If settings are locked but there's no PIN, unlock them
      setSettingsLocked(false);
      setSettings(prev => ({
        ...prev,
        settingsLocked: false
      }));
    }
  }, [isSettingsOpen, settings.settingsLocked, settingsPin]);

  const handleSaveApiSettings = () => {
    setApiConfig({
      apiKey,
      folderId,
    });
    refreshPhotos();
  };

  const handleSaveAppSettings = () => {
    const selectedTheme = themes.find((t) => t.id === themeId) || themes[0];
    const selectedFont = fonts.find((f) => f.id === titleFont) || fonts[0];

    setSettings({
      ...settings,
      title,
      showTitle,
      titleSize,
      theme: selectedTheme,
      themeMode,
      language,
      font: selectedFont,
      fontSize: {
        subtitle: subtitleSize,
        body: bodySize,
      },
      qrCodeSize,
      refreshInterval,
      qrCodePosition,
      showHeaderQR,
      logoUrl: logoPreview,
      logoSize,
      bannerUrl: bannerPreview,
      bannerSize,
      customBannerSize: {
        width: customBannerWidth,
        height: customBannerHeight
      },
      bannerPosition,
      autoScrollEnabled,
      autoScrollDirection,
      autoScrollSpeed,
      settingsLocked,
      settingsPin,
      settingsPinLength
    });
    
    setIsSettingsOpen(false);
    
    toast({
      title: t("toast.settings.saved"),
      description: t("toast.settings.saved")
    });
  };

  // Reset all settings to default values
  const handleResetSettings = () => {
    if (window.confirm(t("settings.reset") + "?")) {
      // Reset to defaults
      setTitle("แกลเลอรี่รูปภาพ Google Drive");
      setShowTitle(true);
      setThemeId(themes[0].id);
      setThemeMode("light");
      setLanguage("th");
      setTitleFont(fonts[0].id);
      setTitleSize(24);
      setSubtitleSize(16);
      setBodySize(14);
      setQrCodeSize(64);
      setRefreshInterval(5);
      setQrCodePosition("bottomRight");
      setShowHeaderQR(false);
      setLogoPreview(null);
      setLogoSize(100);
      setBannerPreview(null);
      setBannerSize("medium");
      setCustomBannerWidth(200);
      setCustomBannerHeight(200);
      setBannerPosition("bottomLeft");
      setAutoScrollEnabled(false);
      setAutoScrollDirection("down");
      setAutoScrollSpeed(10);
      setSettingsLocked(false);
      setSettingsPin("");
      setSettingsPinLength(4);
      
      toast({
        title: t("toast.settings.reset"),
        description: t("toast.settings.reset")
      });
    }
  };
  
  // Handle reset all data
  const handleResetAllData = () => {
    if (window.confirm(t("setup.reset") + "?")) {
      resetAllData();
      setIsSettingsOpen(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preview component to show font styling applied
  const FontPreview = () => {
    const selectedFont = fonts.find(f => f.id === titleFont) || fonts[0];
    
    // Get device frame class
    let deviceClass = "w-full h-64 overflow-hidden";
    let contentClass = "p-4";
    
    if (previewDevice === 'mobile') {
      deviceClass = "w-[320px] h-64 mx-auto overflow-hidden";
      contentClass = "p-2";
    } else if (previewDevice === 'tablet') {
      deviceClass = "w-[500px] h-64 mx-auto overflow-hidden";
      contentClass = "p-3";
    }

    return (
      <div className="mt-6 space-y-4">
        <div className="flex justify-center gap-4 mb-2">
          <Button 
            variant={previewDevice === 'desktop' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('desktop')}
            className="px-2"
          >
            <Monitor className="h-4 w-4 mr-1" /> {t("settings.appearance.desktop")}
          </Button>
          <Button 
            variant={previewDevice === 'tablet' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('tablet')}
            className="px-2"
          >
            <Tablet className="h-4 w-4 mr-1" /> {t("settings.appearance.tablet")}
          </Button>
          <Button 
            variant={previewDevice === 'mobile' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('mobile')}
            className="px-2"
          >
            <Smartphone className="h-4 w-4 mr-1" /> {t("settings.appearance.mobile")}
          </Button>
        </div>
        
        <div className={`${deviceClass} border rounded-lg shadow-md`}>
          <div className="bg-background h-full dark:bg-gray-800">
            <div className={`${contentClass}`}>
              <div className="rounded-lg p-3 shadow-sm border">
                <h2 
                  className={`${selectedFont.class} font-bold`} 
                  style={{
                    fontSize: `${titleSize}px`
                  }}
                >
                  {title || t("app.title")}
                </h2>
                <p 
                  className={`${selectedFont.class} mt-2`} 
                  style={{
                    fontSize: `${bodySize}px`
                  }}
                >
                  {t("settings.appearance.previewText")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Component to handle font selection with categories
  const FontSelector = () => {
    return (
      <div className="space-y-4">
        <Label htmlFor="font">{t("settings.appearance.font")}</Label>
        
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(fontCategories).map(([categoryId, category]) => (
            <AccordionItem value={categoryId} key={categoryId}>
              <AccordionTrigger>
                {t(`settings.fonts.${categoryId}`)}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {category.fonts.map((font) => (
                    <Button
                      key={font.id}
                      variant={titleFont === font.id ? "default" : "outline"}
                      onClick={() => setTitleFont(font.id)}
                      className={`justify-start overflow-hidden ${font.class}`}
                    >
                      <span className="truncate">{font.name}</span>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="px-4 max-h-[calc(90vh-8rem)]">
          <div className="p-1 pb-4">
            {settings.settingsLocked ? (
              <div className="p-6">
                <SettingsLock
                  isLocked={settingsLocked}
                  onLockChange={setSettingsLocked}
                  pin={settingsPin}
                  onPinChange={setSettingsPin}
                  pinLength={settingsPinLength}
                  onPinLengthChange={setSettingsPinLength}
                />
              </div>
            ) : (
              <Tabs defaultValue="appearance">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="connection">{t("settings.tabs.connection")}</TabsTrigger>
                  <TabsTrigger value="appearance">{t("settings.tabs.appearance")}</TabsTrigger>
                  <TabsTrigger value="advanced">{t("settings.tabs.advanced")}</TabsTrigger>
                  <TabsTrigger value="security">{t("settings.tabs.security")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="connection" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">{t("setup.apiKey")}</Label>
                    <Input
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t("setup.apiKeyPlaceholder")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="folderId">{t("setup.folderId")}</Label>
                    <Input
                      id="folderId"
                      value={folderId}
                      onChange={(e) => setFolderId(e.target.value)}
                      placeholder={t("setup.folderIdPlaceholder")}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleResetAllData}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      {t("setup.reset")}
                    </Button>
                    
                    <Button onClick={handleSaveApiSettings}>
                      {t("settings.connection.save")}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  {/* Language & Theme Mode Settings */}
                  <div className="flex flex-col md:flex-row gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <Label>{t("settings.language")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={language === "th" ? "default" : "outline"}
                          onClick={() => setLanguage("th")}
                          className="flex-1"
                        >
                          {t("settings.language.thai")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={language === "en" ? "default" : "outline"}
                          onClick={() => setLanguage("en")}
                          className="flex-1"
                        >
                          {t("settings.language.english")}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <Label>{t("settings.appearance.themeMode")}</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={themeMode === "light" ? "default" : "outline"}
                          onClick={() => setThemeMode("light")}
                          className="flex-1"
                        >
                          {t("settings.appearance.light")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={themeMode === "dark" ? "default" : "outline"}
                          onClick={() => setThemeMode("dark")}
                          className="flex-1"
                        >
                          {t("settings.appearance.dark")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Title Settings */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="title">{t("settings.appearance.siteName")}</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showTitle"
                        checked={showTitle}
                        onCheckedChange={setShowTitle}
                      />
                      <Label htmlFor="showTitle">{t("settings.appearance.showTitle")}</Label>
                    </div>
                  
                    <div className="space-y-2">
                      <Label htmlFor="title-size">
                        {t("settings.appearance.titleSize", { size: titleSize })}
                      </Label>
                      <Slider
                        id="title-size"
                        value={[titleSize]}
                        min={16}
                        max={48}
                        step={1}
                        onValueChange={(value) => setTitleSize(value[0])}
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Font Selection */}
                  <FontSelector />
                  
                  <FontPreview />
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-6">
                  {/* Auto-scroll Settings */}
                  <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                    <h3 className="text-lg font-medium">{t("settings.advanced.autoScroll")}</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-scroll"
                        checked={autoScrollEnabled}
                        onCheckedChange={setAutoScrollEnabled}
                      />
                      <Label htmlFor="auto-scroll">{t("settings.advanced.autoScrollEnabled")}</Label>
                    </div>
                    
                    {autoScrollEnabled && (
                      <div className="space-y-3 pl-6 border-l-2 border-primary/20 mt-2">
                        <div className="space-y-2">
                          <Label>{t("settings.advanced.autoScrollDirection")}</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={autoScrollDirection === 'down' ? 'default' : 'outline'}
                              onClick={() => setAutoScrollDirection('down')}
                              className="flex-1"
                            >
                              <ArrowDown className="h-4 w-4 mr-2" /> {t("settings.advanced.autoScrollDown")}
                            </Button>
                            
                            <Button
                              type="button"
                              variant={autoScrollDirection === 'up' ? 'default' : 'outline'}
                              onClick={() => setAutoScrollDirection('up')}
                              className="flex-1"
                            >
                              <ArrowUp className="h-4 w-4 mr-2" /> {t("settings.advanced.autoScrollUp")}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="scroll-speed">
                            {t("settings.advanced.autoScrollSpeed", { speed: autoScrollSpeed })}
                          </Label>
                          <div className="flex gap-2 items-center">
                            <span className="text-sm">{t("settings.advanced.slow")}</span>
                            <Slider
                              id="scroll-speed"
                              value={[autoScrollSpeed]}
                              min={1}
                              max={20}
                              step={1}
                              onValueChange={(value) => setAutoScrollSpeed(value[0])}
                              className="flex-1"
                            />
                            <span className="text-sm">{t("settings.advanced.fast")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                    <h3 className="text-lg font-medium">{t("settings.logo.upload")}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          ref={logoFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => logoFileRef.current?.click()}
                        >
                          <Image className="h-4 w-4 mr-2" /> {t("settings.logo.choose")}
                        </Button>
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-destructive text-destructive"
                            onClick={() => setLogoPreview(null)}
                          >
                            {t("settings.logo.remove")}
                          </Button>
                        )}
                      </div>
                      
                      {logoPreview && (
                        <div className="mt-2">
                          <div className="bg-background/30 backdrop-blur-sm p-2 rounded">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="max-h-16 mx-auto"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <Label htmlFor="logo-size">
                          {t("settings.logo.size", { size: logoSize })}
                        </Label>
                        <Slider
                          id="logo-size"
                          value={[logoSize]}
                          min={32}
                          max={200}
                          step={4}
                          onValueChange={(value) => setLogoSize(value[0])}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                    <h3 className="text-lg font-medium">{t("settings.banner.upload")}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          ref={bannerFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => bannerFileRef.current?.click()}
                        >
                          <Image className="h-4 w-4 mr-2" /> {t("settings.logo.choose")}
                        </Button>
                        {bannerPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-destructive text-destructive"
                            onClick={() => setBannerPreview(null)}
                          >
                            {t("settings.logo.remove")}
                          </Button>
                        )}
                      </div>
                      
                      {bannerPreview && (
                        <div className="mt-2">
                          <div className="bg-background/30 backdrop-blur-sm p-2 rounded">
                            <img
                              src={bannerPreview}
                              alt="Banner Preview"
                              className="max-h-24 mx-auto"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <Label>{t("settings.banner.size")}</Label>
                        <Select 
                          value={bannerSize} 
                          onValueChange={(value: "small" | "medium" | "large" | "custom") => setBannerSize(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("settings.banner.size")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">{t("settings.banner.small")}</SelectItem>
                            <SelectItem value="medium">{t("settings.banner.medium")}</SelectItem>
                            <SelectItem value="large">{t("settings.banner.large")}</SelectItem>
                            <SelectItem value="custom">{t("settings.banner.custom")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {bannerSize === "custom" && (
                        <div className="space-y-2 mt-2 pl-4 border-l-2 border-primary/20">
                          <div className="space-y-1">
                            <Label htmlFor="banner-width">
                              {t("settings.banner.width", { width: customBannerWidth })}
                            </Label>
                            <Slider
                              id="banner-width"
                              value={[customBannerWidth]}
                              min={50}
                              max={600}
                              step={10}
                              onValueChange={(value) => setCustomBannerWidth(value[0])}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor="banner-height">
                              {t("settings.banner.height", { height: customBannerHeight })}
                            </Label>
                            <Slider
                              id="banner-height"
                              value={[customBannerHeight]}
                              min={50}
                              max={600}
                              step={10}
                              onValueChange={(value) => setCustomBannerHeight(value[0])}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <Label>{t("settings.banner.position")}</Label>
                        <RadioGroup 
                          value={bannerPosition} 
                          onValueChange={(value: "bottomLeft" | "bottomRight" | "topLeft" | "topRight") => setBannerPosition(value)} 
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bottomLeft" id="banner-bl" />
                            <Label htmlFor="banner-bl">{t("settings.banner.bottomLeft")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bottomRight" id="banner-br" />
                            <Label htmlFor="banner-br">{t("settings.banner.bottomRight")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="topLeft" id="banner-tl" />
                            <Label htmlFor="banner-tl">{t("settings.banner.topLeft")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="topRight" id="banner-tr" />
                            <Label htmlFor="banner-tr">{t("settings.banner.topRight")}</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                    <h3 className="text-lg font-medium">QR Code</h3>
                    <div className="space-y-2">
                      <Label htmlFor="qr-size">
                        {t("settings.qrcode.size", { size: qrCodeSize })}
                      </Label>
                      <Slider
                        id="qr-size"
                        value={[qrCodeSize]}
                        min={32}
                        max={180}
                        step={8}
                        onValueChange={(value) => setQrCodeSize(value[0])}
                      />
                      
                      <div className="mt-4">
                        <Label>{t("settings.qrcode.position")}</Label>
                        <RadioGroup 
                          value={qrCodePosition} 
                          onValueChange={(value: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center") => setQrCodePosition(value)} 
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bottomRight" id="qr-br" />
                            <Label htmlFor="qr-br">{t("settings.banner.bottomRight")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bottomLeft" id="qr-bl" />
                            <Label htmlFor="qr-bl">{t("settings.banner.bottomLeft")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="topRight" id="qr-tr" />
                            <Label htmlFor="qr-tr">{t("settings.banner.topRight")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="topLeft" id="qr-tl" />
                            <Label htmlFor="qr-tl">{t("settings.banner.topLeft")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="center" id="qr-c" />
                            <Label htmlFor="qr-c">กลาง</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch 
                          id="show-header-qr" 
                          checked={showHeaderQR}
                          onCheckedChange={setShowHeaderQR}
                        />
                        <Label htmlFor="show-header-qr">{t("settings.qrcode.showHeader")}</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-6">
                  <SettingsLock
                    isLocked={settingsLocked}
                    onLockChange={setSettingsLocked}
                    pin={settingsPin}
                    onPinChange={setSettingsPin}
                    pinLength={settingsPinLength}
                    onPinLengthChange={setSettingsPinLength}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center gap-2 p-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
            className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            <RotateCw className="h-4 w-4" />
            {t("settings.reset")}
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              {t("settings.cancel")}
            </Button>
            <Button onClick={handleSaveAppSettings} disabled={settings.settingsLocked}>
              {t("settings.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
