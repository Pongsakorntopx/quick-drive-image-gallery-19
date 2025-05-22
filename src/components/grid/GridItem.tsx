
import React, { useEffect, useRef } from "react";
import { Photo } from "@/types";
import ImageCard from "../ImageCard";

interface GridItemProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  gridLayout: string;
  gridRows: number;
  index: number;
  isNewPhoto?: boolean; // เพิ่มคุณสมบัติสำหรับภาพใหม่
}

const GridItem: React.FC<GridItemProps> = ({ 
  photo, 
  onClick, 
  gridLayout,
  gridRows,
  index,
  isNewPhoto = false // ค่าเริ่มต้นคือ false
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // เมื่อสร้าง component ครั้งแรกและเป็นภาพใหม่
  useEffect(() => {
    if (isNewPhoto && itemRef.current) {
      // เพิ่มคลาสสำหรับเอฟเฟกต์การเลื่อนเข้า
      itemRef.current.classList.add('new-photo-push');
      
      // หลังจากแอนิเมชันเสร็จสิ้น ลบคลาสออก
      const timer = setTimeout(() => {
        if (itemRef.current) {
          itemRef.current.classList.remove('new-photo-push');
          itemRef.current.classList.add('photo-settled');
        }
      }, 800); // ตามระยะเวลาของแอนิเมชัน
      
      return () => clearTimeout(timer);
    }
  }, [isNewPhoto]);
  
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
  
  // กำหนดคลาสสำหรับภาพใหม่
  const newPhotoClass = isNewPhoto ? 'fresh-image' : '';
  
  return (
    <div 
      ref={itemRef}
      className={`${gridItemProps.className} animate-fade-in ${newPhotoClass} ${isNewPhoto ? 'new-photo' : ''}`}
      style={{
        ...gridItemProps.style,
        animationDelay: `${Math.min(index * 0.05, 1)}s`
      }}
      data-index={index}
      data-new={isNewPhoto ? "true" : "false"}
    >
      <div 
        className={`${getContentClass()} ${isNewPhoto ? 'new-photo-content' : ''}`}
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
