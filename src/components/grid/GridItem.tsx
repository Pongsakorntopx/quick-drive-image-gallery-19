
import React, { useState, useEffect } from "react";
import { Photo } from "@/types";
import ImageCard from "../ImageCard";

interface GridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  gridLayout: string;
  gridRows: number;
  index: number;
  isNew?: boolean; // เพิ่ม prop สำหรับรูปใหม่
}

const GridItem: React.FC<GridItemProps> = ({ 
  photo, 
  onClick, 
  gridLayout,
  gridRows,
  index,
  isNew = false
}) => {
  // State to control the highlight animation
  const [showHighlight, setShowHighlight] = useState(isNew);
  
  // Effect to handle highlight animation timing
  useEffect(() => {
    if (isNew) {
      setShowHighlight(true);
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 3000); // Remove the highlight after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isNew, photo.id]);
  
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
    const baseClass = gridLayout === "fixed" || gridLayout === "custom" ? "h-full" : "masonry-content";
    
    // Add highlight class for new photos
    return showHighlight ? `${baseClass} new-photo-highlight` : baseClass;
  };

  // Calculate aspect ratio for fixed grid
  const getImageContainerStyle = () => {
    const baseStyle: React.CSSProperties = {
      animationDelay: `${Math.min(index * 0.05, 1)}s`
    };
    
    if ((gridLayout === "fixed" || gridLayout === "custom") && 
        gridRows && gridRows > 0) {
      return { 
        ...baseStyle,
        height: '100%',
        objectFit: 'cover' as const,
      };
    }
    
    return baseStyle;
  };

  const gridItemProps = getGridItemClass();
  
  // Generate a unique key for images to prevent stale cache issues
  const uniqueKey = `${photo.id}_${Date.now()}`;
  
  return (
    <div 
      className={`${gridItemProps.className} animate-fade-in ${isNew ? 'fresh-image' : ''}`}
      style={{
        ...gridItemProps.style,
        animationDelay: `${Math.min(index * 0.05, 1)}s`
      }}
      data-index={index}
      data-photo-id={photo.id}
    >
      <div 
        className={getContentClass()}
        style={getImageContainerStyle()}
      >
        <ImageCard 
          photo={{
            ...photo,
            // เพิ่ม timestamp ในลิงก์ภาพเพื่อป้องกันแคช
            thumbnailLink: photo.thumbnailLink ? `${photo.thumbnailLink.split('&t=')[0]}&t=${Date.now()}_${photo.id}` : photo.thumbnailLink,
            url: photo.url ? `${photo.url.split('&t=')[0]}&t=${Date.now()}_${photo.id}` : photo.url,
          }} 
          onClick={() => onClick(photo)} 
          key={uniqueKey}
        />
      </div>
    </div>
  );
};

export default GridItem;
