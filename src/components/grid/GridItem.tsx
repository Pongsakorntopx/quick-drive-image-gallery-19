
import React, { useState, useEffect } from "react";
import { Photo } from "@/types";
import ImageCard from "../ImageCard";

interface GridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  gridLayout: string;
  gridRows: number;
  index: number;
  isNewPhoto?: boolean; // Add prop to identify new photos
}

const GridItem: React.FC<GridItemProps> = ({ 
  photo, 
  onClick, 
  gridLayout,
  gridRows,
  index,
  isNewPhoto = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    // Staggered animation based on index
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, Math.min(index * 50, 500)); // Cap the delay at 500ms
    
    return () => clearTimeout(timeout);
  }, [index]);
  
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
        opacity: isVisible ? 1 : 0, 
        transform: isVisible ? "translateY(0)" : "translateY(20px)", 
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
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
    const baseStyle = {
      height: '100%',
      objectFit: 'cover' as const,
      animationDelay: `${Math.min(index * 0.05, 1)}s`
    };
    
    // Add special styles for new photos
    if (isNewPhoto) {
      return {
        ...baseStyle,
        animation: 'pulseIn 0.8s ease-out',
      };
    }
    
    return baseStyle;
  };

  const gridItemProps = getGridItemClass();
  
  return (
    <div 
      className={`${gridItemProps.className} ${isNewPhoto ? 'fresh-image' : 'animate-fade-in'}`}
      style={{
        ...gridItemProps.style,
        animationDelay: `${Math.min(index * 0.05, 1)}s`
      }}
      data-index={index}
      data-new={isNewPhoto ? "true" : "false"}
    >
      <div 
        className={`${getContentClass()} ${isNewPhoto ? 'shadow-lg ring-2 ring-primary ring-offset-2' : ''}`}
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
