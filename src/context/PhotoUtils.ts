
import { Photo, PhotoFetchResult } from "../types";
import { fetchPhotosFromDrive } from "../services/googleDriveService";
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

// Find new photos that are not in the current collection
export const findNewPhotos = (oldPhotos: Photo[], newPhotos: Photo[]): Photo[] => {
  if (oldPhotos.length === 0) {
    return newPhotos; // All are new if old list is empty
  }
  
  const currentIds = new Set(oldPhotos.map(p => p.id));
  return newPhotos.filter(p => !currentIds.has(p.id));
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
