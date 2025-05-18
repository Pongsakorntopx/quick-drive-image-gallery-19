
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

  // Batch size for virtualization - increased for better initial load
  const batchSize = 24; 
  
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
          setVirtualizedPhotos(prev => [...newBatch, ...prev]); // New photos at the beginning
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

      // Use IntersectionObserver for lazy loading images
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');
            if (img && img.dataset.src) {
              img.src = img.dataset.src;
              img.onload = resizeAllGridItems;
              delete img.dataset.src;
            }
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '200px', // Start loading before visible
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
          minHeight: "150px"
        };
        return { className: "", style: gridRowStyles };
      }
      return { className: "", style: {} };
    }
    return { 
      className: "masonry-item", 
      style: { 
        opacity: 0, 
        transform: "translateY(20px)", 
        transition: "opacity 0.3s ease, transform 0.3s ease" 
      } 
    };
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
    <div className="px-2 py-4 md:px-4 md:py-6 responsive-container">
      {isLoading && photos.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-sm group hover:shadow-md transition-shadow duration-200">
              <Skeleton className="aspect-[3/2] w-full" />
              <div className="p-2">
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
          <div className="rounded-full h-8 w-8 border-4 border-t-transparent border-primary animate-spin"></div>
        </div>
      ) : (
        <>
          <div 
            ref={gridRef} 
            className={getGridLayoutClass()}
            style={settings.gridLayout === "googlePhotos" ? { 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gridAutoRows: "10px",
              gridGap: "8px"
            } : {}}
          >
            {virtualizedPhotos.map((vPhoto, idx) => {
              const photo = photoMap.get(vPhoto.id);
              const gridItemProps = getGridItemClass();
              
              return photo ? (
                <div 
                  key={vPhoto.id} 
                  className={gridItemProps.className}
                  style={gridItemProps.style}
                  data-index={idx}
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

          {/* Show when all photos are loaded */}
          {virtualizedPhotos.length === photos.length && photos.length > 0 && (
            <div className="w-full flex items-center justify-center mt-6 mb-2 text-muted-foreground text-sm">
              <p>{settings.language === "th" ? `แสดงรูปภาพทั้งหมด (${photos.length} รูป)` : `Showing all photos (${photos.length})`}</p>
            </div>
          )}
        </>
      )}
      
      {/* Adding CSS styles correctly */}
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
        `}
      </style>
    </div>
  );
};

export default PhotoGrid;
