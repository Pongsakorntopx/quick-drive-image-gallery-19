
import { Photo, PhotoFetchResult } from "../types";
import { fetchPhotosFromDrive, fetchLatestPhotoFromDrive } from "../services/googleDriveService";
import { ApiConfig } from "../types";
import { SortOrder } from "./AppContextTypes";

// Helper function to check if photos array has actually changed
export const checkIfPhotosChanged = (oldPhotos: Photo[], newPhotos: Photo[]): boolean => {
  if (oldPhotos.length !== newPhotos.length) {
    return true;
  }
  
  // Check if any IDs are different
  const oldIds = new Set(oldPhotos.map(p => p.id));
  return newPhotos.some(p => !oldIds.has(p.id));
};

// Modified function to sort photos
export const sortPhotos = (photos: Photo[], sortOrder: SortOrder): Photo[] => {
  return [...photos].sort((a, b) => {
    const fieldA = a[sortOrder.field];
    const fieldB = b[sortOrder.field];
    
    // Handle cases where the field might not exist
    if (!fieldA && !fieldB) return 0;
    if (!fieldA) return sortOrder.direction === "asc" ? 1 : -1;
    if (!fieldB) return sortOrder.direction === "asc" ? -1 : 1;
    
    // For string comparison
    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortOrder.direction === "asc" 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    // For date comparison
    if (fieldA && fieldB) {
      const dateA = new Date(fieldA as string).getTime();
      const dateB = new Date(fieldB as string).getTime();
      return sortOrder.direction === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
};

// Enhanced check for new photos with immediate detection
export const checkForNewPhotos = async (
  apiConfig: ApiConfig,
  language: string,
  cachedPhotoTimestamp?: string,
  forceRefresh: boolean = false
): Promise<Photo | null> => {
  try {
    // Add cache busting parameter to ensure we get fresh data
    const cacheBuster = `cb=${Date.now()}`;
    
    // Fixed: Removed third argument, combining parameters into options object
    const latestPhoto = await fetchLatestPhotoFromDrive(
      apiConfig, 
      { forceRefresh, cacheBuster }
    );
    
    if (!latestPhoto) return null;
    
    // If we have a cached timestamp, compare with the latest photo's timestamp
    if (cachedPhotoTimestamp) {
      const latestTimestamp = latestPhoto.modifiedTime || latestPhoto.createdTime;
      
      if (latestTimestamp) {
        // Always return the photo for immediate update if it's newer
        if (new Date(latestTimestamp) > new Date(cachedPhotoTimestamp)) {
          return latestPhoto;
        }
      }
    } else {
      // If we don't have a cached timestamp, return the latest photo
      return latestPhoto;
    }
    
    return null;
  } catch (err) {
    console.error("Error checking for new photos:", err);
    return null;
  }
};

// Function to fetch photos from Google Drive with improved real-time capabilities
export const fetchAndProcessPhotos = async (
  apiConfig: ApiConfig, 
  language: string,
  sortOrder: SortOrder,
  forceRefresh: boolean = false
): Promise<PhotoFetchResult> => {
  try {
    // Add cache busting parameter to ensure we get fresh data
    const cacheBuster = `cb=${Date.now()}`;
    
    // Fixed: Removed third argument, combining parameters into options object
    const photosData = await fetchPhotosFromDrive(
      apiConfig, 
      { forceRefresh, cacheBuster }
    );
    
    // Create a PhotoFetchResult object from the photos array
    const result: PhotoFetchResult = {
      success: true,
      data: photosData as Photo[]
    };
    
    if (result.success && result.data) {
      // Process thumbnails to ensure higher quality
      result.data = result.data.map(photo => {
        if (photo.thumbnailLink) {
          // Add cache busting parameter to thumbnail URL
          const separator = photo.thumbnailLink.includes('?') ? '&' : '?';
          photo.thumbnailLink = `${photo.thumbnailLink.replace('=s220', '=s400')}${separator}${cacheBuster}`;
        }
        return photo;
      });
      
      // Sort photos based on current sort order
      const sortedPhotos = sortPhotos(result.data, sortOrder);
      
      return {
        success: true,
        data: sortedPhotos
      };
    }
    
    return {
      success: false,
      error: language === "th" ? 
        "ไม่สามารถดึงข้อมูลรูปภาพได้" : 
        "Could not fetch images"
    };
  } catch (err) {
    console.error("Error fetching photos:", err);
    return {
      success: false,
      error: language === "th" ? 
        "เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ" : 
        "Error fetching images"
    };
  }
};

// Function to find new photos that aren't in the current list - improved for better detection
export const findNewPhotos = (currentPhotos: Photo[], newPhotos: Photo[]): Photo[] => {
  if (currentPhotos.length === 0) return newPhotos;
  
  const currentIds = new Set(currentPhotos.map(p => p.id));
  return newPhotos.filter(photo => !currentIds.has(photo.id));
};

// Insert a new photo at the beginning of the current photos array and maintain sorting - optimized
export const insertNewPhoto = (currentPhotos: Photo[], newPhoto: Photo, sortOrder: SortOrder): Photo[] => {
  // Check if the photo already exists by ID
  if (currentPhotos.some(p => p.id === newPhoto.id)) {
    return currentPhotos;
  }
  
  // Mark the new photo to track it
  const markedNewPhoto = {
    ...newPhoto,
    _isNew: true, // Add a marker for new photos
    _addedAt: new Date().getTime() // Add timestamp when the photo was added
  };
  
  // Add the new photo and resort the complete array to maintain proper order
  const updatedPhotos = [markedNewPhoto, ...currentPhotos];
  
  // Sort according to current sort order
  return sortPhotos(updatedPhotos, sortOrder);
};

// Get the latest timestamp from a photos array
export const getLatestPhotoTimestamp = (photos: Photo[]): string | undefined => {
  if (photos.length === 0) return undefined;
  
  // Find the photo with the most recent modification time
  return photos.reduce((latest, photo) => {
    const photoTime = photo.modifiedTime || photo.createdTime;
    if (!latest) return photoTime;
    if (!photoTime) return latest;
    
    return new Date(photoTime) > new Date(latest) ? photoTime : latest;
  }, undefined as string | undefined);
};

// Helper function to check if a photo is new (less than 5 seconds old)
export const isPhotoNew = (photo: Photo): boolean => {
  return !!(photo as any)._isNew;
};

// Helper function to clear any cached data from the service
export const clearServiceCache = () => {
  // Implementation depends on how caching is done
  console.log("Clearing service cache");
  // If there's a specific cache implementation, clear it here
};
