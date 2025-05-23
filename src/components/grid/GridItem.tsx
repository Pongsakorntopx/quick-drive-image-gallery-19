
import React, { useState, useEffect } from "react";
import { Photo } from "@/types";
import ImageCard from "../ImageCard";

interface GridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  gridLayout: string;
  gridRows: number;
  index: number;
  isNewPhoto?: boolean;  // Add flag to indicate new photos
}

const GridItem: React.FC<GridItemProps> = ({ 
  photo, 
  onClick, 
  gridLayout,
  gridRows,
  index,
  isNewPhoto = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Track when this component is freshly rendered
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Get grid item class based on settings
  const getGridItemClass = () => {
    if (gridLayout === "fixed" || gridLayout === "custom") {
      if (gridRows && gridRows > 0) {
        const gridRowStyles = {
          height: gridRows === 1 ? "calc(100vh - 120px)" : `calc((100vh - 120px) / ${gridRows})`,
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
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        // Add staggered animation delay based on index
        animationDelay: `${Math.min(index * 0.05, 1)}s`,
        transitionDelay: `${Math.min(index * 0.05, 1)}s`
      } 
    };
  };

  // Get content class based on settings
  const getContentClass = () => {
    if (gridLayout === "fixed" || gridLayout === "custom") {
      return "h-full";
    }
    return "masonry-content";
  };

  // Calculate aspect ratio for fixed grid
  const getImageContainerStyle = () => {
    if ((gridLayout === "fixed" || gridLayout === "custom") && 
        gridRows && gridRows > 0) {
      // Use index for staggered animation
      const animationDelay = `${Math.min(index * 0.05, 1)}s`;
      return { 
        height: '100%',
        objectFit: 'cover' as const,
        animationDelay
      };
    }
    return {
      animationDelay: `${Math.min(index * 0.05, 1)}s`
    };
  };

  const gridItemProps = getGridItemClass();
  
  // Determine additional classes based on whether this is a new photo
  const newPhotoClass = isNewPhoto ? "new-photo-highlight" : "";
  const animationClass = isNewPhoto 
    ? "animate-pulse-highlight" 
    : (isLoaded ? "animate-fade-in" : "");
  
  return (
    <div 
      className={`${gridItemProps.className} ${animationClass} ${newPhotoClass}`}
      style={{
        ...gridItemProps.style,
        animationDelay: `${Math.min(index * 0.05, 1)}s`
      }}
      data-index={index}
      data-is-new={isNewPhoto ? "true" : "false"}
    >
      <div 
        className={getContentClass()}
        style={getImageContainerStyle()}
      >
        <ImageCard 
          photo={photo} 
          onClick={() => onClick(photo)} 
        />
      </div>
      
      {/* Add special indicator for new photos */}
      {isNewPhoto && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-ping" />
      )}
    </div>
  );
};

export default GridItem;
