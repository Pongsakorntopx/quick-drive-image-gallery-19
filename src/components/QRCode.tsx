
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  padding?: number;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  url, 
  size = 128, 
  className = "",
  padding = 2,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  level = "H",
  includeMargin = false,
  imageSettings
}) => {
  return (
    <div className={`bg-white ${className}`} style={{ padding: `${padding}px` }}>
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
