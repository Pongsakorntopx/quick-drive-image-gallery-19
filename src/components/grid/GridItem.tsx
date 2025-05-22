
import React, { useState, useEffect } from "react";
import { Photo } from "@/types";
import ImageCard from "../ImageCard";

interface GridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  gridLayout: string;
  gridRows: number;
  index: number;
  isNewPhoto?: boolean;
}

const GridItem: React.FC<GridItemProps> = ({ 
  photo, 
  onClick, 
  gridLayout,
  gridRows,
  index,
  isNewPhoto = false
}) => {
  const [animated, setAnimated] = useState(false);
  
  // Effect to handle new photo animation
  useEffect(() => {
    if (isNewPhoto && !animated) {
      setAnimated(true);
    }
  }, [isNewPhoto]);
  
  // Get grid item class based on settings
  const getGridItemClass = () => {
    let baseClass = "";
    if (gridLayout === "fixed" || gridLayout === "custom") {
      if (gridRows && gridRows > 0) {
        const gridRowStyles = {
          height: gridRows === 1 ? "calc(100vh - 120px)" : `calc((100vh - 120px) / ${gridRows})`,
          minHeight: "150px"
        };
        return { className: baseClass, style: gridRowStyles };
      }
      return { className: baseClass, style: {} };
    }
    
    // Add masonry class for masonry layouts
    baseClass = "masonry-item";
    
    return { 
      className: baseClass, 
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
  
  // Add special class for new photos
  const newPhotoClass = isNewPhoto ? "fresh-image" : "";
  
  return (
    <div 
      className={`${gridItemProps.className} animate-fade-in ${newPhotoClass}`}
      style={{
        ...gridItemProps.style,
        animationDelay: `${Math.min(index * 0.05, 1)}s`
      }}
      data-index={index}
      data-new={isNewPhoto ? "true" : "false"}
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
    </div>
  );
};

export default GridItem;
