
import React, { useMemo, forwardRef, useEffect } from "react";
import { Photo } from "@/types";

interface GridContainerProps {
  children: React.ReactNode;
  gridLayout: string;
  gridColumns: number;
  className?: string;
  photos: Photo[];
  newPhotoIds?: Set<string>; // Add prop to track new photo IDs
}

const GridContainer = forwardRef<HTMLDivElement, GridContainerProps>(({ 
  children, 
  gridLayout, 
  gridColumns,
  className = "",
  photos,
  newPhotoIds = new Set()
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

  // Enhanced prefetch mechanism: prefetch ALL images immediately
  // This ensures we have image data available for instant display
  const prefetchImages = useMemo(() => {
    // Try to prefetch all visible images and prioritize new ones
    return (
      <div style={{ display: 'none' }}>
        {photos.map((photo) => (
          <link 
            key={photo.id}
            rel="prefetch"
            href={photo.thumbnailLink || `https://drive.google.com/thumbnail?id=${photo.id}`}
            as="image"
            crossOrigin="anonymous"
            fetchPriority={newPhotoIds.has(photo.id) ? "high" : "auto"}
          />
        ))}
      </div>
    );
  }, [photos, newPhotoIds]);
  
  // Force re-rendering when new photos are detected
  useEffect(() => {
    if (newPhotoIds && newPhotoIds.size > 0) {
      console.log(`Detected ${newPhotoIds.size} new photos, updating the grid`);
    }
  }, [newPhotoIds]);

  return (
    <>
      {prefetchImages}
      <div 
        className={`${getGridLayoutClass()} ${className}`}
        style={getGridStyle()}
        ref={ref}
        data-has-new-photos={newPhotoIds && newPhotoIds.size > 0 ? "true" : "false"}
      >
        {children}
      </div>
    </>
  );
});

GridContainer.displayName = "GridContainer";

export default GridContainer;
