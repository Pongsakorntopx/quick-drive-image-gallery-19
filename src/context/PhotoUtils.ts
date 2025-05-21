
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

// Check for new photos without fetching all photos
export const checkForNewPhotos = async (
  apiConfig: ApiConfig,
  language: string
): Promise<Photo | null> => {
  try {
    // Fetch only the latest photo to check if there's something new
    const latestPhoto = await fetchLatestPhotoFromDrive(apiConfig);
    return latestPhoto;
  } catch (err) {
    console.error("Error checking for new photos:", err);
    return null;
  }
};

// Function to fetch photos from Google Drive
export const fetchAndProcessPhotos = async (
  apiConfig: ApiConfig, 
  language: string,
  sortOrder: SortOrder
): Promise<PhotoFetchResult> => {
  try {
    // Fetch photos from Google Drive
    const photosData = await fetchPhotosFromDrive(apiConfig);
    
    // Create a PhotoFetchResult object from the photos array
    const result: PhotoFetchResult = {
      success: true,
      data: photosData as Photo[]
    };
    
    if (result.success && result.data) {
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

// Function to find new photos that aren't in the current list
export const findNewPhotos = (currentPhotos: Photo[], newPhotos: Photo[]): Photo[] => {
  if (currentPhotos.length === 0) return newPhotos;
  
  const currentIds = new Set(currentPhotos.map(p => p.id));
  return newPhotos.filter(photo => !currentIds.has(photo.id));
};

// Insert a new photo at the beginning of the current photos array and maintain sorting
export const insertNewPhoto = (currentPhotos: Photo[], newPhoto: Photo, sortOrder: SortOrder): Photo[] => {
  // Check if the photo already exists
  if (currentPhotos.some(p => p.id === newPhoto.id)) {
    return currentPhotos;
  }
  
  // Create a new array with the new photo at beginning
  const updatedPhotos = [newPhoto, ...currentPhotos];
  
  // Sort according to current sort order
  return sortPhotos(updatedPhotos, sortOrder);
};
