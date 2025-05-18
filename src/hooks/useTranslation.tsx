
import { useAppContext } from "../context/AppContext";
import { getTranslation } from "../config/translations";

export const useTranslation = () => {
  const { settings } = useAppContext();
  const language = settings?.language || "th";
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(key, language, params);
  };
  
  return { t, language };
};
