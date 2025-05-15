
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppContext } from "../context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

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

  // Filter themes by type
  const solidThemes = themes.filter(theme => !theme.isGradient);
  const gradientThemes = themes.filter(theme => theme.isGradient);

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
      qrCodeSize,
      refreshInterval,
    });
    
    setIsSettingsOpen(false);
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
    
    toast({
      title: "รีเซ็ตการตั้งค่า",
      description: "การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้น"
    });
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ตั้งค่า</DialogTitle>
        </DialogHeader>
        
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folderId">Folder ID</Label>
              <Input
                id="folderId"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="ใส่ ID ของโฟลเดอร์ที่มีรูปภาพ"
              />
              <p className="text-sm text-muted-foreground">
                สามารถดู Folder ID ได้จาก URL ของโฟลเดอร์ใน Google Drive
              </p>
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
            
            <div className="space-y-4">
              <Label className="text-lg font-medium">ธีมสี</Label>
              
              <div className="space-y-2">
                <Label className="text-sm">สีพื้นฐาน</Label>
                <div className="grid grid-cols-5 gap-2">
                  {solidThemes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeId(theme.id)}
                      className={`h-12 w-full rounded-md border-2 transition-all ${
                        themeId === theme.id ? 'border-ring scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: theme.color }}
                    >
                      <span className="sr-only">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">ไล่ระดับสี (Gradients)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {gradientThemes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeId(theme.id)}
                      className={`h-16 w-full rounded-md border-2 transition-all ${theme.gradient} ${
                        themeId === theme.id ? 'border-ring scale-105' : 'border-transparent'
                      }`}
                    >
                      <span className="font-medium text-white drop-shadow-md">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
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
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-size">ขนาด QR Code: {qrCodeSize}px</Label>
              <Slider
                id="qr-size"
                value={[qrCodeSize]}
                min={32}
                max={128}
                step={8}
                onValueChange={(value) => setQrCodeSize(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refresh-interval">ระยะเวลาในการรีเฟรช: {refreshInterval} วินาที</Label>
              <Slider
                id="refresh-interval"
                value={[refreshInterval]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setRefreshInterval(value[0])}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
            className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            <RotateCw className="h-4 w-4" />
            รีเซ็ตการตั้งค่าทั้งหมด
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
