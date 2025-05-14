
import { ApiConfig, Photo } from "../types";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const DEFAULT_FIELDS = "files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,modifiedTime,size)";

export const fetchPhotosFromDrive = async (config: ApiConfig): Promise<Photo[]> => {
  try {
    if (!config.apiKey || !config.folderId) {
      console.error("API Key or Folder ID is missing");
      return [];
    }

    const params = new URLSearchParams({
      q: `'${config.folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: DEFAULT_FIELDS,
      key: config.apiKey,
      orderBy: "modifiedTime desc",
      pageSize: "100"
    });

    const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      // Use thumbnailLink for preview display
      url: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s1000') : getPhotoUrl(file.id),
      thumbnailUrl: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}`,
      mimeType: file.mimeType,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size || "Unknown",
      webContentLink: file.webContentLink || getPhotoDownloadUrl(file.id),
      // Add multiple direct URLs for better compatibility
      fullSizeUrl: getDirectImageUrl(file.id)
    }));
  } catch (error) {
    console.error("Error fetching photos from Google Drive:", error);
    return [];
  }
};

export const getPhotoUrl = (photoId: string): string => {
  // Direct link with caching prevention
  return `https://drive.google.com/uc?export=view&id=${photoId}&t=${Date.now()}`;
};

export const getPhotoDownloadUrl = (photoId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${photoId}`;
};

// More reliable direct image URL for viewing
export const getDirectImageUrl = (photoId: string): string => {
  return `https://lh3.googleusercontent.com/d/${photoId}?t=${Date.now()}`;
};
