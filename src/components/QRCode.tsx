
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ url, size = 128, className = "" }) => {
  return (
    <div className={`bg-white p-2 rounded-md ${className}`}>
      <QRCodeCanvas
        value={url}
        size={size}
        level="H"
        includeMargin={false}
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
    </div>
  );
};

export default QRCode;
