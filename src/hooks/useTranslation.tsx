
import { useAppContext } from "../context/AppContext";

type TranslationKeys =
  | "settings.notifications.enable"
  | "settings.notifications.enableDescription"
  | "settings.notifications.duration"
  | "settings.notifications.durationDescription"
  | "app.footer";

export function useTranslation() {
  const { settings } = useAppContext();
  const { language } = settings;

  const translations: Record<TranslationKeys, Record<string, string>> = {
    "settings.notifications.enable": {
      en: "Enable Notifications",
      th: "เปิดใช้งานการแจ้งเตือน"
    },
    "settings.notifications.enableDescription": {
      en: "Show toast notifications for new photos and other events",
      th: "แสดงการแจ้งเตือนเมื่อมีรูปภาพใหม่และเหตุการณ์อื่นๆ"
    },
    "settings.notifications.duration": {
      en: "Notification Duration",
      th: "ระยะเวลาการแสดงการแจ้งเตือน"
    },
    "settings.notifications.durationDescription": {
      en: "How long notifications will stay visible (seconds)",
      th: "ระยะเวลาที่การแจ้งเตือนจะแสดงผล (วินาที)"
    },
    "app.footer": {
      en: "© {year} Google Drive Photo Gallery",
      th: "© {year} แกลเลอรี่รูปภาพจาก Google Drive"
    }
  };

  function t(key: TranslationKeys, values?: Record<string, any>) {
    let text = translations[key]?.[language] || translations[key]?.["en"] || key;
    
    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, value);
      });
    }
    
    return text;
  }

  return { t, language };
}
