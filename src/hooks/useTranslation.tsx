
import { useAppContext } from "../context/AppContext";
import { getTranslation } from "../config/translations";

export type TranslationKeys =
  | "settings.notifications.enable"
  | "settings.notifications.enableDescription"
  | "settings.notifications.duration"
  | "settings.notifications.durationDescription"
  | "app.footer"
  | "toast.connection.success"
  | "toast.connection.error"
  | "setup.welcome"
  | "setup.instructions"
  | "setup.apiKey"
  | "setup.apiKeyPlaceholder"
  | "setup.folderId"
  | "setup.folderIdPlaceholder"
  | "setup.connecting"
  | "setup.start"
  | "setup.reset";

export function useTranslation() {
  const { settings } = useAppContext();
  const { language } = settings;

  function t(key: TranslationKeys, values?: Record<string, any>) {
    return getTranslation(key, language, values);
  }

  return { t, language };
}
