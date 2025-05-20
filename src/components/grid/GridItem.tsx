
import React from "react";
import { Photo } from "@/types";
import ImageCard from "../ImageCard";

interface GridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  gridLayout: string;
  gridRows: number;
  index: number;
}

const GridItem: React.FC<GridItemProps> = ({ 
  photo, 
  onClick, 
  gridLayout,
  gridRows,
  index
}) => {
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
        transition: "opacity 0.3s ease, transform 0.3s ease" 
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
      const animationDelay = `${index * 0.05}s`;
      return { 
        height: '100%',
        objectFit: 'cover' as const,
        animationDelay
      };
    }
    return {
      animationDelay: `${index * 0.05}s`
    };
  };

  const gridItemProps = getGridItemClass();
  
  return (
    <div 
      className={`${gridItemProps.className} animate-fade-in`}
      style={{
        ...gridItemProps.style,
        animationDelay: `${index * 0.05}s`
      }}
      data-index={index}
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
