
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
  isNew?: boolean;
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

  // New state to track new photo IDs
  const [newPhotoIds, setNewPhotoIds] = useState(new Set<string>());
  
  // Reference to track photo IDs that have already been processed
  const processedPhotoIds = useRef(new Set<string>());
  
  // Previous photos ref to prevent unnecessary updates
  const prevPhotosLength = useRef<number>(0);
  // Keep track of the last known photo IDs for quick comparison
  const lastKnownPhotoIds = useRef<Set<string>>(new Set());
  // Track if initial setup has been done
  const initialSetupDone = useRef<boolean>(false);

  // Batch size for virtualization - increased for better initial load
  const batchSize = 32; // Increased from 24 for better initial experience
  
  // Sorted photos using the context sort function
  const sortedPhotos = useMemo(() => sortPhotos(photos), [photos, sortOrder]);
  
  // New function to reset new photo indicators after a delay
  useEffect(() => {
    if (newPhotoIds.size > 0) {
      // Reset the highlight after 5 seconds
      const timer = setTimeout(() => {
        setNewPhotoIds(new Set());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newPhotoIds]);
  
  // Completely new approach for handling photo updates - more reliable
  useEffect(() => {
    // Skip if no photos or initial load not done
    if (sortedPhotos.length === 0) {
      return;
    }
    
    // On first load, initialize everything
    if (!initialSetupDone.current) {
      // Set up initial state
      const initialBatch = sortedPhotos.slice(0, batchSize).map((photo, index) => ({
        id: photo.id,
        index,
        isNew: false
      }));
      
      setVirtualizedPhotos(initialBatch);
      
      // Mark all current photos as processed
      sortedPhotos.forEach(photo => {
        processedPhotoIds.current.add(photo.id);
        lastKnownPhotoIds.current.add(photo.id);
      });
      
      initialSetupDone.current = true;
      prevPhotosLength.current = sortedPhotos.length;
      return;
    }
    
    // Check for new photos by comparing with our processed set
    const currentPhotoIds = new Set(sortedPhotos.map(p => p.id));
    const newPhotoIdsDetected = new Set<string>();
    
    // Find truly new photos (not in processed set)
    sortedPhotos.forEach(photo => {
      if (!processedPhotoIds.current.has(photo.id)) {
        newPhotoIdsDetected.add(photo.id);
        // Add to processed set to avoid duplicate processing
        processedPhotoIds.current.add(photo.id);
      }
    });
    
    // Handle new photos if any were detected
    if (newPhotoIdsDetected.size > 0) {
      console.log(`Found ${newPhotoIdsDetected.size} truly new photos to display`);
      
      // Update our new photo IDs state
      setNewPhotoIds(newPhotoIdsDetected);
      
      // Create updated virtualized photos with new photos at the top
      // and mark them as new
      const updatedVirtualized: VirtualizedPhoto[] = [];
      
      // First add new photos at the beginning
      let index = 0;
      sortedPhotos.forEach(photo => {
        if (newPhotoIdsDetected.has(photo.id)) {
          updatedVirtualized.push({
            id: photo.id,
            index: index++,
            isNew: true
          });
        }
      });
      
      // Then add the rest of the photos in current order
      sortedPhotos.forEach(photo => {
        if (!newPhotoIdsDetected.has(photo.id)) {
          // Only add if within our batch limit
          if (index < batchSize) {
            updatedVirtualized.push({
              id: photo.id,
              index: index++,
              isNew: false
            });
          }
        }
      });
      
      // Update virtualized photos state with new arrangement
      setVirtualizedPhotos(updatedVirtualized);
    }
    // Handle case where total photo count has changed but no new IDs
    // This covers deletions or re-ordering
    else if (sortedPhotos.length !== prevPhotosLength.current) {
      // Reset virtual photos based on current sorted order
      const resetBatch = sortedPhotos.slice(0, batchSize).map((photo, index) => ({
        id: photo.id,
        index,
        isNew: false
      }));
      
      setVirtualizedPhotos(resetBatch);
    }
    
    // Update previous length reference
    prevPhotosLength.current = sortedPhotos.length;
    
  }, [sortedPhotos, batchSize]);

  // Handle sort order changes
  useEffect(() => {
    // Reset virtualized photos when sort order changes
    if (sortedPhotos.length > 0) {
      const initialBatch = sortedPhotos.slice(0, batchSize).map((photo, index) => ({
        id: photo.id,
        index,
        isNew: false
      }));
      setVirtualizedPhotos(initialBatch);
      
      // Clear new photo indicators on sort change
      setNewPhotoIds(new Set());
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
          isNew: false
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
            newPhotoIds={newPhotoIds}
          >
            {virtualizedPhotos.map((vPhoto) => {
              const photo = photoMap.get(vPhoto.id);
              
              return photo ? (
                <GridItem 
                  key={`${vPhoto.id}-${vPhoto.isNew}`} 
                  photo={photo} 
                  onClick={setSelectedPhoto}
                  gridLayout={settings.gridLayout}
                  gridRows={settings.gridRows}
                  index={vPhoto.index}
                  isNewPhoto={vPhoto.isNew || newPhotoIds.has(vPhoto.id)}
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
        
        /* Special animation for new photos */
        .animate-pulse-highlight {
          animation: pulseHighlight 2s ease-out;
          will-change: opacity, transform, box-shadow;
        }
        
        /* New photo highlight styling */
        .new-photo-highlight {
          position: relative;
          z-index: 10;
        }
        
        .new-photo-highlight::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 10px;
          background: linear-gradient(45deg, var(--primary) 0%, transparent 50%, var(--primary) 100%);
          background-size: 400% 400%;
          animation: gradientBorder 3s ease infinite;
          z-index: -1;
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
        
        @keyframes pulseHighlight {
          0% {
            opacity: 0;
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.7);
          }
          20% {
            opacity: 1;
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0);
          }
        }
        
        @keyframes gradientBorder {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        `}
      </style>
    </div>
  );
};

export default PhotoGrid;
