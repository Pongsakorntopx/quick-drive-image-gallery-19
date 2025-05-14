
import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import ImageCard from "./ImageCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const PhotoGrid: React.FC = () => {
  const { photos, isLoading, error, refreshPhotos, setSelectedPhoto } = useAppContext();
  const gridRef = useRef<HTMLDivElement>(null);

  // Create the masonry layout
  useEffect(() => {
    if (photos.length > 0 && gridRef.current) {
      const resizeAllGridItems = () => {
        const allItems = gridRef.current?.querySelectorAll(".masonry-item");
        if (allItems) {
          allItems.forEach((item) => {
            const itemElement = item as HTMLElement;
            const rowHeight = 10;
            const rowGap = 16; // make sure this matches the grid-gap in CSS
            const rowSpan = Math.ceil(
              (itemElement.querySelector(".masonry-content")?.getBoundingClientRect().height + rowGap) /
                (rowHeight + rowGap)
            );
            itemElement.style.gridRowEnd = `span ${rowSpan}`;
          });
        }
      };

      // Initial resize
      resizeAllGridItems();

      // Resize on window resize
      window.addEventListener("resize", resizeAllGridItems);

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
        window.removeEventListener("resize", resizeAllGridItems);
        allImages.forEach((img) => {
          img.removeEventListener("load", resizeAllGridItems);
        });
      };
    }
  }, [photos]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <div className="text-lg mb-4 text-destructive">{error}</div>
        <Button onClick={() => refreshPhotos()}>
          <ReloadIcon className="mr-2 h-4 w-4" />
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:p-8">
      {isLoading && photos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              <Skeleton className="aspect-square" />
            </div>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
          <div className="text-lg mb-4">ไม่พบรูปภาพ</div>
          <div className="text-muted-foreground text-center max-w-md">
            ตรวจสอบว่าคุณได้ป้อน API Key และ Folder ID อย่างถูกต้อง และโฟลเดอร์ของคุณมีรูปภาพ
          </div>
        </div>
      ) : (
        <div ref={gridRef} className="masonry-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="masonry-item">
              <div className="masonry-content">
                <ImageCard photo={photo} onClick={() => setSelectedPhoto(photo)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
