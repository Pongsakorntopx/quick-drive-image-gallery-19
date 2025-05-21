
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "../QRCode";
import { useAppContext } from "../../context/AppContext";

interface QRCodeSectionProps {
  url: string;
  onDownload: () => void;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ url, onDownload }) => {
  const { settings } = useAppContext();
  
  return (
    <div className="md:w-1/3 p-3 flex flex-col items-center justify-center">
      <div className="mb-3 text-sm font-medium text-center">
        {settings.language === "th" ? "สแกนเพื่อดาวน์โหลด" : "Scan to download"}
      </div>
      <div className="bg-white/95 dark:bg-black/50 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
        <QRCode
          url={url}
          size={settings.viewerQRCodeSize * 1.3}
          className="mx-auto"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-5 px-6 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30"
        onClick={onDownload}
      >
        <Download className="mr-2 h-4 w-4" />
        {settings.language === "th" ? "ดาวน์โหลด" : "Download"}
      </Button>
    </div>
  );
};

export default QRCodeSection;
