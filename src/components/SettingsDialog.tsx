
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AppSettings } from "../types";
import { Bell, Upload } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { fontCategories } from "../config/fonts";

const SettingsDialog: React.FC = () => {
  const {
    settings,
    setSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    notificationsEnabled,
    setNotificationsEnabled
  } = useAppContext();

  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setTempSettings(settings);
    setLogoPreview(settings.logoUrl);
    setBannerPreview(settings.bannerUrl);
  }, [settings, isSettingsOpen]);

  const handleSave = () => {
    // Process logo upload if available
    if (logoFile) {
      const logoReader = new FileReader();
      logoReader.onloadend = () => {
        const base64Logo = logoReader.result as string;
        setSettings({
          ...tempSettings,
          logoUrl: base64Logo
        });
      };
      logoReader.readAsDataURL(logoFile);
    } else {
      // Process banner upload if available
      if (bannerFile) {
        const bannerReader = new FileReader();
        bannerReader.onloadend = () => {
          const base64Banner = bannerReader.result as string;
          setSettings({
            ...tempSettings,
            bannerUrl: base64Banner
          });
        };
        bannerReader.readAsDataURL(bannerFile);
      } else {
        // No files to process, just save settings
        setSettings(tempSettings);
      }
    }
    setIsSettingsOpen(false);
  };

  const updateSettings = (key: keyof AppSettings, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = (parentKey: string, key: string, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey as keyof typeof prev] as Record<string, unknown>),
        [key]: value,
      },
    }));
  };

  const handleFontChange = (fontId: string) => {
    // Flatten all font categories to find the selected font
    const allFonts = Object.values(fontCategories).flatMap(category => category.fonts);
    const selectedFont = allFonts.find((font) => font.id === fontId);
    if (selectedFont) {
      updateSettings("font", selectedFont);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {settings.language === "th"
              ? "การตั้งค่าแอปพลิเคชัน"
              : "Application Settings"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList>
            <TabsTrigger value="general">
              {settings.language === "th" ? "ทั่วไป" : "General"}
            </TabsTrigger>
            <TabsTrigger value="appearance">
              {settings.language === "th" ? "รูปลักษณ์" : "Appearance"}
            </TabsTrigger>
            <TabsTrigger value="layout">
              {settings.language === "th" ? "เค้าโครง" : "Layout"}
            </TabsTrigger>
            <TabsTrigger value="advanced">
              {settings.language === "th" ? "ขั้นสูง" : "Advanced"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>
                  {settings.language === "th" ? "ชื่อแกลเลอรี่" : "Gallery Title"}
                </Label>
                <Input
                  value={tempSettings.title}
                  onChange={(e) => updateSettings("title", e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-title"
                  checked={tempSettings.showTitle}
                  onCheckedChange={(checked) => updateSettings("showTitle", checked)}
                />
                <Label htmlFor="show-title">
                  {settings.language === "th" ? "แสดงชื่อแกลเลอรี่" : "Show Gallery Title"}
                </Label>
              </div>
              
              <div>
                <Label>
                  {settings.language === "th" ? "ขนาดตัวอักษรชื่อแกลเลอรี่" : "Title Font Size"}
                </Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[tempSettings.titleSize]}
                    min={16}
                    max={48}
                    step={1}
                    onValueChange={(values) => updateSettings("titleSize", values[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{tempSettings.titleSize}px</span>
                </div>
              </div>
              
              <div>
                <Label>
                  {settings.language === "th" ? "รีเฟรชข้อมูลทุกๆ" : "Refresh Interval"}
                </Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[tempSettings.refreshInterval]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={(values) => updateSettings("refreshInterval", values[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{tempSettings.refreshInterval}s</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications-enabled"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
                <Label htmlFor="notifications-enabled" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {settings.language === "th" ? "แสดงการแจ้งเตือน" : "Show Notifications"}
                </Label>
              </div>
              
              <div className="border p-4 rounded-lg bg-muted/30">
                <h3 className="text-sm font-medium mb-1">
                  {settings.language === "th" ? "การเลื่อนอัตโนมัติ" : "Auto Scroll"}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-scroll-enabled"
                      checked={tempSettings.autoScrollEnabled}
                      onCheckedChange={(checked) => updateSettings("autoScrollEnabled", checked)}
                    />
                    <Label htmlFor="auto-scroll-enabled">
                      {settings.language === "th" ? "เปิดการเลื่อนอัตโนมัติ" : "Enable Auto Scroll"}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className="min-w-[80px]">
                      {settings.language === "th" ? "ทิศทาง" : "Direction"}:
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant={tempSettings.autoScrollDirection === "down" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSettings("autoScrollDirection", "down")}
                        className="h-8"
                      >
                        {settings.language === "th" ? "ลง" : "Down"}
                      </Button>
                      <Button
                        type="button"
                        variant={tempSettings.autoScrollDirection === "up" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSettings("autoScrollDirection", "up")}
                        className="h-8"
                      >
                        {settings.language === "th" ? "ขึ้น" : "Up"}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>
                      {settings.language === "th" ? "ความเร็วในการเลื่อน" : "Auto Scroll Speed"}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[tempSettings.autoScrollSpeed]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={(values) => updateSettings("autoScrollSpeed", values[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{tempSettings.autoScrollSpeed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div>
              <Label>
                {settings.language === "th" ? "รูปแบบธีม" : "Theme Mode"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tempSettings.themeMode === "light" ? "default" : "outline"}
                  onClick={() => updateSettings("themeMode", "light")}
                >
                  {settings.language === "th" ? "สว่าง" : "Light"}
                </Button>
                <Button
                  variant={tempSettings.themeMode === "dark" ? "default" : "outline"}
                  onClick={() => updateSettings("themeMode", "dark")}
                >
                  {settings.language === "th" ? "มืด" : "Dark"}
                </Button>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ภาษา" : "Language"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tempSettings.language === "th" ? "default" : "outline"}
                  onClick={() => updateSettings("language", "th")}
                >
                  ไทย
                </Button>
                <Button
                  variant={tempSettings.language === "en" ? "default" : "outline"}
                  onClick={() => updateSettings("language", "en")}
                >
                  English
                </Button>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ฟอนต์" : "Font"}
              </Label>
              
              {/* Font categories */}
              <Tabs defaultValue="thai" className="mt-2">
                <TabsList className="w-full flex-wrap h-auto py-1">
                  {Object.entries(fontCategories).map(([key, category]) => (
                    <TabsTrigger key={key} value={key} className="text-xs">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(fontCategories).map(([key, category]) => (
                  <TabsContent key={key} value={key} className="mt-2">
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {category.fonts.map((font) => (
                        <Button
                          key={font.id}
                          variant={tempSettings.font.id === font.id ? "default" : "outline"}
                          onClick={() => handleFontChange(font.id)}
                          className={font.class}
                        >
                          {font.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ขนาดตัวอักษร (คำบรรยาย)" : "Font Size (Subtitle)"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.fontSize.subtitle]}
                  min={12}
                  max={20}
                  step={1}
                  onValueChange={(values) => updateNestedSettings("fontSize", "subtitle", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.fontSize.subtitle}px</span>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ขนาดตัวอักษร (เนื้อหา)" : "Font Size (Body)"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.fontSize.body]}
                  min={10}
                  max={18}
                  step={1}
                  onValueChange={(values) => updateNestedSettings("fontSize", "body", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.fontSize.body}px</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label>
                {settings.language === "th" ? "รูปแบบการจัดเรียง" : "Grid Layout"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tempSettings.gridLayout === "googlePhotos" ? "default" : "outline"}
                  onClick={() => updateSettings("gridLayout", "googlePhotos")}
                >
                  {settings.language === "th" ? "Google Photos" : "Google Photos"}
                </Button>
                <Button
                  variant={tempSettings.gridLayout === "fixed" ? "default" : "outline"}
                  onClick={() => updateSettings("gridLayout", "fixed")}
                >
                  {settings.language === "th" ? "คงที่" : "Fixed"}
                </Button>
                <Button
                  variant={tempSettings.gridLayout === "custom" ? "default" : "outline"}
                  onClick={() => updateSettings("gridLayout", "custom")}
                >
                  {settings.language === "th" ? "กำหนดเอง" : "Custom"}
                </Button>
                <Button
                  variant={tempSettings.gridLayout === "auto" ? "default" : "outline"}
                  onClick={() => updateSettings("gridLayout", "auto")}
                >
                  {settings.language === "th" ? "อัตโนมัติ" : "Auto"}
                </Button>
              </div>
            </div>
            
            {tempSettings.gridLayout === "fixed" || tempSettings.gridLayout === "custom" ? (
              <>
                <div>
                  <Label>
                    {settings.language === "th" ? "จำนวนคอลัมน์" : "Number of Columns"}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[tempSettings.gridColumns]}
                      min={1}
                      max={12}
                      step={1}
                      onValueChange={(values) => updateSettings("gridColumns", values[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{tempSettings.gridColumns}</span>
                  </div>
                </div>
                
                <div>
                  <Label>
                    {settings.language === "th" ? "จำนวนแถว" : "Number of Rows"}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[tempSettings.gridRows]}
                      min={0}
                      max={5}
                      step={1}
                      onValueChange={(values) => updateSettings("gridRows", values[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{tempSettings.gridRows}</span>
                  </div>
                </div>
              </>
            ) : null}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label>
                {settings.language === "th" ? "ขนาด QR Code" : "QR Code Size"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.qrCodeSize]}
                  min={32}
                  max={128}
                  step={8}
                  onValueChange={(values) => updateSettings("qrCodeSize", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.qrCodeSize}px</span>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ขนาด QR Code ใน Header" : "Header QR Code Size"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.headerQRCodeSize]}
                  min={24}
                  max={96}
                  step={8}
                  onValueChange={(values) => updateSettings("headerQRCodeSize", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.headerQRCodeSize}px</span>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ขนาด QR Code ใน ImageViewer" : "ImageViewer QR Code Size"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.viewerQRCodeSize]}
                  min={40}
                  max={160}
                  step={8}
                  onValueChange={(values) => updateSettings("viewerQRCodeSize", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.viewerQRCodeSize}px</span>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ตำแหน่ง QR Code" : "QR Code Position"}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={tempSettings.qrCodePosition === "bottomRight" ? "default" : "outline"}
                  onClick={() => updateSettings("qrCodePosition", "bottomRight")}
                >
                  {settings.language === "th" ? "ขวาล่าง" : "Bottom Right"}
                </Button>
                <Button
                  variant={tempSettings.qrCodePosition === "bottomLeft" ? "default" : "outline"}
                  onClick={() => updateSettings("qrCodePosition", "bottomLeft")}
                >
                  {settings.language === "th" ? "ซ้ายล่าง" : "Bottom Left"}
                </Button>
                <Button
                  variant={tempSettings.qrCodePosition === "topRight" ? "default" : "outline"}
                  onClick={() => updateSettings("qrCodePosition", "topRight")}
                >
                  {settings.language === "th" ? "ขวาบน" : "Top Right"}
                </Button>
                <Button
                  variant={tempSettings.qrCodePosition === "topLeft" ? "default" : "outline"}
                  onClick={() => updateSettings("qrCodePosition", "topLeft")}
                >
                  {settings.language === "th" ? "ซ้ายบน" : "Top Left"}
                </Button>
                <Button
                  variant={tempSettings.qrCodePosition === "center" ? "default" : "outline"}
                  onClick={() => updateSettings("qrCodePosition", "center")}
                >
                  {settings.language === "th" ? "ตรงกลาง" : "Center"}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-header-qr"
                checked={tempSettings.showHeaderQR}
                onCheckedChange={(checked) => updateSettings("showHeaderQR", checked)}
              />
              <Label htmlFor="show-header-qr">
                {settings.language === "th" ? "แสดง QR Code ใน Header" : "Show QR Code in Header"}
              </Label>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "โลโก้" : "Logo"}
              </Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {settings.language === "th" ? "อัพโหลดโลโก้" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                        updateSettings("logoUrl", null);
                      }}
                    >
                      {settings.language === "th" ? "ลบ" : "Remove"}
                    </Button>
                  )}
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoPreview && (
                  <div className="p-2 border rounded-md mt-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="max-h-20 mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ขนาดโลโก้" : "Logo Size"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.logoSize]}
                  min={50}
                  max={200}
                  step={5}
                  onValueChange={(values) => updateSettings("logoSize", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.logoSize}px</span>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "แบนเนอร์" : "Banner"}
              </Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {settings.language === "th" ? "อัพโหลดแบนเนอร์" : "Upload Banner"}
                  </Button>
                  {bannerPreview && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => {
                        setBannerPreview(null);
                        setBannerFile(null);
                        updateSettings("bannerUrl", null);
                      }}
                    >
                      {settings.language === "th" ? "ลบ" : "Remove"}
                    </Button>
                  )}
                </div>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
                {bannerPreview && (
                  <div className="p-2 border rounded-md mt-2">
                    <img 
                      src={bannerPreview} 
                      alt="Banner Preview" 
                      className="max-h-20 mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ขนาดแบนเนอร์" : "Banner Size"}
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[tempSettings.bannerSize]}
                  min={50}
                  max={400}
                  step={10}
                  onValueChange={(values) => updateSettings("bannerSize", values[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{tempSettings.bannerSize}px</span>
              </div>
            </div>
            
            <div>
              <Label>
                {settings.language === "th" ? "ตำแหน่งแบนเนอร์" : "Banner Position"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tempSettings.bannerPosition === "bottomLeft" ? "default" : "outline"}
                  onClick={() => updateSettings("bannerPosition", "bottomLeft")}
                >
                  {settings.language === "th" ? "ซ้ายล่าง" : "Bottom Left"}
                </Button>
                <Button
                  variant={tempSettings.bannerPosition === "bottomRight" ? "default" : "outline"}
                  onClick={() => updateSettings("bannerPosition", "bottomRight")}
                >
                  {settings.language === "th" ? "ขวาล่าง" : "Bottom Right"}
                </Button>
                <Button
                  variant={tempSettings.bannerPosition === "topLeft" ? "default" : "outline"}
                  onClick={() => updateSettings("bannerPosition", "topLeft")}
                >
                  {settings.language === "th" ? "ซ้ายบน" : "Top Left"}
                </Button>
                <Button
                  variant={tempSettings.bannerPosition === "topRight" ? "default" : "outline"}
                  onClick={() => updateSettings("bannerPosition", "topRight")}
                >
                  {settings.language === "th" ? "ขวาบน" : "Top Right"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
            {settings.language === "th" ? "ยกเลิก" : "Cancel"}
          </Button>
          <Button onClick={handleSave}>
            {settings.language === "th" ? "บันทึก" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
