import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "../context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCw, Monitor, Smartphone, Tablet, Image, QrCode, ArrowDown, ArrowUp, Columns2, Columns3, Columns4, Grid2x2, Grid3x3, LayoutGrid } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fontCategories } from "../config/fonts";
import { useTranslation } from "../hooks/useTranslation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Basic settings
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [folderId, setFolderId] = useState(apiConfig.folderId);
  const [title, setTitle] = useState(settings.title);
  const [showTitle, setShowTitle] = useState(settings.showTitle);
  const [qrCodeSize, setQrCodeSize] = useState(settings.qrCodeSize);
  const [headerQRCodeSize, setHeaderQRCodeSize] = useState(settings.headerQRCodeSize || 48);
  const [viewerQRCodeSize, setViewerQRCodeSize] = useState(settings.viewerQRCodeSize || 80);
  const [refreshInterval, setRefreshInterval] = useState(settings.refreshInterval);
  const [titleFont, setTitleFont] = useState(settings.font.id);
  const [titleSize, setTitleSize] = useState(settings.titleSize);
  const [subtitleSize, setSubtitleSize] = useState(settings.fontSize.subtitle);
  const [bodySize, setBodySize] = useState(settings.fontSize.body);
  const [themeId, setThemeId] = useState(settings.theme.id);
  const [themeMode, setThemeMode] = useState(settings.themeMode);
  const [language, setLanguage] = useState(settings.language);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Grid Layout settings
  const [gridLayout, setGridLayout] = useState(settings.gridLayout || "googlePhotos");
  const [gridColumns, setGridColumns] = useState(settings.gridColumns || 4);
  const [gridRows, setGridRows] = useState(settings.gridRows || 0);
  
  // Settings for QR code and logo
  const [qrCodePosition, setQrCodePosition] = useState(settings.qrCodePosition);
  const [showHeaderQR, setShowHeaderQR] = useState(settings.showHeaderQR);
  const [logoSize, setLogoSize] = useState(settings.logoSize || 100);
  
  // Banner settings
  const [bannerSize, setBannerSize] = useState(settings.bannerSize || 200);
  const [bannerPosition, setBannerPosition] = useState(settings.bannerPosition);
  
  // Auto-scroll settings
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(settings.autoScrollEnabled || false);
  const [autoScrollDirection, setAutoScrollDirection] = useState(settings.autoScrollDirection || "down");
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(settings.autoScrollSpeed || 10);
  
  // File upload references
  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [bannerPreview, setBannerPreview] = useState<string | null>(settings.bannerUrl);

  // Update API settings when apiConfig changes from context
  useEffect(() => {
    setApiKey(apiConfig.apiKey);
    setFolderId(apiConfig.folderId);
  }, [apiConfig]);

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
      headerQRCodeSize,
      viewerQRCodeSize,
      refreshInterval,
      qrCodePosition,
      showHeaderQR,
      logoUrl: logoPreview,
      logoSize,
      bannerUrl: bannerPreview,
      bannerSize,
      bannerPosition,
      autoScrollEnabled,
      autoScrollDirection,
      autoScrollSpeed,
      // Grid layout settings
      gridLayout,
      gridColumns,
      gridRows,
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
      setHeaderQRCodeSize(48);
      setViewerQRCodeSize(80);
      setRefreshInterval(5);
      setQrCodePosition("bottomRight");
      setShowHeaderQR(false);
      setLogoPreview(null);
      setLogoSize(100);
      setBannerPreview(null);
      setBannerSize(200);
      setBannerPosition("bottomLeft");
      setAutoScrollEnabled(false);
      setAutoScrollDirection("down");
      setAutoScrollSpeed(10);
      setGridLayout("googlePhotos");
      setGridColumns(4);
      setGridRows(0);
      
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
            <Monitor className="h-4 w-4 mr-1" /> Desktop
          </Button>
          <Button 
            variant={previewDevice === 'tablet' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('tablet')}
            className="px-2"
          >
            <Tablet className="h-4 w-4 mr-1" /> Tablet
          </Button>
          <Button 
            variant={previewDevice === 'mobile' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('mobile')}
            className="px-2"
          >
            <Smartphone className="h-4 w-4 mr-1" /> Mobile
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
            <Tabs defaultValue="appearance">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="connection">Connection</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="connection" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Google API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="folderId">Folder ID</Label>
                  <Input
                    id="folderId"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="Enter your Google Drive Folder ID"
                  />
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleResetAllData}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Reset All Data
                  </Button>
                  
                  <Button onClick={handleSaveApiSettings}>
                    Save Connection Settings
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-4">
                {/* Language & Theme Mode Settings */}
                <div className="flex flex-col md:flex-row gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <Label>Language</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={language === "th" ? "default" : "outline"}
                        onClick={() => setLanguage("th")}
                        className="flex-1"
                      >
                        Thai
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={language === "en" ? "default" : "outline"}
                        onClick={() => setLanguage("en")}
                        className="flex-1"
                      >
                        English
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <Label>Theme Mode</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={themeMode === "light" ? "default" : "outline"}
                        onClick={() => setThemeMode("light")}
                        className="flex-1"
                      >
                        Light
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={themeMode === "dark" ? "default" : "outline"}
                        onClick={() => setThemeMode("dark")}
                        className="flex-1"
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                {/* Title Settings */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="title">Site Name</Label>
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
                    <Label htmlFor="showTitle">Show Title</Label>
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="title-size">
                      Title Size ({titleSize}px)
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

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Grid Layout</CardTitle>
                    <CardDescription>
                      Configure the grid layout for displaying images
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Layout Type</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant={gridLayout === "googlePhotos" ? "default" : "outline"}
                          onClick={() => setGridLayout("googlePhotos")}
                          className="flex-1"
                        >
                          <LayoutGrid className="h-4 w-4 mr-2" /> 
                          Google Photos
                        </Button>
                        <Button
                          type="button"
                          variant={gridLayout === "auto" ? "default" : "outline"}
                          onClick={() => setGridLayout("auto")}
                          className="flex-1"
                        >
                          <Image className="h-4 w-4 mr-2" /> 
                          Auto Masonry
                        </Button>
                        <Button
                          type="button"
                          variant={gridLayout === "fixed" ? "default" : "outline"}
                          onClick={() => setGridLayout("fixed")}
                          className="flex-1"
                        >
                          <Grid2x2 className="h-4 w-4 mr-2" /> 
                          Fixed
                        </Button>
                        <Button
                          type="button"
                          variant={gridLayout === "custom" ? "default" : "outline"}
                          onClick={() => setGridLayout("custom")}
                          className="flex-1"
                        >
                          <Grid3x3 className="h-4 w-4 mr-2" /> 
                          Custom
                        </Button>
                      </div>
                    </div>

                    {gridLayout === "fixed" && (
                      <div className="space-y-4 pt-2 pb-2">
                        <Label>Layout Presets</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {gridPresets.map((preset, index) => (
                            <Button
                              key={index}
                              variant={(gridColumns === preset.columns && gridRows === preset.rows) ? "default" : "outline"}
                              onClick={() => {
                                setGridColumns(preset.columns);
                                setGridRows(preset.rows);
                              }}
                              className="flex items-center justify-center"
                            >
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(gridLayout === "fixed" || gridLayout === "custom") && (
                      <div className="space-y-4 pt-2 pb-2 border-l-2 pl-4 border-primary/20">
                        <div className="space-y-2">
                          <Label htmlFor="grid-columns">
                            Columns: {gridColumns}
                          </Label>
                          <div className="flex items-center gap-3">
                            <Columns2 className="h-4 w-4 text-muted-foreground" />
                            <Slider
                              id="grid-columns"
                              value={[gridColumns]}
                              min={1}
                              max={12}
                              step={1}
                              className="flex-1"
                              onValueChange={(value) => setGridColumns(value[0])}
                            />
                            <Columns4 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input 
                            type="number" 
                            min={1} 
                            max={12} 
                            value={gridColumns}
                            className="mt-1 w-24"
                            onChange={(e) => setGridColumns(parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grid-rows">
                            Rows: {gridRows === 0 ? "Auto" : gridRows}
                          </Label>
                          <div className="flex items-center gap-3">
                            <Columns2 className="h-4 w-4 text-muted-foreground rotate-90" />
                            <Slider
                              id="grid-rows"
                              value={[gridRows]}
                              min={0}
                              max={12}
                              step={1}
                              className="flex-1"
                              onValueChange={(value) => setGridRows(value[0])}
                            />
                            <Columns4 className="h-4 w-4 text-muted-foreground rotate-90" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              min={0} 
                              max={12} 
                              value={gridRows}
                              className="mt-1 w-24"
                              onChange={(e) => setGridRows(parseInt(e.target.value) || 0)}
                            />
                            <span className="text-xs text-muted-foreground">
                              (0 = Auto)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Settings</CardTitle>
                    <CardDescription>
                      Configure QR code sizes and positions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 border p-3 rounded-md">
                        <Label htmlFor="qr-size">
                          Main QR Code ({qrCodeSize}px)
                        </Label>
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            id="qr-size"
                            value={[qrCodeSize]}
                            min={32}
                            max={180}
                            step={8}
                            onValueChange={(value) => setQrCodeSize(value[0])}
                            className="flex-1"
                          />
                        </div>
                        <Input 
                          type="number" 
                          min={32} 
                          max={180} 
                          value={qrCodeSize}
                          className="mt-1 w-full"
                          onChange={(e) => setQrCodeSize(parseInt(e.target.value) || 64)}
                        />
                        
                        <div className="mt-3">
                          <Label>QR Code Position</Label>
                          <RadioGroup 
                            value={qrCodePosition} 
                            onValueChange={(value: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center") => setQrCodePosition(value)} 
                            className="grid grid-cols-2 gap-2 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bottomRight" id="qr-br" />
                              <Label htmlFor="qr-br">Bottom Right</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bottomLeft" id="qr-bl" />
                              <Label htmlFor="qr-bl">Bottom Left</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="topRight" id="qr-tr" />
                              <Label htmlFor="qr-tr">Top Right</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="topLeft" id="qr-tl" />
                              <Label htmlFor="qr-tl">Top Left</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="center" id="qr-c" />
                              <Label htmlFor="qr-c">Center</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      
                      <div className="space-y-4 border p-3 rounded-md">
                        <div className="space-y-2">
                          <Label htmlFor="viewer-qr-size">
                            Image Viewer QR Code ({viewerQRCodeSize}px)
                          </Label>
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                            <Slider
                              id="viewer-qr-size"
                              value={[viewerQRCodeSize]}
                              min={32}
                              max={180}
                              step={8}
                              onValueChange={(value) => setViewerQRCodeSize(value[0])}
                              className="flex-1"
                            />
                          </div>
                          <Input 
                            type="number" 
                            min={32} 
                            max={180} 
                            value={viewerQRCodeSize}
                            className="mt-1 w-full"
                            onChange={(e) => setViewerQRCodeSize(parseInt(e.target.value) || 80)}
                          />
                        </div>

                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 mb-3">
                            <Switch 
                              id="show-header-qr" 
                              checked={showHeaderQR}
                              onCheckedChange={setShowHeaderQR}
                            />
                            <Label htmlFor="show-header-qr">Show Header QR Code</Label>
                          </div>
                          
                          {showHeaderQR && (
                            <>
                              <Label htmlFor="header-qr-size">
                                Header QR Code ({headerQRCodeSize}px)
                              </Label>
                              <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                  id="header-qr-size"
                                  value={[headerQRCodeSize]}
                                  min={32}
                                  max={180}
                                  step={8}
                                  onValueChange={(value) => setHeaderQRCodeSize(value[0])}
                                  className="flex-1"
                                />
                              </div>
                              <Input 
                                type="number" 
                                min={32} 
                                max={180} 
                                value={headerQRCodeSize}
                                className="mt-1 w-full"
                                onChange={(e) => setHeaderQRCodeSize(parseInt(e.target.value) || 48)}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6">
                {/* Auto-scroll Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Auto Scroll</CardTitle>
                    <CardDescription>
                      Configure automatic scrolling settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-scroll"
                        checked={autoScrollEnabled}
                        onCheckedChange={setAutoScrollEnabled}
                      />
                      <Label htmlFor="auto-scroll">Enable Auto Scroll</Label>
                    </div>
                    
                    {autoScrollEnabled && (
                      <div className="space-y-3 pl-6 border-l-2 border-primary/20 mt-2">
                        <div className="space-y-2">
                          <Label>Initial Scroll Direction</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={autoScrollDirection === 'down' ? 'default' : 'outline'}
                              onClick={() => setAutoScrollDirection('down')}
                              className="flex-1"
                            >
                              <ArrowDown className="h-4 w-4 mr-2" /> Down
                            </Button>
                            
                            <Button
                              type="button"
                              variant={autoScrollDirection === 'up' ? 'default' : 'outline'}
                              onClick={() => setAutoScrollDirection('up')}
                              className="flex-1"
                            >
                              <ArrowUp className="h-4 w-4 mr-2" /> Up
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="scroll-speed">
                            Scroll Speed: {autoScrollSpeed}
                          </Label>
                          <div className="flex gap-2 items-center">
                            <span className="text-sm">Slow</span>
                            <Slider
                              id="scroll-speed"
                              value={[autoScrollSpeed]}
                              min={1}
                              max={20}
                              step={1}
                              onValueChange={(value) => setAutoScrollSpeed(value[0])}
                              className="flex-1"
                            />
                            <span className="text-sm">Fast</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              min={1} 
                              max={20} 
                              value={autoScrollSpeed}
                              className="mt-1 w-24"
                              onChange={(e) => setAutoScrollSpeed(parseInt(e.target.value) || 5)}
                            />
                            <span className="text-xs text-muted-foreground">
                              (pixels per interval)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Logo settings */}
                <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                  <h3 className="text-lg font-medium">Logo Upload</h3>
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
                        <Image className="h-4 w-4 mr-2" /> Choose Logo
                      </Button>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => setLogoPreview(null)}
                        >
                          Remove Logo
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
                        Logo Size: {logoSize}px
                      </Label>
                      <Slider
                        id="logo-size"
                        value={[logoSize]}
                        min={32}
                        max={200}
                        step={4}
                        onValueChange={(value) => setLogoSize(value[0])}
                      />
                      <Input 
                        type="number" 
                        min={32} 
                        max={200} 
                        value={logoSize}
                        className="mt-1 w-24"
                        onChange={(e) => setLogoSize(parseInt(e.target.value) || 100)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Banner settings */}
                <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                  <h3 className="text-lg font-medium">Banner Upload</h3>
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
                        <Image className="h-4 w-4 mr-2" /> Choose Banner
                      </Button>
                      {bannerPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => setBannerPreview(null)}
                        >
                          Remove Banner
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
                      <Label>Banner Size (pixels)</Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <Label htmlFor="banner-size">Width: {bannerSize}px</Label>
                          <Slider
                            id="banner-size"
                            value={[bannerSize]}
                            min={50}
                            max={600}
                            step={10}
                            onValueChange={(value) => setBannerSize(value[0])}
                          />
                          <Input 
                            type="number" 
                            min={50} 
                            max={600} 
                            value={bannerSize}
                            className="mt-1 w-full"
                            onChange={(e) => setBannerSize(parseInt(e.target.value) || 200)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Label>Banner Position</Label>
                      <RadioGroup 
                        value={bannerPosition} 
                        onValueChange={(value: "bottomLeft" | "bottomRight" | "topLeft" | "topRight") => setBannerPosition(value)} 
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottomLeft" id="banner-bl" />
                          <Label htmlFor="banner-bl">Bottom Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottomRight" id="banner-br" />
                          <Label htmlFor="banner-br">Bottom Right</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="topLeft" id="banner-tl" />
                          <Label htmlFor="banner-tl">Top Left</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="topRight" id="banner-tr" />
                          <Label htmlFor="banner-tr">Top Right</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center gap-2 p-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
            className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            <RotateCw className="h-4 w-4" />
            Reset Settings
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAppSettings}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
