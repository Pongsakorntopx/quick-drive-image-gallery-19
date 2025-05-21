
import React from "react";
import NavigationButtons from "./NavigationButtons";
import QRCodeSection from "./QRCodeSection";
import { Photo } from "../../types";

interface StandardViewProps {
  photo: Photo;
  photoUrl: string;
  onPrevious: () => void;
  onNext: () => void;
  onDownload: () => void;
}

const StandardView: React.FC<StandardViewProps> = ({ 
  photo, 
  photoUrl, 
  onPrevious, 
  onNext, 
  onDownload 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Main content container with animation */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 rounded-xl bg-black/10 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-lg w-full h-full animate-scale-in">
        {/* Image container */}
        <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
          <img
            src={photoUrl}
            alt={photo.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md viewer-image animate-fade-in"
          />
        </div>
        
        {/* QR code container */}
        <QRCodeSection 
          url={photoUrl}
          onDownload={onDownload}
        />
      </div>
      
      {/* Navigation buttons */}
      <NavigationButtons onPrevious={onPrevious} onNext={onNext} />
    </div>
  );
};

export default StandardView;
