
import { useEffect } from "react";
import { Photo } from "../../types";

interface KeyboardNavigationProps {
  selectedPhoto: Photo | null;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export const useKeyboardNavigation = ({
  selectedPhoto,
  onPrevious,
  onNext,
  onClose
}: KeyboardNavigationProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      switch (e.key) {
        case 'ArrowRight':
          onNext();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, onPrevious, onNext, onClose]);
};
