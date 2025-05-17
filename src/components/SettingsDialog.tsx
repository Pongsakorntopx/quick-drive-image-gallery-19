
import React, { useState, useRef } from "react";
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

const SettingsDialog: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    setSettings,
    themes,
    fonts,
    apiConfig,
    setApiConfig,
    refreshPhotos
  } = useAppContext();

  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [folderId, setFolderId] = useState(apiConfig.folderId);
  const [title, setTitle] = useState(settings.title);
  const [qrCodeSize, setQrCodeSize] = useState(settings.qrCodeSize);
  const [refreshInterval, setRefreshInterval] = useState(settings.refreshInterval);
  const [titleFont, setTitleFont] = useState(settings.font.id);
  const [titleSize, setTitleSize] = useState(settings.fontSize.title);
  const [subtitleSize, setSubtitleSize] = useState(settings.fontSize.subtitle);
  const [bodySize, setBodySize] = useState(settings.fontSize.body);
  const [themeId, setThemeId] = useState(settings.theme.id);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Font color settings
  const [fontColor, setFontColor] = useState(settings.fontColor || "#000000");
  const [useGradientFont, setUseGradientFont] = useState(settings.useGradientFont || false);
  const [fontGradientStart, setFontGradientStart] = useState(settings.fontGradientStart || "#000000");
  const [fontGradientEnd, setFontGradientEnd] = useState(settings.fontGradientEnd || "#555555");
  
  // Settings for QR code and logo
  const [qrCodePosition, setQrCodePosition] = useState(settings.qrCodePosition);
  const [showHeaderQR, setShowHeaderQR] = useState(settings.showHeaderQR);
  const [logoSize, setLogoSize] = useState(settings.logoSize || 100);
  
  // Banner settings
  const [bannerSize, setBannerSize] = useState(settings.bannerSize);
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
      theme: selectedTheme,
      font: selectedFont,
      fontSize: {
        title: titleSize,
        subtitle: subtitleSize,
        body: bodySize,
      },
      fontColor,
      useGradientFont,
      fontGradientStart,
      fontGradientEnd,
      qrCodeSize,
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
      autoScrollSpeed
    });
    
    setIsSettingsOpen(false);
    
    toast({
      title: "บันทึกการตั้งค่า",
      description: "การตั้งค่าถูกบันทึกเรียบร้อยแล้ว"
    });
  };

  // Reset all settings to default values
  const handleResetSettings = () => {
    // Reset the form values
    setTitle("แกลเลอรี่รูปภาพ Google Drive");
    setThemeId(themes[0].id);
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
    setFontColor("#000000");
    setUseGradientFont(false);
    setFontGradientStart("#000000");
    setFontGradientEnd("#555555");
    setBannerPreview(null);
    setBannerSize("medium");
    setBannerPosition("bottomLeft");
    setAutoScrollEnabled(false);
    setAutoScrollDirection("down");
    setAutoScrollSpeed(10);
    
    toast({
      title: "รีเซ็ตการตั้งค่า",
      description: "การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้น"
    });
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
    
    // Set font color styling
    const getFontColor = () => {
      if (useGradientFont) {
        return {
          background: `linear-gradient(to right, ${fontGradientStart}, ${fontGradientEnd})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        };
      }
      return { color: fontColor };
    };

    return (
      <div className="mt-6 space-y-4">
        <div className="flex justify-center gap-4 mb-2">
          <Button 
            variant={previewDevice === 'desktop' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('desktop')}
            className="px-2"
          >
            <Monitor className="h-4 w-4 mr-1" /> คอม
          </Button>
          <Button 
            variant={previewDevice === 'tablet' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('tablet')}
            className="px-2"
          >
            <Tablet className="h-4 w-4 mr-1" /> แท็บเล็ต
          </Button>
          <Button 
            variant={previewDevice === 'mobile' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setPreviewDevice('mobile')}
            className="px-2"
          >
            <Smartphone className="h-4 w-4 mr-1" /> มือถือ
          </Button>
        </div>
        
        <div className={`${deviceClass} border rounded-lg shadow-md`}>
          <div className="bg-background h-full">
            <div className={`${contentClass}`}>
              <div className="rounded-lg p-3 shadow-sm border">
                <h2 
                  className={`${selectedFont.class} font-bold`} 
                  style={{
                    fontSize: `${titleSize}px`,
                    ...getFontColor()
                  }}
                >
                  {title || "แกลเลอรี่รูปภาพ"}
                </h2>
                <p 
                  className={`${selectedFont.class} mt-2`} 
                  style={{
                    fontSize: `${bodySize}px`,
                    ...getFontColor()
                  }}
                >
                  ตัวอย่างข้อความที่ใช้แสดงผล
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>ตั้งค่า</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="px-4 max-h-[calc(90vh-8rem)]">
          <div className="p-1 pb-4">
            <Tabs defaultValue="api">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="api">การเชื่อมต่อ</TabsTrigger>
                <TabsTrigger value="appearance">การแสดงผล</TabsTrigger>
                <TabsTrigger value="advanced">ขั้นสูง</TabsTrigger>
              </TabsList>
              
              <TabsContent value="api" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Google Drive API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ใส่ API Key ของ Google Drive"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>API Key สามารถสร้างได้จาก <a href="https://console.cloud.google.com/apis/credentials" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>สร้าง Project ใหม่</li>
                      <li>เปิดใช้งาน Google Drive API</li>
                      <li>สร้าง API Key ใหม่จากเมนู Credentials</li>
                    </ol>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="folderId">Folder ID</Label>
                  <Input
                    id="folderId"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="ใส่ ID ของโฟลเดอร์ที่มีรูปภาพ"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>สามารถดู Folder ID ได้จาก URL ของโฟลเดอร์ใน Google Drive</p>
                    <p className="mt-2">ตัวอย่าง URL: <code className="bg-muted p-1 rounded">https://drive.google.com/drive/folders/<span className="text-primary">1a2b3c4d5e6f7g8h9i0j</span></code></p>
                    <p className="mt-1">ส่วนที่ไฮไลท์คือ Folder ID ที่ต้องนำมาใส่</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveApiSettings}>บันทึกการเชื่อมต่อ</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">ชื่อแกลเลอรี่</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ชื่อแกลเลอรี่"
                  />
                </div>
                
                <Separator className="my-4" />
                
                {/* Font Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">ตัวอักษรและสี</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font">รูปแบบตัวอักษร</Label>
                    <Select value={titleFont} onValueChange={setTitleFont}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกรูปแบบตัวอักษร" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.id} value={font.id} className={font.class}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-color">สีตัวอักษร</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="font-color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="h-10 w-16"
                      />
                      <Input
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-gradient"
                      checked={useGradientFont}
                      onCheckedChange={setUseGradientFont}
                    />
                    <Label htmlFor="use-gradient">ใช้สีไล่ระดับสำหรับตัวอักษร</Label>
                  </div>
                  
                  {useGradientFont && (
                    <div className="space-y-3 pl-6 border-l-2 border-primary/20 mt-2">
                      <div className="space-y-1">
                        <Label htmlFor="gradient-start">สีเริ่มต้น</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="gradient-start"
                            value={fontGradientStart}
                            onChange={(e) => setFontGradientStart(e.target.value)}
                            className="h-10 w-16"
                          />
                          <Input
                            value={fontGradientStart}
                            onChange={(e) => setFontGradientStart(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="gradient-end">สีสิ้นสุด</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="gradient-end"
                            value={fontGradientEnd}
                            onChange={(e) => setFontGradientEnd(e.target.value)}
                            className="h-10 w-16"
                          />
                          <Input
                            value={fontGradientEnd}
                            onChange={(e) => setFontGradientEnd(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="title-size">ขนาดตัวอักษรหัวข้อ: {titleSize}px</Label>
                    <Slider
                      id="title-size"
                      value={[titleSize]}
                      min={16}
                      max={48}
                      step={1}
                      onValueChange={(value) => setTitleSize(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle-size">ขนาดตัวอักษรหัวข้อย่อย: {subtitleSize}px</Label>
                    <Slider
                      id="subtitle-size"
                      value={[subtitleSize]}
                      min={12}
                      max={24}
                      step={1}
                      onValueChange={(value) => setSubtitleSize(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="body-size">ขนาดตัวอักษรเนื้อหา: {bodySize}px</Label>
                    <Slider
                      id="body-size"
                      value={[bodySize]}
                      min={12}
                      max={20}
                      step={1}
                      onValueChange={(value) => setBodySize(value[0])}
                    />
                  </div>
                </div>
                
                <FontPreview />
                
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                {/* Auto-scroll Settings */}
                <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                  <h3 className="text-lg font-medium">เลื่อนหน้าเว็บอัตโนมัติ</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-scroll"
                      checked={autoScrollEnabled}
                      onCheckedChange={setAutoScrollEnabled}
                    />
                    <Label htmlFor="auto-scroll">เปิดใช้งานการเลื่อนหน้าเว็บอัตโนมัติ</Label>
                  </div>
                  
                  {autoScrollEnabled && (
                    <div className="space-y-3 pl-6 border-l-2 border-primary/20 mt-2">
                      <div className="space-y-2">
                        <Label>ทิศทางการเลื่อน</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={autoScrollDirection === 'down' ? 'default' : 'outline'}
                            onClick={() => setAutoScrollDirection('down')}
                            className="flex-1"
                          >
                            <ArrowDown className="h-4 w-4 mr-2" /> เลื่อนลง
                          </Button>
                          
                          <Button
                            type="button"
                            variant={autoScrollDirection === 'up' ? 'default' : 'outline'}
                            onClick={() => setAutoScrollDirection('up')}
                            className="flex-1"
                          >
                            <ArrowUp className="h-4 w-4 mr-2" /> เลื่อนขึ้น
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scroll-speed">ความเร็วในการเลื่อน: {autoScrollSpeed}</Label>
                        <div className="flex gap-2 items-center">
                          <span className="text-sm">ช้า</span>
                          <Slider
                            id="scroll-speed"
                            value={[autoScrollSpeed]}
                            min={1}
                            max={20}
                            step={1}
                            onValueChange={(value) => setAutoScrollSpeed(value[0])}
                            className="flex-1"
                          />
                          <span className="text-sm">เร็ว</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                  <h3 className="text-lg font-medium">โลโก้</h3>
                  <div className="space-y-2">
                    <Label>อัพโหลดโลโก้</Label>
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
                        <Image className="h-4 w-4 mr-2" /> เลือกไฟล์
                      </Button>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => setLogoPreview(null)}
                        >
                          ลบ
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
                      <Label htmlFor="logo-size">ขนาดโลโก้: {logoSize}px</Label>
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
                  <h3 className="text-lg font-medium">แบนเนอร์</h3>
                  <div className="space-y-2">
                    <Label>อัพโหลดรูปแบนเนอร์</Label>
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
                        <Image className="h-4 w-4 mr-2" /> เลือกไฟล์
                      </Button>
                      {bannerPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => setBannerPreview(null)}
                        >
                          ลบ
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
                      <Label>ขนาด</Label>
                      <Select 
                        value={bannerSize} 
                        onValueChange={(value: "small" | "medium" | "large") => setBannerSize(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกขนาด" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">เล็ก</SelectItem>
                          <SelectItem value="medium">กลาง</SelectItem>
                          <SelectItem value="large">ใหญ่</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="mt-2">
                      <Label>ตำแหน่ง</Label>
                      <RadioGroup 
                        value={bannerPosition} 
                        onValueChange={(value: "bottomLeft" | "bottomRight" | "topLeft" | "topRight") => setBannerPosition(value)} 
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottomLeft" id="banner-bl" />
                          <Label htmlFor="banner-bl">ล่างซ้าย</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottomRight" id="banner-br" />
                          <Label htmlFor="banner-br">ล่างขวา</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="topLeft" id="banner-tl" />
                          <Label htmlFor="banner-tl">บนซ้าย</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="topRight" id="banner-tr" />
                          <Label htmlFor="banner-tr">บนขวา</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 border p-4 rounded-md bg-muted/10">
                  <h3 className="text-lg font-medium">QR Code</h3>
                  <div className="space-y-2">
                    <Label htmlFor="qr-size">ขนาด QR Code: {qrCodeSize}px</Label>
                    <Slider
                      id="qr-size"
                      value={[qrCodeSize]}
                      min={32}
                      max={180}
                      step={8}
                      onValueChange={(value) => setQrCodeSize(value[0])}
                    />
                    
                    <div className="mt-4">
                      <Label>ตำแหน่ง QR Code บนรูปภาพ</Label>
                      <RadioGroup 
                        value={qrCodePosition} 
                        onValueChange={(value: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center") => setQrCodePosition(value)} 
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottomRight" id="qr-br" />
                          <Label htmlFor="qr-br">ล่างขวา</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottomLeft" id="qr-bl" />
                          <Label htmlFor="qr-bl">ล่างซ้าย</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="topRight" id="qr-tr" />
                          <Label htmlFor="qr-tr">บนขวา</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="topLeft" id="qr-tl" />
                          <Label htmlFor="qr-tl">บนซ้าย</Label>
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
                      <Label htmlFor="show-header-qr">แสดง QR Code ในส่วนหัวตลอดเวลา</Label>
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
            รีเซ็ตการตั้งค่า
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveAppSettings}>
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
