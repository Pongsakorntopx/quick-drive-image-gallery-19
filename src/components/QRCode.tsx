
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  imageSettings?: {
    src: string; // Required to match the QRCodeCanvas component's expectations
    height: number; // Required to match the QRCodeCanvas component's expectations
    width: number; // Changed from optional to required to match the QRCodeCanvas component's expectations
    excavate?: boolean;
  };
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  url, 
  size = 128, 
  className = "",
  bgColor = "#FFFFFF",
  fgColor = "#000000", 
  level = "H",
  includeMargin = false,
  imageSettings
}) => {
  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor={bgColor}
        fgColor={fgColor}
        imageSettings={imageSettings}
      />
    </div>
  );
};

export default QRCode;
