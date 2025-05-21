
import { ApiConfig, Photo } from "../types";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const DEFAULT_FIELDS = "files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,modifiedTime,size,iconLink)";
const MAX_RESULTS = 1000; // Increase max results
const CACHE_TIMEOUT = 30000; // ลดเหลือ 30 วินาที (จากเดิม 60 วินาที) เพื่อให้แสดงผลใหม่เร็วขึ้น
const PRIORITY_CACHE_TIMEOUT = 3000; // ลดเหลือ 3 วินาที (จากเดิม 10 วินาที) เพื่อตรวจสอบบ่อยขึ้น

// Cache for API responses to reduce API calls
let photosCache = {
  timestamp: 0,
  photos: [] as Photo[],
  folderId: ''
};

// New cache for latest photo check (เพิ่มแคชสำหรับการตรวจสอบภาพล่าสุดแยกต่างหาก)
let latestPhotoCache = {
  timestamp: 0,
  latestId: '',
  folderId: ''
};

// Fetch only the latest photo for quick check - optimized for real-time updates
export const fetchLatestPhotoFromDrive = async (config: ApiConfig): Promise<Photo | null> => {
  try {
    if (!config.apiKey || !config.folderId) {
      return null;
    }
    
    const now = Date.now();
    
    // Check if we have a valid recent cache for quick check - ลดเงื่อนไขเพื่อตรวจสอบบ่อยขึ้น
    if (
      latestPhotoCache.folderId === config.folderId &&
      latestPhotoCache.latestId &&
      now - latestPhotoCache.timestamp < PRIORITY_CACHE_TIMEOUT
    ) {
      return null; // No need to check so frequently
    }

    const params = new URLSearchParams({
      q: `'${config.folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: DEFAULT_FIELDS,
      key: config.apiKey,
      orderBy: "modifiedTime desc",
      pageSize: "1" // เอาเฉพาะภาพล่าสุดหนึ่งภาพ
    });

    const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.files || data.files.length === 0) {
      return null;
    }
    
    const latestFile = data.files[0];
    
    // Update latest photo cache
    latestPhotoCache = {
      timestamp: now,
      latestId: latestFile.id,
      folderId: config.folderId
    };
    
    // ปรับเงื่อนไขเพื่อให้ตรวจจับรูปภาพใหม่ได้ดีขึ้น - ไม่ต้องเช็คจากแคชหลัก
    // Process the latest photo
    const latestPhoto = {
      id: latestFile.id,
      name: latestFile.name,
      url: latestFile.thumbnailLink ? latestFile.thumbnailLink.replace('=s220', '=s1000') + `&t=${Date.now()}` : getPhotoUrl(latestFile.id),
      thumbnailLink: latestFile.thumbnailLink ? latestFile.thumbnailLink + `&t=${Date.now()}` : `https://drive.google.com/thumbnail?id=${latestFile.id}&t=${Date.now()}`,
      iconLink: latestFile.iconLink || `https://drive.google.com/icon?id=${latestFile.id}&t=${Date.now()}`,
      mimeType: latestFile.mimeType,
      createdTime: latestFile.createdTime,
      modifiedTime: latestFile.modifiedTime,
      size: latestFile.size || "Unknown",
      webContentLink: latestFile.webContentLink || getPhotoDownloadUrl(latestFile.id),
      fullSizeUrl: getDirectImageUrl(latestFile.id),
      directDownloadUrl: getDirectDownloadUrl(latestFile.id)
    };
    
    // ตรวจสอบว่ารูปภาพนี้มีอยู่ในแคชหลักหรือไม่
    const existsInCache = photosCache.photos.some(p => p.id === latestFile.id);
    
    // ส่งคืนรูปภาพล่าสุดเฉพาะเมื่อเป็นรูปภาพใหม่ที่ไม่อยู่ในแคช
    if (!existsInCache) {
      return latestPhoto;
    }
    
    return null;
  } catch (error) {
    console.error("Error checking latest photo:", error);
    return null;
  }
};

export const fetchPhotosFromDrive = async (config: ApiConfig): Promise<Photo[]> => {
  try {
    if (!config.apiKey || !config.folderId) {
      console.error("API Key or Folder ID is missing");
      return [];
    }
    
    // Check if we have a valid recent cache for this folder
    const now = Date.now();
    if (
      photosCache.folderId === config.folderId &&
      photosCache.photos.length > 0 &&
      now - photosCache.timestamp < CACHE_TIMEOUT
    ) {
      console.log(`Using cached photos (${photosCache.photos.length} items), cache age: ${Math.round((now - photosCache.timestamp) / 1000)}s`);
      return photosCache.photos;
    }

    console.log("Fetching fresh photos from Google Drive API");
    let allPhotos: any[] = [];
    let pageToken: string | null = null;
    
    // Use pagination to get all photos
    do {
      const params = new URLSearchParams({
        q: `'${config.folderId}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: `${DEFAULT_FIELDS}, nextPageToken`,
        key: config.apiKey,
        orderBy: "modifiedTime desc",
        pageSize: "100"
      });
      
      if (pageToken) {
        params.append("pageToken", pageToken);
      }

      const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      allPhotos = [...allPhotos, ...(data.files || [])];
      pageToken = data.nextPageToken || null;
      
      // Safety check to prevent infinite loops and excessive API calls
      if (allPhotos.length >= MAX_RESULTS) {
        console.log(`Reached maximum of ${MAX_RESULTS} photos. Stopping pagination.`);
        break;
      }
    } while (pageToken);
    
    // Transform API response into Photo objects with multiple URL options
    const processedPhotos = allPhotos.map((file: any) => ({
      id: file.id,
      name: file.name,
      // Improved URL generation with multiple fallbacks and timestamp to prevent caching
      url: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s1000') + `&t=${Date.now()}` : getPhotoUrl(file.id),
      thumbnailLink: file.thumbnailLink ? file.thumbnailLink + `&t=${Date.now()}` : `https://drive.google.com/thumbnail?id=${file.id}&t=${Date.now()}`,
      iconLink: file.iconLink || `https://drive.google.com/icon?id=${file.id}&t=${Date.now()}`,
      mimeType: file.mimeType,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size || "Unknown",
      webContentLink: file.webContentLink || getPhotoDownloadUrl(file.id),
      // Add multiple direct URLs for better compatibility
      fullSizeUrl: getDirectImageUrl(file.id),
      // Add direct download link that doesn't require login
      directDownloadUrl: getDirectDownloadUrl(file.id)
    }));
    
    // Only log when there's an actual change in the number of photos
    console.log(`Fetched ${processedPhotos.length} photos from Google Drive`);
    
    // Update latest photo cache if we have photos
    if (processedPhotos.length > 0) {
      latestPhotoCache = {
        timestamp: now,
        latestId: processedPhotos[0].id,
        folderId: config.folderId
      };
    }
    
    // Update cache
    photosCache = {
      timestamp: now,
      photos: processedPhotos,
      folderId: config.folderId
    };
    
    return processedPhotos;
  } catch (error) {
    console.error("Error fetching photos from Google Drive:", error);
    // Return cached photos if available in case of API error
    if (photosCache.photos.length > 0) {
      console.log("Returning cached photos due to API error");
      return photosCache.photos;
    }
    return [];
  }
};

// Get different types of URLs for photos for maximum compatibility
export const getPhotoUrl = (photoId: string): string => {
  // Direct link with caching prevention
  return `https://drive.google.com/uc?export=view&id=${photoId}&t=${Date.now()}`;
};

export const getPhotoDownloadUrl = (photoId: string): string => {
  // Add parameters to bypass login
  return `https://drive.google.com/uc?export=download&id=${photoId}&confirm=t&uuid=${Date.now()}`;
};

// More reliable direct image URL for viewing
export const getDirectImageUrl = (photoId: string): string => {
  return `https://lh3.googleusercontent.com/d/${photoId}?t=${Date.now()}`;
};

// Direct download URL that doesn't require login
export const getDirectDownloadUrl = (photoId: string): string => {
  return `https://drive.usercontent.google.com/download?id=${photoId}&export=download&authuser=0&confirm=t&uuid=${Date.now()}`;
};

// Get the folder URL from folder ID
export const getFolderUrl = (folderId: string): string => {
  return `https://drive.google.com/drive/folders/${folderId}`;
};

// Pre-fetch image to improve rendering performance
export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Helper to get best available image URL with fallbacks
export const getBestImageUrl = (photo: Photo): string => {
  return photo.fullSizeUrl || photo.webContentLink || photo.url;
};
