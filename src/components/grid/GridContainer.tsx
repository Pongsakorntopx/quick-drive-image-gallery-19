
import React, { useMemo, forwardRef } from "react";
import { Photo } from "@/types";

interface GridContainerProps {
  children: React.ReactNode;
  gridLayout: string;
  gridColumns: number;
  className?: string;
  photos: Photo[];
}

const GridContainer = forwardRef<HTMLDivElement, GridContainerProps>(({ 
  children, 
  gridLayout, 
  gridColumns,
  className = "",
  photos
}, ref) => {
  // Get grid layout class based on settings
  const getGridLayoutClass = () => {
    if (gridLayout === "googlePhotos") {
      return "masonry-grid"; // Google Photos style layout (original masonry)
    } else if (gridLayout === "auto") {
      return "masonry-grid"; // Auto masonry (same as Google Photos)
    } else if (gridLayout === "fixed" || gridLayout === "custom") {
      const columns = gridColumns || 4;
      return `grid grid-cols-1 ${columns === 1 ? '' : 'sm:grid-cols-2'} ${columns <= 2 ? '' : 'md:grid-cols-3'} ${columns <= 3 ? '' : `lg:grid-cols-${Math.min(columns, 12)}`} gap-4`;
    }
    return "masonry-grid";
  };
  
  // Get the grid style object
  const getGridStyle = () => {
    if (gridLayout === "googlePhotos" || gridLayout === "auto") {
      return { 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gridAutoRows: "10px",
        gridGap: "16px",
        willChange: "transform", // Performance optimization
        contain: "layout style paint" // More performance optimizations
      };
    }
    return {};
  };

  // Prefetch images for better performance - increased number of images to preload
  const prefetchImages = useMemo(() => {
    // Increased to prefetch more images for smoother scrolling
    const imagesToPrefetch = photos.slice(0, 20);
    
    return (
      <div style={{ display: 'none' }}>
        {imagesToPrefetch.map((photo) => (
          <link 
            key={photo.id}
            rel="prefetch"
            href={photo.thumbnailLink || `https://drive.google.com/thumbnail?id=${photo.id}`}
            as="image"
            crossOrigin="anonymous"
            fetchpriority="high"
          />
        ))}
      </div>
    );
  }, [photos.slice(0, 20).map(p => p.id).join(',')]);

  return (
    <>
      {prefetchImages}
      <div 
        className={`${getGridLayoutClass()} ${className}`}
        style={getGridStyle()}
        ref={ref}
      >
        {children}
      </div>
    </>
  );
});

GridContainer.displayName = "GridContainer";

export default GridContainer;
