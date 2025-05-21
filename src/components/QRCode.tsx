
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  url, 
  size = 128, 
  className = "",
  bgColor = "#FFFFFF",
  fgColor = "#000000" 
}) => {
  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={size}
        level="H"
        includeMargin={false}
        bgColor={bgColor}
        fgColor={fgColor}
      />
    </div>
  );
};

export default QRCode;
