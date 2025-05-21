
import React, { memo } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
}

const QRCode: React.FC<QRCodeProps> = ({ 
  url, 
  size = 128, 
  className = "",
  imageSettings,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  level = "M"
}) => {
  // Ensure size is at least 64px and at most 512px for better visibility and usability
  const safeSize = Math.min(Math.max(size, 64), 512);
  
  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={safeSize}
        level={level} // Error correction level
        includeMargin={false}
        bgColor={bgColor}
        fgColor={fgColor}
        imageSettings={imageSettings || {
          src: "",
          height: 24,
          width: 24,
          excavate: true
        }}
      />
    </div>
  );
};

// Memoize for better performance
export default memo(QRCode);
