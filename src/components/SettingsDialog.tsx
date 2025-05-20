import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useAppContext } from "../context/AppContext";
import { Theme } from "@/types";
import { Font } from "@/types";
import { useTranslation } from "../hooks/useTranslation";

const SettingsDialog: React.FC = () => {
  const { 
    settings, 
    setSettings, 
    isSettingsOpen, 
    setIsSettingsOpen, 
    themes, 
    fonts,
    resetAllData 
  } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);
  const { theme: systemTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSetting = useCallback(
    (key: keyof typeof localSettings, value: any) => {
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        [key]: value,
      }));
    },
    []
  );

  const applySettings = () => {
    setSettings(localSettings);
    setIsSettingsOpen(false);
  };

  const closeDialog = () => {
    setIsSettingsOpen(false);
    setLocalSettings(settings); // Revert to original settings
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("Settings")}</DialogTitle>
          <DialogDescription>
            {t("Make changes to your gallery here. Click save when you're done.")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* General Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("General")}</h3>
            <Separator />
            
            {/* Gallery Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t("Gallery Name")}</Label>
              <Input
                id="name"
                value={localSettings.galleryName}
                onChange={(e) => updateSetting("galleryName", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            {/* Show Gallery Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showGalleryName" className="text-right">
                {t("Show Gallery Name")}
              </Label>
              <Switch
                id="showGalleryName"
                checked={localSettings.showGalleryName}
                onCheckedChange={(checked) => updateSetting("showGalleryName", checked)}
              />
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("Theme")}</h3>
            <Separator />
            
            {/* Theme Mode */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="themeMode" className="text-right">{t("Theme Mode")}</Label>
              <Select
                value={localSettings.themeMode}
                onValueChange={(value) => updateSetting("themeMode", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("Select Theme Mode")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("Light")}</SelectItem>
                  <SelectItem value="dark">{t("Dark")}</SelectItem>
                  <SelectItem value={systemTheme === "dark" ? "light" : "dark"}>
                    {t("System") + ` (${systemTheme})`}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Theme */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme" className="text-right">{t("Theme")}</Label>
              <Select
                value={localSettings.theme.id}
                onValueChange={(value) => {
                  const selectedTheme = themes.find((theme) => theme.id === value);
                  if (selectedTheme) {
                    updateSetting("theme", selectedTheme);
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("Select Theme")} />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("Font")}</h3>
            <Separator />
            
            {/* Font */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="font" className="text-right">{t("Font")}</Label>
              <Select
                value={localSettings.font.id}
                onValueChange={(value) => {
                  const selectedFont = fonts.find((font) => font.id === value);
                  if (selectedFont) {
                    updateSetting("font", selectedFont);
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("Select Font")} />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font.id} value={font.id}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font Size - Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="titleSize" className="text-right">{t("Title Size")}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="titleSize"
                  min={16}
                  max={48}
                  step={1}
                  value={[localSettings.fontSize.title]}
                  onValueChange={([value]) => updateSetting("fontSize", {...localSettings.fontSize, title: value})}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{localSettings.fontSize.title}px</span>
              </div>
            </div>
            
            {/* Font Size - Subtitle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtitleSize" className="text-right">{t("Subtitle Size")}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="subtitleSize"
                  min={12}
                  max={32}
                  step={1}
                  value={[localSettings.fontSize.subtitle]}
                  onValueChange={([value]) => updateSetting("fontSize", {...localSettings.fontSize, subtitle: value})}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{localSettings.fontSize.subtitle}px</span>
              </div>
            </div>
            
            {/* Font Size - Body */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bodySize" className="text-right">{t("Body Size")}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="bodySize"
                  min={10}
                  max={24}
                  step={1}
                  value={[localSettings.fontSize.body]}
                  onValueChange={([value]) => updateSetting("fontSize", {...localSettings.fontSize, body: value})}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{localSettings.fontSize.body}px</span>
              </div>
            </div>
          </div>

          {/* Logo Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("Logo")}</h3>
            <Separator />
            
            {/* Logo URL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logoUrl" className="text-right">{t("Logo URL")}</Label>
              <Input
                id="logoUrl"
                value={localSettings.logoUrl}
                onChange={(e) => updateSetting("logoUrl", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            {/* Show Logo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showLogo" className="text-right">
                {t("Show Logo")}
              </Label>
              <Switch
                id="showLogo"
                checked={localSettings.showLogo}
                onCheckedChange={(checked) => updateSetting("showLogo", checked)}
              />
            </div>
            
            {/* Logo Size */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logoSize" className="text-right">{t("Logo Size")}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="logoSize"
                  min={40}
                  max={160}
                  step={5}
                  value={[localSettings.logoSize]}
                  onValueChange={([value]) => updateSetting("logoSize", value)}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{localSettings.logoSize}px</span>
              </div>
            </div>
          </div>

          {/* Banner Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("Banner")}</h3>
            <Separator />
            
            {/* Banner URL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bannerUrl" className="text-right">{t("Banner URL")}</Label>
              <Input
                id="bannerUrl"
                value={localSettings.bannerUrl}
                onChange={(e) => updateSetting("bannerUrl", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            {/* Banner Position */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bannerPosition" className="text-right">{t("Banner Position")}</Label>
              <Select
                value={localSettings.bannerPosition}
                onValueChange={(value) =>
                  updateSetting("bannerPosition", value as any)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("Select Position")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottomLeft">{t("Bottom Left")}</SelectItem>
                  <SelectItem value="bottomRight">{t("Bottom Right")}</SelectItem>
                  <SelectItem value="topLeft">{t("Top Left")}</SelectItem>
                  <SelectItem value="topRight">{t("Top Right")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Banner Size */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bannerSize" className="text-right">{t("Banner Size")}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="bannerSize"
                  min={100}
                  max={400}
                  step={10}
                  value={[localSettings.bannerSize]}
                  onValueChange={([value]) => updateSetting("bannerSize", value)}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{localSettings.bannerSize}px</span>
              </div>
            </div>
          </div>

          {/* QR Code Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("QR Code Settings")}</h3>
            <Separator />
            
            <div className="grid gap-4 py-2">
              {/* QR Code Position */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="qrCodePosition" className="text-right">{t("QR Code Position")}</Label>
                <Select
                  value={localSettings.qrCodePosition}
                  onValueChange={(value) =>
                    updateSetting("qrCodePosition", value as any)
                  }
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder={t("Select Position")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottomRight">{t("Bottom Right")}</SelectItem>
                    <SelectItem value="bottomLeft">{t("Bottom Left")}</SelectItem>
                    <SelectItem value="topRight">{t("Top Right")}</SelectItem>
                    <SelectItem value="topLeft">{t("Top Left")}</SelectItem>
                    <SelectItem value="center">{t("Center")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Image Card QR Code Size */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="qrCodeSize" className="text-right">{t("Card QR Size")}</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Slider
                    id="qrCodeSize"
                    min={60}
                    max={200}
                    step={10}
                    value={[localSettings.qrCodeSize]}
                    onValueChange={([value]) => updateSetting("qrCodeSize", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm">{localSettings.qrCodeSize}px</span>
                </div>
              </div>
              
              {/* Header QR Code Size */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="headerQRCodeSize" className="text-right">{t("Header QR Size")}</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Slider
                    id="headerQRCodeSize"
                    min={80}
                    max={240}
                    step={10}
                    value={[localSettings.headerQRCodeSize]}
                    onValueChange={([value]) => updateSetting("headerQRCodeSize", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm">{localSettings.headerQRCodeSize}px</span>
                </div>
              </div>
              
              {/* Viewer QR Code Size */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="viewerQRCodeSize" className="text-right">{t("Viewer QR Size")}</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Slider
                    id="viewerQRCodeSize"
                    min={100}
                    max={300}
                    step={10}
                    value={[localSettings.viewerQRCodeSize]}
                    onValueChange={([value]) => updateSetting("viewerQRCodeSize", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm">{localSettings.viewerQRCodeSize}px</span>
                </div>
              </div>

              {/* Show Header QR */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="showHeaderQR" className="text-right">
                  {t("Show Header QR")}
                </Label>
                <Switch
                  id="showHeaderQR"
                  checked={localSettings.showHeaderQR}
                  onCheckedChange={(checked) => updateSetting("showHeaderQR", checked)}
                />
              </div>
            </div>
          </div>

          {/* Refresh Interval */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("Refresh")}</h3>
            <Separator />
            
            {/* Refresh Interval */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refreshInterval" className="text-right">{t("Refresh Interval")}</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="refreshInterval"
                  min={10}
                  max={300}
                  step={10}
                  value={[localSettings.refreshInterval]}
                  onValueChange={([value]) => updateSetting("refreshInterval", value)}
                  className="flex-1"
                />
                <span className="w-12 text-sm">{localSettings.refreshInterval}s</span>
              </div>
            </div>
          </div>

          {/* Grid Layout Settings */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("Grid Layout")}</h3>
            <Separator />

            {/* Grid Layout */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gridLayout" className="text-right">{t("Layout Type")}</Label>
              <Select
                value={localSettings.gridLayout}
                onValueChange={(value) =>
                  updateSetting("gridLayout", value as any)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("Select Layout")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="googlePhotos">{t("Google Photos")}</SelectItem>
                  <SelectItem value="fixed">{t("Fixed")}</SelectItem>
                  <SelectItem value="auto">{t("Auto")}</SelectItem>
                  <SelectItem value="custom">{t("Custom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid Columns */}
            {localSettings.gridLayout === "fixed" || localSettings.gridLayout === "custom" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gridColumns" className="text-right">{t("Columns")}</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="gridColumns"
                    min={1}
                    max={12}
                    step={1}
                    value={[localSettings.gridColumns]}
                    onValueChange={([value]) => updateSetting("gridColumns", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm">{localSettings.gridColumns}</span>
                </div>
              </div>
            ) : null}

            {/* Grid Rows */}
            {localSettings.gridLayout === "fixed" || localSettings.gridLayout === "custom" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gridRows" className="text-right">{t("Rows")}</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="gridRows"
                    min={1}
                    max={5}
                    step={1}
                    value={[localSettings.gridRows]}
                    onValueChange={([value]) => updateSetting("gridRows", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm">{localSettings.gridRows}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={resetAllData}>
            {t("Reset All")}
          </Button>
          <Button type="button" onClick={applySettings}>
            {t("Save changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
