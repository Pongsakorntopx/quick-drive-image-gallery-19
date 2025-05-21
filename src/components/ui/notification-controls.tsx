
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { Slider } from "@/components/ui/slider";

export function NotificationControls() {
  const { t } = useTranslation();
  const { notificationsEnabled, setNotificationsEnabled, toastDuration, setToastDuration } = useAppContext();
  
  const handleNotificationChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
  };
  
  const handleDurationChange = (value: number[]) => {
    setToastDuration(value[0]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="notifications" className="flex flex-col space-y-1">
          <span>{t("settings.notifications.enable")}</span>
          <span className="font-normal text-sm text-muted-foreground">
            {t("settings.notifications.enableDescription")}
          </span>
        </Label>
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={handleNotificationChange}
        />
      </div>
      
      {notificationsEnabled && (
        <div className="space-y-2">
          <Label htmlFor="toast-duration" className="flex flex-col space-y-1">
            <span>{t("settings.notifications.duration")}</span>
            <span className="font-normal text-sm text-muted-foreground">
              {t("settings.notifications.durationDescription", { seconds: toastDuration })}
            </span>
          </Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="toast-duration"
              defaultValue={[toastDuration]}
              min={1}
              max={10}
              step={1}
              value={[toastDuration]}
              onValueChange={handleDurationChange}
              className="w-full"
            />
            <span className="w-12 text-sm font-medium">
              {toastDuration}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
