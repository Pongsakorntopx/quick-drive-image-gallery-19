
import React from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../../context/AppContext";
import { useTranslation } from "../../hooks/useTranslation";

interface ViewerControlsProps {
  onClose: () => void;
  onToggleViewMode?: () => void;
  showViewModeToggle?: boolean;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({ 
  onClose, 
  onToggleViewMode, 
  showViewModeToggle = false 
}) => {
  return (
    <div className="absolute top-2 right-2 z-50 flex gap-2">
      {showViewModeToggle && onToggleViewMode && (
        <Button
          variant="outline"
          size="icon"
          className="bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
          onClick={onToggleViewMode}
        >
          <Image className="h-5 w-5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

// Lucide icon component
const Image = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
};

export default ViewerControls;
