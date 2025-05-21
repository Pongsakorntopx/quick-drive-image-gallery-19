
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useInView } from "react-intersection-observer";
import { Photo } from "../types";

// Import grid components
import GridItem from "./grid/GridItem";
import GridContainer from "./grid/GridContainer";
import GridLoading from "./grid/GridLoading";
import GridError from "./grid/GridError";
import SortControls from "./grid/SortControls";

// Define a type for the virtualized photo
interface VirtualizedPhoto {
  id: string;
  index: number;
  isNew?: boolean; // Flag to mark newly added photos
}

const PhotoGrid: React.FC = () => {
  const { 
    photos, 
    isLoading, 
    error, 
    refreshPhotos, 
    setSelectedPhoto, 
    settings,
    sortOrder,
    setSortOrder,
    sortPhotos
  } = useAppContext();

  const gridRef = useRef<HTMLDivElement>(null);
  const [virtualizedPhotos, setVirtualizedPhotos] = useState<VirtualizedPhoto[]>([]);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '300px', // Increased to preload more images
  });

  // Previous photos ref to prevent unnecessary updates
  const prevPhotosLength = useRef<number>(0);
  // Keep track of the last known photo IDs for quick comparison
  const lastKnownPhotoIds = useRef<Set<string>>(new Set());
  // Track if initial setup has been done
  const initialSetupDone = useRef<boolean>(false);
  // Store previous photos for comparison
  const prevPhotosRef = useRef<Photo[]>([]);

  // Batch size for virtualization
  const batchSize = 32;
  
  // Sorted photos using the context sort function
  const sortedPhotos = useMemo(() => sortPhotos(photos), [photos, sortOrder]);
  
  // Find newly added photos by comparing current and previous photos
  const getNewPhotoIds = () => {
    const prevIds = new Set(prevPhotosRef.current.map(p => p.id));
    return sortedPhotos.filter(photo => !prevIds.has(photo.id)).map(p => p.id);
  };
  
  // Enhanced function for adding new photos with animation
  const updateVirtualizedPhotosWithNewOnes = (newSortedPhotos: Photo[]) => {
    if (newSortedPhotos.length === 0) return;
    
    // Get IDs of new photos
    const newPhotoIds = new Set(getNewPhotoIds());
    console.log("📷 New photo IDs:", Array.from(newPhotoIds));
    
    // Get current virtualized photos IDs for comparison
    const currentIds = new Set(virtualizedPhotos.map(vp => vp.id));
    
    // Find photos that need to be added to virtualized list
    const newPhotosToAdd: VirtualizedPhoto[] = [];
    
    for (let i = 0; i < newSortedPhotos.length; i++) {
      const photo = newSortedPhotos[i];
      
      // Check if this is a new photo to add to virtualized list
      if (!currentIds.has(photo.id)) {
        newPhotosToAdd.push({
          id: photo.id,
          index: i,
          isNew: newPhotoIds.has(photo.id) // Mark as new if it's a new photo
        });
        
        // Update our set of known photo IDs
        lastKnownPhotoIds.current.add(photo.id);
      }
    }
    
    // If we found new photos, add them to the virtualized list (at the beginning for newest photos)
    if (newPhotosToAdd.length > 0) {
      console.log(`✨ Adding ${newPhotosToAdd.length} photos to the virtualized list`);
      setVirtualizedPhotos(prev => {
        // Filter out any photos that no longer exist
        const currentPhotoIds = new Set(newSortedPhotos.map(p => p.id));
        const existingPhotos = prev.filter(vp => currentPhotoIds.has(vp.id));
        
        // Create a fresh array with updated indices
        const updatedPrevPhotos = existingPhotos.map((vp) => ({
          id: vp.id,
          index: newSortedPhotos.findIndex(p => p.id === vp.id),
          isNew: vp.isNew
        })).sort((a, b) => a.index - b.index); // Sort by index
        
        // Combine new and existing photos
        return [...newPhotosToAdd, ...updatedPrevPhotos];
      });
    }
    
    // Update previous photos ref
    prevPhotosRef.current = [...newSortedPhotos];
  };
  
  // Listen for changes to the photos array for immediate updates
  useEffect(() => {
    if (initialSetupDone.current && sortedPhotos.length > 0) {
      // If we have new photos, update the virtualized list immediately
      updateVirtualizedPhotosWithNewOnes(sortedPhotos);
      prevPhotosLength.current = sortedPhotos.length;
    }
  }, [sortedPhotos]);
  
  // Initial setup effect for the first load
  useEffect(() => {
    if (sortedPhotos.length > 0 && !initialSetupDone.current) {
      // Initial batch of photos - load more initially
      const initialBatch = sortedPhotos.slice(0, batchSize).map((photo, index) => ({
        id: photo.id,
        index,
        isNew: false
      }));
      
      setVirtualizedPhotos(initialBatch);
      initialSetupDone.current = true;
      
      // Set up the initial known photo IDs
      lastKnownPhotoIds.current = new Set(sortedPhotos.map(p => p.id));
      
      // Set previous photos reference
      prevPhotosRef.current = [...sortedPhotos];
      prevPhotosLength.current = sortedPhotos.length;
    }
  }, [sortedPhotos]);
  
  // Handle sort order changes
  useEffect(() => {
    // Reset virtualized photos when sort order changes
    if (sortedPhotos.length > 0) {
      const initialBatch = sortedPhotos.slice(0, batchSize).map((photo, index) => ({
        id: photo.id,
        index,
        isNew: false // Not new when sorting changes
      }));
      setVirtualizedPhotos(initialBatch);
    }
  }, [sortOrder]);

  // Handle lazy loading of more photos when scrolling - improved with preloading
  useEffect(() => {
    if (inView && sortedPhotos.length > virtualizedPhotos.length) {
      const nextBatch = sortedPhotos
        .slice(virtualizedPhotos.length, virtualizedPhotos.length + batchSize)
        .map((photo, index) => ({
          id: photo.id,
          index: virtualizedPhotos.length + index,
          isNew: false // Not new when lazy loading
        }));
      
      setVirtualizedPhotos(prev => [...prev, ...nextBatch]);
    }
  }, [inView, sortedPhotos, virtualizedPhotos.length]);

  // Memoize the photo lookup for better performance
  const photoMap = useMemo(() => {
    const map = new Map();
    sortedPhotos.forEach(photo => {
      map.set(photo.id, photo);
    });
    return map;
  }, [sortedPhotos]);

  // Create the masonry layout with improved performance
  useEffect(() => {
    // Only calculate for masonry layouts
    if (settings.gridLayout !== "googlePhotos" && settings.gridLayout !== "auto") {
      return;
    }
    
    if (virtualizedPhotos.length > 0 && gridRef.current) {
      const resizeAllGridItems = () => {
        const allItems = gridRef.current?.querySelectorAll(".masonry-item");
        if (allItems) {
          allItems.forEach((item) => {
            const itemElement = item as HTMLElement;
            const rowHeight = 10;
            const rowGap = 16; // Must match grid-gap in CSS
            const contentElement = itemElement.querySelector(".masonry-content");
            
            if (contentElement) {
              const rowSpan = Math.ceil(
                (contentElement.getBoundingClientRect().height + rowGap) /
                  (rowHeight + rowGap)
              );
              itemElement.style.gridRowEnd = `span ${rowSpan}`;
              
              // Improve fade-in animation
              if (!itemElement.classList.contains('loaded')) {
                itemElement.classList.add('loaded');
                itemElement.style.opacity = "1";
                itemElement.style.transform = "translateY(0)";
              }
            }
          });
        }
      };

      // Use IntersectionObserver with bigger margins for improved lazy loading images
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');
            if (img && img.dataset.src) {
              // Create a new image to preload
              const preloadImg = new Image();
              preloadImg.onload = () => {
                if (img) {
                  img.src = img.dataset.src as string;
                  img.onload = () => {
                    resizeAllGridItems();
                    // Add loaded class to parent for animation
                    const parentItem = img.closest('.masonry-item');
                    if (parentItem) {
                      parentItem.classList.add('image-loaded');
                    }
                  };
                  delete img.dataset.src;
                }
              };
              preloadImg.src = img.dataset.src as string;
            }
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '300px', // Load images further outside viewport (increased from 200px)
        threshold: 0.01
      });
      
      // Observe all masonry items
      const allItems = gridRef.current.querySelectorAll(".masonry-item");
      allItems.forEach(item => observer.observe(item));

      // Use ResizeObserver for responsive adjustments
      const resizeObserver = new ResizeObserver(() => {
        resizeAllGridItems();
      });

      if (gridRef.current) {
        resizeObserver.observe(gridRef.current);
      }

      // Initial layout calculation
      resizeAllGridItems();
      
      // Improved initial layout timing with multiple passes
      setTimeout(resizeAllGridItems, 50);
      setTimeout(resizeAllGridItems, 300);
      setTimeout(resizeAllGridItems, 1000);

      return () => {
        if (gridRef.current) {
          resizeObserver.unobserve(gridRef.current);
          allItems.forEach(item => observer.unobserve(item));
        }
      };
    }
  }, [virtualizedPhotos, settings.gridLayout]);

  // Handle sort order change
  const handleSortChange = (newSortOrder: typeof sortOrder) => {
    setSortOrder(newSortOrder);
  };

  if (error) {
    return <GridError error={error} onRetry={refreshPhotos} />;
  }

  return (
    <div className="px-2 py-4 md:px-4 md:py-6 responsive-container">
      {/* Sort controls */}
      {photos.length > 0 && (
        <SortControls 
          sortOrder={sortOrder} 
          onChange={handleSortChange}
          language={settings.language}
        />
      )}

      {isLoading && photos.length === 0 ? (
        <GridLoading count={12} />
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
          <div className="rounded-full h-8 w-8 border-4 border-t-transparent border-primary animate-spin"></div>
        </div>
      ) : (
        <>
          <GridContainer 
            gridLayout={settings.gridLayout} 
            gridColumns={settings.gridColumns} 
            ref={gridRef} 
            photos={photos}
          >
            {virtualizedPhotos.map((vPhoto, idx) => {
              const photo = photoMap.get(vPhoto.id);
              
              return photo ? (
                <GridItem 
                  key={vPhoto.id} 
                  photo={photo} 
                  onClick={setSelectedPhoto} 
                  gridLayout={settings.gridLayout}
                  gridRows={settings.gridRows}
                  index={idx}
                  isNew={vPhoto.isNew === true} // Pass the isNew flag
                />
              ) : null;
            })}
          </GridContainer>
          
          {/* Load more trigger element */}
          {virtualizedPhotos.length < photos.length && (
            <div 
              ref={loadMoreRef} 
              className="w-full h-20 flex items-center justify-center mt-4"
            >
              <div className="rounded-full h-8 w-8 border-4 border-t-transparent border-primary animate-spin"></div>
            </div>
          )}

          {/* Show when all photos are loaded */}
          {virtualizedPhotos.length === photos.length && photos.length > 0 && (
            <div className="w-full flex items-center justify-center mt-6 mb-2 text-muted-foreground text-sm">
              <p>{settings.language === "th" ? `แสดงรูปภาพทั้งหมด (${photos.length} รูป)` : `Showing all photos (${photos.length})`}</p>
            </div>
          )}
        </>
      )}
      
      <style>
        {`
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          grid-auto-rows: 10px;
          grid-gap: 16px;
          will-change: transform; /* Performance optimization */
        }
        .masonry-item {
          margin-bottom: 0;
          overflow: hidden;
          border-radius: 8px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
          will-change: opacity, transform;
        }
        .masonry-item.loaded {
          opacity: 1;
          transform: translateY(0);
        }
        .masonry-content {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform, box-shadow;
        }
        .masonry-content:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
        }

        /* Improved animation for newly loaded images */
        .image-loaded img {
          animation: fadeIn 0.5s ease-out forwards;
        }

        /* Responsive grid for different screen sizes */
        @media (max-width: 640px) {
          .masonry-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 8px;
          }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .masonry-grid {
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 12px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .masonry-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .masonry-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        @media (min-width: 1281px) {
          .masonry-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        /* Enhanced animation classes */
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
          will-change: opacity, transform; /* Performance hint */
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Animation for new photos */
        .fresh-image {
          animation: pulseIn 0.8s ease-out;
        }
        
        @keyframes pulseIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Special highlight for new images */
        .new-photo {
          position: relative;
          animation: fadeInScale 0.6s ease-out;
        }
        
        .new-photo::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 8px;
          box-shadow: 0 0 0 3px #10b981;
          z-index: 5;
          opacity: 1;
          animation: pulseBorder 2s ease-out forwards;
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulseBorder {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8);
            opacity: 1;
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
            opacity: 0.6;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
};

export default PhotoGrid;
