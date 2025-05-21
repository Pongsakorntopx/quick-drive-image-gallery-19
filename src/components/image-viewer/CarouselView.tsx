
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Photo } from "../../types";
import { EmblaCarouselType } from "embla-carousel";

interface CarouselViewProps {
  photos: Photo[];
  emblaRef: React.RefObject<HTMLDivElement>;
  onSelect: (api: EmblaCarouselType) => void;
}

const CarouselView: React.FC<CarouselViewProps> = ({ 
  photos, 
  emblaRef, 
  onSelect 
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <Carousel 
        className="w-full h-full" 
        ref={emblaRef}
        onSelect={onSelect}
      >
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.id} className="flex items-center justify-center">
              <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <img 
                  src={photo.fullSizeUrl || photo.url}
                  alt={photo.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md animate-fade-in"
                />
                
                <div className="mt-4 text-sm">{photo.name}</div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const downloadUrl = photo.directDownloadUrl || photo.webContentLink;
                    window.open(downloadUrl, "_blank");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {photo.name}
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default CarouselView;
