
import { ApiConfig, Photo } from "../types";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const DEFAULT_FIELDS = "files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,modifiedTime,size,iconLink)";
const MAX_RESULTS = 1000; // Increase max results
const CACHE_TIMEOUT = 30000; // 30 วินาที
const PRIORITY_CACHE_TIMEOUT = 2000; // ลดเหลือ 2 วินาที เพื่อตรวจสอบบ่อยยิ่งขึ้น

// Cache for API responses to reduce API calls
let photosCache = {
  timestamp: 0,
  photos: [] as Photo[],
  folderId: ''
};

// Cache for latest photo check
let latestPhotoCache = {
  timestamp: 0,
  latestId: '',
  folderId: ''
};

// Fetch only the latest photo for quick check - optimized for real-time updates
export const fetchLatestPhotoFromDrive = async (
  config: ApiConfig, 
  forceRefresh: boolean = false
): Promise<Photo | null> => {
  try {
    if (!config.apiKey || !config.folderId) {
      return null;
    }
    
    const now = Date.now();
    
    // Skip cache if forceRefresh is true or cache timeout is expired
    if (
      !forceRefresh && 
      latestPhotoCache.folderId === config.folderId &&
      latestPhotoCache.latestId &&
      now - latestPhotoCache.timestamp < PRIORITY_CACHE_TIMEOUT
    ) {
      return null; // Use cache
    }

    // Generate a unique timestamp to prevent API caching
    const cacheBreaker = `&_nocache=${Date.now()}`;

    const params = new URLSearchParams({
      q: `'${config.folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: DEFAULT_FIELDS,
      key: config.apiKey,
      orderBy: "modifiedTime desc",
      pageSize: "1" // Only get the latest photo
    });

    const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}${cacheBreaker}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error("Error fetching latest photo:", response.statusText);
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
    
    // Check if this photo already exists in main cache
    const existsInCache = photosCache.photos.some(p => p.id === latestFile.id);
    
    // Process the latest photo
    const timestamp = Date.now();
    const latestPhoto = {
      id: latestFile.id,
      name: latestFile.name,
      url: latestFile.thumbnailLink ? latestFile.thumbnailLink.replace('=s220', '=s1000') + `&t=${timestamp}` : getPhotoUrl(latestFile.id, timestamp),
      thumbnailLink: latestFile.thumbnailLink ? latestFile.thumbnailLink + `&t=${timestamp}` : `https://drive.google.com/thumbnail?id=${latestFile.id}&t=${timestamp}`,
      iconLink: latestFile.iconLink || `https://drive.google.com/icon?id=${latestFile.id}&t=${timestamp}`,
      mimeType: latestFile.mimeType,
      createdTime: latestFile.createdTime,
      modifiedTime: latestFile.modifiedTime,
      size: latestFile.size || "Unknown",
      webContentLink: latestFile.webContentLink || getPhotoDownloadUrl(latestFile.id, timestamp),
      fullSizeUrl: getDirectImageUrl(latestFile.id, timestamp),
      directDownloadUrl: getDirectDownloadUrl(latestFile.id, timestamp)
    };
    
    // If the photo is new or force refresh is true, return it for immediate update
    if (!existsInCache || forceRefresh) {
      console.log("New photo detected or force refresh requested:", latestFile.name);
      
      // Add to cache if it's a new photo
      if (!existsInCache) {
        photosCache.photos = [latestPhoto, ...photosCache.photos];
      }
      
      return latestPhoto;
    }
    
    return null;
  } catch (error) {
    console.error("Error checking latest photo:", error);
    return null;
  }
};

export const fetchPhotosFromDrive = async (
  config: ApiConfig,
  forceRefresh: boolean = false
): Promise<Photo[]> => {
  try {
    if (!config.apiKey || !config.folderId) {
      console.error("API Key or Folder ID is missing");
      return [];
    }
    
    // Check if we have a valid recent cache for this folder
    const now = Date.now();
    if (
      !forceRefresh &&
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
    
    // Generate a unique timestamp to prevent API caching
    const cacheBreaker = `&_nocache=${Date.now()}`;
    
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

      const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}${cacheBreaker}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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
    
    // Generate a timestamp for all URLs to prevent browser caching
    const timestamp = Date.now();
    
    // Transform API response into Photo objects with multiple URL options
    const processedPhotos = allPhotos.map((file: any) => ({
      id: file.id,
      name: file.name,
      url: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s1000') + `&t=${timestamp}` : getPhotoUrl(file.id, timestamp),
      thumbnailLink: file.thumbnailLink ? file.thumbnailLink + `&t=${timestamp}` : `https://drive.google.com/thumbnail?id=${file.id}&t=${timestamp}`,
      iconLink: file.iconLink || `https://drive.google.com/icon?id=${file.id}&t=${timestamp}`,
      mimeType: file.mimeType,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size || "Unknown",
      webContentLink: file.webContentLink || getPhotoDownloadUrl(file.id, timestamp),
      fullSizeUrl: getDirectImageUrl(file.id, timestamp),
      directDownloadUrl: getDirectDownloadUrl(file.id, timestamp)
    }));
    
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
export const getPhotoUrl = (photoId: string, timestamp: number = Date.now()): string => {
  // Direct link with caching prevention
  return `https://drive.google.com/uc?export=view&id=${photoId}&t=${timestamp}`;
};

export const getPhotoDownloadUrl = (photoId: string, timestamp: number = Date.now()): string => {
  // Add parameters to bypass login
  return `https://drive.google.com/uc?export=download&id=${photoId}&confirm=t&uuid=${timestamp}`;
};

// More reliable direct image URL for viewing
export const getDirectImageUrl = (photoId: string, timestamp: number = Date.now()): string => {
  return `https://lh3.googleusercontent.com/d/${photoId}?t=${timestamp}`;
};

// Direct download URL that doesn't require login
export const getDirectDownloadUrl = (photoId: string, timestamp: number = Date.now()): string => {
  return `https://drive.usercontent.google.com/download?id=${photoId}&export=download&authuser=0&confirm=t&uuid=${timestamp}`;
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

// Function to clear service cache - useful for forcing a full refresh
export const clearServiceCache = (): void => {
  photosCache = {
    timestamp: 0,
    photos: [],
    folderId: ''
  };
  
  latestPhotoCache = {
    timestamp: 0,
    latestId: '',
    folderId: ''
  };
  
  console.log("Service cache cleared");
};
