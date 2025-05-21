
import React, { useEffect, useState } from "react";
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
  // Track if the component is mounted to prevent state updates after unmounting
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={size}
        level="H"
        includeMargin={false}
        bgColor={bgColor}
        fgColor={fgColor}
        style={{ 
          maxWidth: "100%", 
          height: "auto",
          transition: "all 0.3s ease" 
        }}
      />
    </div>
  );
};

export default QRCode;
