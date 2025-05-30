
import React from 'react';
import { ApiConfig, Photo, AppSettings, Theme, Font, PhotoFetchResult, Language, ThemeMode } from "../types";

// Context interface
export interface AppContextType {
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  isLoading: boolean;
  error: string | null;
  refreshPhotos: () => Promise<boolean>;
  selectedPhoto: Photo | null;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<Photo | null>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  themes: Theme[];
  fonts: Font[];
  resetAllData: () => void;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  toastDuration: number;
  setToastDuration: React.Dispatch<React.SetStateAction<number>>;
  sortPhotos: (photos: Photo[]) => Photo[];
}

// Sort order type
export type SortOrder = {
  field: "name" | "modifiedTime" | "createdTime";
  direction: "asc" | "desc";
};

// Default sort order
export const defaultSortOrder: SortOrder = {
  field: "modifiedTime",
  direction: "desc",
};
