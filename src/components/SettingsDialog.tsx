import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Palette, Upload, X } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { Font, ThemeMode, Language } from "../types"; // Import Language type

const SettingsDialog: React.FC = () => {
  const { t } = useTranslation();
  const { 
    apiConfig, 
    setApiConfig, 
    settings, 
    setSettings, 
    isSettingsOpen, 
    setIsSettingsOpen,
    themes,
    fonts,
    refreshPhotos,
    resetAllData
  } = useAppContext();

  // Local state for form values
  const [localApiConfig, setLocalApiConfig] = useState({ ...apiConfig });
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState("appearance");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(settings.bannerUrl);

  // Update local state when settings change
  useEffect(() => {
    setLocalApiConfig({ ...apiConfig });
    setLocalSettings({ ...settings });
    setLogoPreview(settings.logoUrl);
    setBannerPreview(settings.bannerUrl);
  }, [apiConfig, settings, isSettingsOpen]);

  // Handle form submission
  const handleSubmit = async () => {
    // Process logo upload if there's a new file
    if (logoFile) {
      try {
        const logoDataUrl = await readFileAsDataURL(logoFile);
        localSettings.logoUrl = logoDataUrl;
      } catch (error) {
        console.error("Error processing logo:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัพโหลดโลโก้ได้",
          variant: "destructive",
        });
      }
    } else if (logoPreview === null && settings.logoUrl !== null) {
      // Logo was removed
      localSettings.logoUrl = null;
    }

    // Process banner upload if there's a new file
    if (bannerFile) {
      try {
        const bannerDataUrl = await readFileAsDataURL(bannerFile);
        localSettings.bannerUrl = bannerDataUrl;
      } catch (error) {
        console.error("Error processing banner:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัพโหลดแบนเนอร์ได้",
          variant: "destructive",
        });
      }
    } else if (bannerPreview === null && settings.bannerUrl !== null) {
      // Banner was removed
      localSettings.bannerUrl = null;
    }

    // Update API config if changed
    if (
      localApiConfig.apiKey !== apiConfig.apiKey ||
      localApiConfig.folderId !== apiConfig.folderId
    ) {
      setApiConfig(localApiConfig);
      // Refresh photos with new API config
      setTimeout(() => {
        refreshPhotos();
      }, 500);
    }

    // Update settings
    setSettings(localSettings);
    setIsSettingsOpen(false);

    toast({
      title: t("toast.settings.saved"),
      description: t("toast.settings.saved"),
    });
  };

  // Reset settings to defaults
  const handleResetSettings = () => {
    // Keep API config but reset other settings
    const defaultSettings = {
      ...settings,
      title: "แกลเลอรี่รูปภาพ Google Drive",
      showTitle: true,
      titleSize: 24,
      theme: themes[0],
      themeMode: "light" as ThemeMode, // Cast string literal to ThemeMode
      language: "th" as Language, // Cast string literal to Language
      font: fonts[0],
      fontSize: {
        subtitle: 16,
        body: 14,
      },
      qrCodeSize: 64,
      headerQRCodeSize: 48,
      viewerQRCodeSize: 80,
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

    setLocalSettings(defaultSettings);
    setLogoPreview(null);
    setBannerPreview(null);
    setLogoFile(null);
    setBannerFile(null);

    toast({
      title: t("toast.settings.reset"),
      description: t("toast.settings.reset"),
    });
  };

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner file selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Group fonts by category for better organization
  const fontCategories = {
    thai: fonts.filter(font => font.id.startsWith('thai-')),
    thaiHandwriting: fonts.filter(font => font.id.startsWith('thai-handwriting-')),
    english: fonts.filter(font => font.id.startsWith('en-')),
    englishHandwriting: fonts.filter(font => font.id.startsWith('en-handwriting-')),
    additional: fonts.filter(font => 
      !font.id.startsWith('thai-') && 
      !font.id.startsWith('en-') && 
      !font.id.startsWith('thai-handwriting-') && 
      !font.id.startsWith('en-handwriting-')
    )
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="connection">{t("settings.tabs.connection")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("settings.tabs.appearance")}</TabsTrigger>
            <TabsTrigger value="layout">{t("settings.tabs.layout")}</TabsTrigger>
            <TabsTrigger value="advanced">{t("settings.tabs.advanced")}</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 pr-4">
            {/* Connection Settings */}
            <TabsContent value="connection" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t("setup.apiKey")}</Label>
                  <Input
                    id="apiKey"
                    value={localApiConfig.apiKey}
                    onChange={(e) =>
                      setLocalApiConfig({ ...localApiConfig, apiKey: e.target.value })
                    }
                    placeholder={t("setup.apiKeyPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderId">{t("setup.folderId")}</Label>
                  <Input
                    id="folderId"
                    value={localApiConfig.folderId}
                    onChange={(e) =>
                      setLocalApiConfig({ ...localApiConfig, folderId: e.target.value })
                    }
                    placeholder={t("setup.folderIdPlaceholder")}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => resetAllData()}
                    className="text-destructive hover:text-destructive"
                  >
                    {t("settings.connection.reset")}
                  </Button>
                  <Button onClick={() => handleSubmit()}>
                    {t("settings.connection.save")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4">
                {/* Site Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{t("settings.appearance.siteName")}</Label>
                  <Input
                    id="title"
                    value={localSettings.title}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, title: e.target.value })
                    }
                  />
                </div>

                {/* Show Title Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="showTitle">{t("settings.appearance.showTitle")}</Label>
                  <Switch
                    id="showTitle"
                    checked={localSettings.showTitle}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, showTitle: checked })
                    }
                  />
                </div>

                {/* Title Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="titleSize">
                      {t("settings.appearance.titleSize", { size: localSettings.titleSize })}
                    </Label>
                  </div>
                  <Slider
                    id="titleSize"
                    min={16}
                    max={48}
                    step={1}
                    value={[localSettings.titleSize]}
                    onValueChange={(value) =>
                      setLocalSettings({ ...localSettings, titleSize: value[0] })
                    }
                  />
                </div>

                <Separator />

                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`relative cursor-pointer rounded-md p-2 flex flex-col items-center ${
                          localSettings.theme.id === theme.id
                            ? "ring-2 ring-primary"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setLocalSettings({ ...localSettings, theme })}
                      >
                        <div
                          className={`w-full h-8 rounded-md mb-1 bg-${theme.colorClass}-100 dark:bg-${theme.colorClass}-900`}
                          style={{
                            backgroundColor: theme.isGradient
                              ? "transparent"
                              : theme.color,
                            backgroundImage: theme.isGradient
                              ? theme.gradient
                              : "none",
                          }}
                        />
                        <span className="text-xs">{theme.name}</span>
                        {localSettings.theme.id === theme.id && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Mode */}
                <div className="space-y-2">
                  <Label>{t("settings.appearance.themeMode")}</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={localSettings.themeMode === "light" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, themeMode: "light" as ThemeMode })
                      }
                    >
                      {t("settings.appearance.light")}
                    </Button>
                    <Button
                      type="button"
                      variant={localSettings.themeMode === "dark" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, themeMode: "dark" as ThemeMode })
                      }
                    >
                      {t("settings.appearance.dark")}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Font Selection */}
                <div className="space-y-2">
                  <Label htmlFor="font">{t("settings.appearance.font")}</Label>
                  <Select
                    value={localSettings.font.id}
                    onValueChange={(value) => {
                      const selectedFont = fonts.find((f) => f.id === value) || fonts[0];
                      setLocalSettings({ ...localSettings, font: selectedFont });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.appearance.selectFont")} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Thai Fonts */}
                      {fontCategories.thai.length > 0 && (
                        <>
                          <div className="text-xs text-muted-foreground px-2 py-1.5">
                            {t("settings.fonts.thai")}
                          </div>
                          {fontCategories.thai.map((font: Font) => (
                            <SelectItem key={font.id} value={font.id} className={font.class}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </>
                      )}

                      {/* Thai Handwriting Fonts */}
                      {fontCategories.thaiHandwriting.length > 0 && (
                        <>
                          <div className="text-xs text-muted-foreground px-2 py-1.5">
                            {t("settings.fonts.thaiHandwriting")}
                          </div>
                          {fontCategories.thaiHandwriting.map((font: Font) => (
                            <SelectItem key={font.id} value={font.id} className={font.class}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </>
                      )}

                      {/* English Fonts */}
                      {fontCategories.english.length > 0 && (
                        <>
                          <div className="text-xs text-muted-foreground px-2 py-1.5">
                            {t("settings.fonts.english")}
                          </div>
                          {fontCategories.english.map((font: Font) => (
                            <SelectItem key={font.id} value={font.id} className={font.class}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </>
                      )}

                      {/* English Handwriting Fonts */}
                      {fontCategories.englishHandwriting.length > 0 && (
                        <>
                          <div className="text-xs text-muted-foreground px-2 py-1.5">
                            {t("settings.fonts.englishHandwriting")}
                          </div>
                          {fontCategories.englishHandwriting.map((font: Font) => (
                            <SelectItem key={font.id} value={font.id} className={font.class}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </>
                      )}

                      {/* Additional Fonts */}
                      {fontCategories.additional.length > 0 && (
                        <>
                          <div className="text-xs text-muted-foreground px-2 py-1.5">
                            {t("settings.fonts.additional")}
                          </div>
                          {fontCategories.additional.map((font: Font) => (
                            <SelectItem key={font.id} value={font.id} className={font.class}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>{t("settings.logo.upload")}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="relative"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("settings.logo.choose")}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLogoPreview(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("settings.logo.remove")}
                      </Button>
                    )}
                  </div>
                  {logoPreview && (
                    <div className="mt-2 relative">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="max-h-20 rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Logo Size */}
                {logoPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        {t("settings.logo.size", { size: localSettings.logoSize })}
                      </Label>
                    </div>
                    <Slider
                      min={30}
                      max={200}
                      step={5}
                      value={[localSettings.logoSize]}
                      onValueChange={(value) =>
                        setLocalSettings({ ...localSettings, logoSize: value[0] })
                      }
                    />
                  </div>
                )}

                <Separator />

                {/* Banner Upload */}
                <div className="space-y-2">
                  <Label>{t("settings.banner.upload")}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="relative"
                      onClick={() => document.getElementById("banner-upload")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("settings.logo.choose")}
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerChange}
                      />
                    </Button>
                    {bannerPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setBannerPreview(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("settings.logo.remove")}
                      </Button>
                    )}
                  </div>
                  {bannerPreview && (
                    <div className="mt-2 relative">
                      <img
                        src={bannerPreview}
                        alt="Banner Preview"
                        className="max-h-32 rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Banner Size */}
                {bannerPreview && (
                  <div className="space-y-2">
                    <Label>{t("settings.banner.size")}</Label>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {t("settings.banner.width", { width: localSettings.bannerSize })}
                          </span>
                        </div>
                        <Slider
                          min={50}
                          max={500}
                          step={10}
                          value={[localSettings.bannerSize]}
                          onValueChange={(value) =>
                            setLocalSettings({ ...localSettings, bannerSize: value[0] })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner Position */}
                {bannerPreview && (
                  <div className="space-y-2">
                    <Label>{t("settings.banner.position")}</Label>
                    <RadioGroup
                      value={localSettings.bannerPosition}
                      onValueChange={(value: any) =>
                        setLocalSettings({
                          ...localSettings,
                          bannerPosition: value,
                        })
                      }
                      className="grid grid-cols-2 gap-2"
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
                )}
              </div>
            </TabsContent>

            {/* Layout Settings */}
            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("settings.layout.title")}</Label>
                  <RadioGroup
                    value={localSettings.gridLayout}
                    onValueChange={(value: any) =>
                      setLocalSettings({
                        ...localSettings,
                        gridLayout: value,
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="googlePhotos" id="layout-google" />
                      <Label htmlFor="layout-google">{t("settings.layout.googlePhotos")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="layout-fixed" />
                      <Label htmlFor="layout-fixed">{t("settings.layout.fixed")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="layout-custom" />
                      <Label htmlFor="layout-custom">{t("settings.layout.custom")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(localSettings.gridLayout === "fixed" || localSettings.gridLayout === "custom") && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {t("settings.layout.columns", { columns: localSettings.gridColumns })}
                        </Label>
                      </div>
                      <Slider
                        min={1}
                        max={12}
                        step={1}
                        value={[localSettings.gridColumns]}
                        onValueChange={(value) =>
                          setLocalSettings({ ...localSettings, gridColumns: value[0] })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {t("settings.layout.rows", { rows: localSettings.gridRows })}
                        </Label>
                      </div>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        value={[localSettings.gridRows]}
                        onValueChange={(value) =>
                          setLocalSettings({ ...localSettings, gridRows: value[0] })
                        }
                      >
                        <div className="text-xs text-muted-foreground">
                          * 0 = Auto height
                        </div>
                      </Slider>
                    </div>
                  </>
                )}

                <Separator />

                {/* QR Code Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("settings.qrcode.title")}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        {t("settings.qrcode.mainSize", { size: localSettings.qrCodeSize })}
                      </Label>
                    </div>
                    <Slider
                      min={32}
                      max={200}
                      step={4}
                      value={[localSettings.qrCodeSize]}
                      onValueChange={(value) =>
                        setLocalSettings({ ...localSettings, qrCodeSize: value[0] })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        {t("settings.qrcode.headerSize", { size: localSettings.headerQRCodeSize })}
                      </Label>
                    </div>
                    <Slider
                      min={32}
                      max={120}
                      step={4}
                      value={[localSettings.headerQRCodeSize]}
                      onValueChange={(value) =>
                        setLocalSettings({ ...localSettings, headerQRCodeSize: value[0] })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        {t("settings.qrcode.viewerSize", { size: localSettings.viewerQRCodeSize })}
                      </Label>
                    </div>
                    <Slider
                      min={40}
                      max={200}
                      step={4}
                      value={[localSettings.viewerQRCodeSize]}
                      onValueChange={(value) =>
                        setLocalSettings({ ...localSettings, viewerQRCodeSize: value[0] })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("settings.qrcode.position")}</Label>
                    <RadioGroup
                      value={localSettings.qrCodePosition}
                      onValueChange={(value: any) =>
                        setLocalSettings({
                          ...localSettings,
                          qrCodePosition: value,
                        })
                      }
                      className="grid grid-cols-2 gap-2"
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
                        <Label htmlFor="qr-c">Center</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showHeaderQR">{t("settings.qrcode.showHeader")}</Label>
                    <Switch
                      id="showHeaderQR"
                      checked={localSettings.showHeaderQR}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, showHeaderQR: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("settings.advanced.autoScroll")}</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoScrollEnabled">{t("settings.advanced.autoScrollEnabled")}</Label>
                  <Switch
                    id="autoScrollEnabled"
                    checked={localSettings.autoScrollEnabled}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, autoScrollEnabled: checked })
                    }
                  />
                </div>

                {localSettings.autoScrollEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>{t("settings.advanced.autoScrollDirection")}</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={localSettings.autoScrollDirection === "down" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() =>
                            setLocalSettings({ ...localSettings, autoScrollDirection: "down" })
                          }
                        >
                          {t("settings.advanced.autoScrollDown")}
                        </Button>
                        <Button
                          type="button"
                          variant={localSettings.autoScrollDirection === "up" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() =>
                            setLocalSettings({ ...localSettings, autoScrollDirection: "up" })
                          }
                        >
                          {t("settings.advanced.autoScrollUp")}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {t("settings.advanced.autoScrollSpeed", { speed: localSettings.autoScrollSpeed })}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{t("settings.advanced.slow")}</span>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[localSettings.autoScrollSpeed]}
                          onValueChange={(value) =>
                            setLocalSettings({ ...localSettings, autoScrollSpeed: value[0] })
                          }
                          className="flex-1"
                        />
                        <span className="text-sm">{t("settings.advanced.fast")}</span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">
                    Refresh Interval: {localSettings.refreshInterval} seconds
                  </Label>
                  <Slider
                    id="refreshInterval"
                    min={1}
                    max={60}
                    step={1}
                    value={[localSettings.refreshInterval]}
                    onValueChange={(value) =>
                      setLocalSettings({ ...localSettings, refreshInterval: value[0] })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleResetSettings}>
            {t("settings.reset")}
          </Button>
          <Button onClick={handleSubmit}>{t("settings.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
