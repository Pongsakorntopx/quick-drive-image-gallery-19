import { Photo, PhotoFetchResult, Language } from "../types";
import { SortOrder } from "./AppContextTypes";
import { fetchPhotosFromDrive, fetchLatestPhotoFromDrive } from "../services/googleDriveService";

// Service cache for API calls
const serviceCache = {
  lastFetchTime: 0,
  lastResults: null as PhotoFetchResult | null,
};

// Clear service cache - needed for reset functionality
export const clearServiceCache = () => {
  serviceCache.lastFetchTime = 0;
  serviceCache.lastResults = null;
};

// Function to sort photos based on sort order
export const sortPhotos = (photos: Photo[], sortOrder: SortOrder): Photo[] => {
  if (!photos || photos.length === 0) return [];

  const sortedPhotos = [...photos];
  
  return sortedPhotos.sort((a, b) => {
    const fieldA = a[sortOrder.field];
    const fieldB = b[sortOrder.field];
    
    // Handle undefined or null values
    if (!fieldA && fieldA !== "") return sortOrder.direction === "asc" ? -1 : 1;
    if (!fieldB && fieldB !== "") return sortOrder.direction === "asc" ? 1 : -1;
    
    // For string comparisons
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortOrder.direction === "asc" 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    
    // For date strings
    if (sortOrder.field === "modifiedTime" || sortOrder.field === "createdTime") {
      const dateA = fieldA ? new Date(fieldA as string).getTime() : 0;
      const dateB = fieldB ? new Date(fieldB as string).getTime() : 0;
      return sortOrder.direction === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    // Default comparison
    return 0;
  });
};

// Function to check if photos have changed
export const checkIfPhotosChanged = (oldPhotos: Photo[], newPhotos: Photo[]): boolean => {
  if (oldPhotos.length !== newPhotos.length) {
    return true;
  }
  
  // Create maps for faster lookups
  const oldPhotoMap = new Map(oldPhotos.map(photo => [photo.id, photo]));
  const newPhotoMap = new Map(newPhotos.map(photo => [photo.id, photo]));
  
  // Check if any photos are missing from either array
  for (const photo of oldPhotos) {
    if (!newPhotoMap.has(photo.id)) {
      return true;
    }
  }
  
  for (const photo of newPhotos) {
    if (!oldPhotoMap.has(photo.id)) {
      return true;
    }
  }
  
  // Check if any photos have different modified times
  for (const photo of newPhotos) {
    const oldPhoto = oldPhotoMap.get(photo.id);
    if (oldPhoto?.modifiedTime !== photo.modifiedTime) {
      return true;
    }
  }
  
  return false;
};

// Function to find new photos that were not in the old list
export const findNewPhotos = (oldPhotos: Photo[], newPhotos: Photo[]): Photo[] => {
  const oldPhotoIds = new Set(oldPhotos.map(photo => photo.id));
  return newPhotos.filter(photo => !oldPhotoIds.has(photo.id));
};

// Function to get the latest photo timestamp
export const getLatestPhotoTimestamp = (photos: Photo[]): string | undefined => {
  if (!photos || photos.length === 0) return undefined;
  
  // Find the photo with the most recent timestamp
  return photos.reduce((latest, photo) => {
    const photoTime = photo.modifiedTime || photo.createdTime;
    if (!photoTime) return latest;
    
    if (!latest) return photoTime;
    
    // Compare dates
    return new Date(photoTime) > new Date(latest) ? photoTime : latest;
  }, undefined as string | undefined);
};

// Function to insert a new photo while preserving sort order
export const insertNewPhoto = (
  existingPhotos: Photo[], 
  newPhoto: Photo, 
  sortOrder: SortOrder
): Photo[] => {
  const updatedPhotos = [...existingPhotos];
  updatedPhotos.push(newPhoto);
  return sortPhotos(updatedPhotos, sortOrder);
};

// Async function to check for new photos with minimal API usage
export const checkForNewPhotos = async (
  apiConfig: { apiKey: string; folderId: string },
  language: Language,
  latestTimestamp?: string,
  forceRefresh: boolean = false
): Promise<Photo | null> => {
  try {
    // If we don't have a latest timestamp or force refresh is enabled, we can't do an optimized check
    if (!latestTimestamp || forceRefresh) {
      const result = await fetchAndProcessPhotos(apiConfig, language, {
        field: "modifiedTime",
        direction: "desc"
      }, true);
      
      if (result.success && result.data && result.data.length > 0) {
        // Return the most recent photo
        return result.data[0];
      }
      return null;
    }
    
    // Otherwise, do an optimized API call to check only for photos newer than the latest timestamp
    const newPhoto = await fetchLatestPhotoFromDrive(apiConfig, true);
    return newPhoto;
  } catch (error) {
    console.error("Error checking for new photos:", error);
    return null;
  }
};

// Main function to fetch and process photos with optimizations
export const fetchAndProcessPhotos = async (
  apiConfig: { apiKey: string; folderId: string },
  language: Language,
  sortOrder: SortOrder,
  forceRefresh: boolean = false
): Promise<PhotoFetchResult> => {
  try {
    // Check if we need to use the cache
    const now = Date.now();
    const cacheTime = 1000; // 1 second cache
    
    if (!forceRefresh && 
        serviceCache.lastResults && 
        now - serviceCache.lastFetchTime < cacheTime) {
      console.log("Using cached photos result");
      return serviceCache.lastResults;
    }
    
    // Fetch photos from API
    const photos = await fetchPhotosFromDrive(apiConfig, forceRefresh);
    
    if (photos && photos.length > 0) {
      // Update cache
      serviceCache.lastFetchTime = now;
      
      // Sort the photos according to the sort order
      const sortedPhotos = sortPhotos(photos, sortOrder);
      
      const result = {
        success: true,
        data: sortedPhotos,
      };
      
      serviceCache.lastResults = result;
      return result;
    } else {
      return {
        success: false,
        error: language === "th" ? 
          "ไม่สามารถดึงข้อมูลรูปภาพ" : 
          "Failed to fetch photos"
      };
    }
  } catch (error) {
    console.error("Error in fetchAndProcessPhotos:", error);
    return {
      success: false,
      error: language === "th" ? 
        "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ" : 
        "Error fetching photos",
    };
  }
};
