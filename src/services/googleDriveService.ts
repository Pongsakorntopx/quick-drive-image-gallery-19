
import { ApiConfig, Photo } from "../types";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const DEFAULT_FIELDS = "files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,modifiedTime,size,iconLink)";
const MAX_RESULTS = 1000; // Increase max results
const CACHE_TIMEOUT = 30000; // Reduce cache timeout to 30 seconds for more frequent updates

// Cache for API responses to reduce API calls
let photosCache = {
  timestamp: 0,
  photos: [] as Photo[],
  folderId: ''
};

export const fetchPhotosFromDrive = async (config: ApiConfig, skipCache: boolean = false): Promise<Photo[]> => {
  try {
    if (!config.apiKey || !config.folderId) {
      console.error("API Key or Folder ID is missing");
      return [];
    }
    
    // Check if we have a valid recent cache for this folder and not skipping cache
    const now = Date.now();
    if (
      !skipCache &&
      photosCache.folderId === config.folderId &&
      photosCache.photos.length > 0 &&
      now - photosCache.timestamp < CACHE_TIMEOUT
    ) {
      console.log(`Using cached photos (${photosCache.photos.length} items), cache age: ${Math.round((now - photosCache.timestamp) / 1000)}s`);
      return photosCache.photos;
    }

    console.log(`Fetching ${skipCache ? 'fresh' : 'new'} photos from Google Drive API`);
    let allPhotos: any[] = [];
    let pageToken: string | null = null;
    
    // Use pagination to get all photos
    do {
      const params = new URLSearchParams({
        q: `'${config.folderId}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: `${DEFAULT_FIELDS}, nextPageToken`,
        key: config.apiKey,
        orderBy: "modifiedTime desc",
        pageSize: "100",
        // Add a unique timestamp to prevent browser caching
        _: Date.now().toString()
      });
      
      if (pageToken) {
        params.append("pageToken", pageToken);
      }

      const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}`, {
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
    
    // Transform API response into Photo objects with multiple URL options and optimized performance
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
    if (processedPhotos.length !== photosCache.photos.length) {
      console.log(`Fetched ${processedPhotos.length} photos from Google Drive (previously had ${photosCache.photos.length})`);
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

// Get different types of URLs for photos for maximum compatibility and performance
export const getPhotoUrl = (photoId: string): string => {
  // Direct link with caching prevention
  return `https://drive.google.com/uc?export=view&id=${photoId}&t=${Date.now()}`;
};

export const getPhotoDownloadUrl = (photoId: string): string => {
  // Add parameters to bypass login
  return `https://drive.google.com/uc?export=download&id=${photoId}&confirm=t&uuid=${Date.now()}`;
};

// More reliable direct image URL for viewing with improved performance
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

// Pre-fetch multiple images in batches to improve loading performance
export const preloadImages = async (urls: string[], batchSize: number = 5): Promise<void> => {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(batch.map(url => preloadImage(url)));
  }
};

// Helper to get best available image URL with fallbacks
export const getBestImageUrl = (photo: Photo): string => {
  return photo.fullSizeUrl || photo.webContentLink || photo.url;
};
