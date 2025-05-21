
import React, { memo } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ url, size = 128, className = "" }) => {
  // Ensure size is at least 64px and at most 512px for better visibility and usability
  const safeSize = Math.min(Math.max(size, 64), 512);
  
  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={safeSize}
        level="M" // Medium error correction level for better speed/reliability balance
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
