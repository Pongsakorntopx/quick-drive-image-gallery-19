
import React, { memo } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ url, size = 128, className = "" }) => {
  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={size}
        level="M" // Change from H to M for faster rendering
        includeMargin={false}
        bgColor="#FFFFFF"
        fgColor="#000000"
        imageSettings={{
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
