import React, { useEffect, useRef, useState } from "react";
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
  });

  // Previous photos ref to prevent unnecessary updates
  const prevPhotosLength = useRef<number>(0);

  // Batch size for virtualization - increased for better initial load
  const batchSize = 24; 

  // Sorted photos using the context sort function
  const sortedPhotos = sortPhotos(photos);
  
  // Calculate optimized layout for masonry grid
  useEffect(() => {
    if (sortedPhotos.length > 0 && prevPhotosLength.current !== sortedPhotos.length) {
      // Only update when the photos array actually changes
      if (virtualizedPhotos.length === 0) {
        // Initial batch of photos
        const initialBatch = sortedPhotos.slice(0, batchSize).map((photo, index) => ({
          id: photo.id,
          index,
        }));
        setVirtualizedPhotos(initialBatch);
      } else {
        // Keep existing photos and add any new ones if needed
        const existingIds = new Set(virtualizedPhotos.map(vp => vp.id));
        const newBatch = sortedPhotos
          .slice(0, Math.max(virtualizedPhotos.length, batchSize))
          .map((photo, index) => ({
            id: photo.id,
            index,
          }))
          .filter(vp => !existingIds.has(vp.id));
          
        if (newBatch.length > 0) {
          setVirtualizedPhotos(prev => [...newBatch, ...prev]); // New photos at the beginning
        }
      }
      
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
      }));
      setVirtualizedPhotos(initialBatch);
    }
  }, [sortOrder]);

  // Handle lazy loading of more photos when scrolling
  useEffect(() => {
    if (inView && sortedPhotos.length > virtualizedPhotos.length) {
      const nextBatch = sortedPhotos
        .slice(virtualizedPhotos.length, virtualizedPhotos.length + batchSize)
        .map((photo, index) => ({
          id: photo.id,
          index: virtualizedPhotos.length + index,
        }));
      
      setVirtualizedPhotos(prev => [...prev, ...nextBatch]);
    }
  }, [inView, sortedPhotos, virtualizedPhotos]);

  // Memoize the photo lookup for better performance
  const photoMap = React.useMemo(() => {
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
              
              // Add fade-in effect when loaded
              if (!itemElement.classList.contains('loaded')) {
                itemElement.classList.add('loaded');
                itemElement.style.opacity = "1";
                itemElement.style.transform = "translateY(0)";
              }
            }
          });
        }
      };

      // Use IntersectionObserver for improved lazy loading images
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
                  img.onload = resizeAllGridItems;
                  delete img.dataset.src;
                }
              };
              preloadImg.src = img.dataset.src as string;
            }
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '200px', // Start loading before visible
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
      
      // Add a small delay for initial layout calculation to ensure images are measured correctly
      setTimeout(resizeAllGridItems, 100);

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
        }
        .masonry-item {
          margin-bottom: 0;
          overflow: hidden;
          border-radius: 8px;
        }
        .masonry-content {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .masonry-content:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
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

        /* New animation classes */
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
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
        `}
      </style>
    </div>
  );
};

export default PhotoGrid;
