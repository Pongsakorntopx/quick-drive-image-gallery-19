
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import ImageCard from "./ImageCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

// Define a type for the virtualized photo
interface VirtualizedPhoto {
  id: string;
  index: number;
}

const PhotoGrid: React.FC = () => {
  const { photos, isLoading, error, refreshPhotos, setSelectedPhoto, settings } = useAppContext();
  const gridRef = useRef<HTMLDivElement>(null);
  const [virtualizedPhotos, setVirtualizedPhotos] = useState<VirtualizedPhoto[]>([]);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Previous photos ref to prevent unnecessary updates
  const prevPhotosLength = useRef<number>(0);

  // Batch size for virtualization
  const batchSize = 12; 
  
  // Calculate optimized layout for masonry grid
  useEffect(() => {
    if (photos.length > 0 && prevPhotosLength.current !== photos.length) {
      // Only update when the photos array actually changes
      if (virtualizedPhotos.length === 0) {
        // Initial batch of photos
        const initialBatch = photos.slice(0, batchSize).map((photo, index) => ({
          id: photo.id,
          index,
        }));
        setVirtualizedPhotos(initialBatch);
      } else {
        // Keep existing photos and add any new ones if needed
        const existingIds = new Set(virtualizedPhotos.map(vp => vp.id));
        const newBatch = photos
          .slice(0, Math.max(virtualizedPhotos.length, batchSize))
          .map((photo, index) => ({
            id: photo.id,
            index,
          }))
          .filter(vp => !existingIds.has(vp.id));
          
        if (newBatch.length > 0) {
          setVirtualizedPhotos(prev => [...prev, ...newBatch]);
        }
      }
      
      prevPhotosLength.current = photos.length;
    }
  }, [photos]);

  // Handle lazy loading of more photos when scrolling
  useEffect(() => {
    if (inView && photos.length > virtualizedPhotos.length) {
      const nextBatch = photos
        .slice(virtualizedPhotos.length, virtualizedPhotos.length + batchSize)
        .map((photo, index) => ({
          id: photo.id,
          index: virtualizedPhotos.length + index,
        }));
      
      setVirtualizedPhotos(prev => [...prev, ...nextBatch]);
    }
  }, [inView, photos, virtualizedPhotos]);

  // Memoize the photo lookup for better performance
  const photoMap = useMemo(() => {
    const map = new Map();
    photos.forEach(photo => {
      map.set(photo.id, photo);
    });
    return map;
  }, [photos]);

  // Create the masonry layout
  useEffect(() => {
    // Don't use masonry layout if using fixed grid or custom grid
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
            const rowGap = 16; // make sure this matches the grid-gap in CSS
            const contentElement = itemElement.querySelector(".masonry-content");
            
            if (contentElement) {
              const rowSpan = Math.ceil(
                (contentElement.getBoundingClientRect().height + rowGap) /
                  (rowHeight + rowGap)
              );
              itemElement.style.gridRowEnd = `span ${rowSpan}`;
            }
          });
        }
      };

      // Debounce the resize function for performance
      let resizeTimeout: number | undefined;
      const debouncedResize = () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeTimeout = window.setTimeout(resizeAllGridItems, 100);
      };

      // Initial resize
      resizeAllGridItems();

      // Resize on window resize
      window.addEventListener("resize", debouncedResize);

      // Resize when images are loaded
      const allImages = gridRef.current.querySelectorAll("img");
      allImages.forEach((img) => {
        if (img.complete) {
          resizeAllGridItems();
        } else {
          img.addEventListener("load", resizeAllGridItems);
        }
      });

      return () => {
        window.removeEventListener("resize", debouncedResize);
        allImages.forEach((img) => {
          img.removeEventListener("load", resizeAllGridItems);
        });
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
      };
    }
  }, [virtualizedPhotos, settings.gridLayout]);

  // Get grid layout class based on settings
  const getGridLayoutClass = () => {
    if (settings.gridLayout === "googlePhotos") {
      return "masonry-grid"; // Google Photos style layout (original masonry)
    } else if (settings.gridLayout === "auto") {
      return "masonry-grid"; // Auto masonry (same as Google Photos)
    } else if (settings.gridLayout === "fixed" || settings.gridLayout === "custom") {
      const columns = settings.gridColumns || 4;
      return `grid grid-cols-1 ${columns === 1 ? '' : 'sm:grid-cols-2'} ${columns <= 2 ? '' : 'md:grid-cols-3'} ${columns <= 3 ? '' : `lg:grid-cols-${Math.min(columns, 12)}`} gap-4`;
    }
    return "masonry-grid";
  };

  // Get grid item class based on settings
  const getGridItemClass = () => {
    if (settings.gridLayout === "fixed" || settings.gridLayout === "custom") {
      if (settings.gridRows && settings.gridRows > 0) {
        const gridRowStyles = {
          height: settings.gridRows === 1 ? "calc(100vh - 120px)" : `calc((100vh - 120px) / ${settings.gridRows})`,
          minHeight: "100px"
        };
        return { className: "", style: gridRowStyles };
      }
      return { className: "", style: {} };
    }
    return { className: "masonry-item", style: {} };
  };

  // Get content class based on settings
  const getContentClass = () => {
    if (settings.gridLayout === "fixed" || settings.gridLayout === "custom") {
      return "h-full";
    }
    return "masonry-content";
  };

  // Calculate aspect ratio for fixed grid
  const getImageContainerStyle = () => {
    if ((settings.gridLayout === "fixed" || settings.gridLayout === "custom") && 
        settings.gridRows && settings.gridRows > 0) {
      // Calculate aspect ratio based on columns and rows
      const ratio = settings.gridColumns / settings.gridRows;
      return { 
        aspectRatio: ratio.toString(),
        height: '100%',
        objectFit: 'cover' as const
      };
    }
    return {};
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[400px]">
        <div className="text-lg mb-4 text-destructive">{error}</div>
        <Button onClick={() => refreshPhotos()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="px-2 py-4 md:px-4 md:py-8 responsive-container">
      {isLoading && photos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              <Skeleton className="aspect-square" />
            </div>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
          <div className="rounded-full h-8 w-8 border-4 border-t-transparent border-primary animate-spin"></div>
        </div>
      ) : (
        <>
          <div ref={gridRef} className={getGridLayoutClass()}>
            {virtualizedPhotos.map((vPhoto) => {
              const photo = photoMap.get(vPhoto.id);
              const gridItemProps = getGridItemClass();
              
              return photo ? (
                <div 
                  key={vPhoto.id} 
                  className={gridItemProps.className}
                  style={gridItemProps.style}
                >
                  <div 
                    className={getContentClass()}
                    style={getImageContainerStyle()}
                  >
                    <ImageCard 
                      photo={photo} 
                      onClick={() => setSelectedPhoto(photo)} 
                    />
                  </div>
                </div>
              ) : null;
            })}
          </div>
          
          {/* Load more trigger element */}
          {virtualizedPhotos.length < photos.length && (
            <div 
              ref={loadMoreRef} 
              className="w-full h-20 flex items-center justify-center mt-4"
            >
              <div className="rounded-full h-8 w-8 border-4 border-t-transparent border-primary animate-spin"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoGrid;
