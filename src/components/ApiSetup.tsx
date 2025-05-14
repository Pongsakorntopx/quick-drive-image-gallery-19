
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const ApiSetup: React.FC = () => {
  const { apiConfig, setApiConfig, refreshPhotos } = useAppContext();
  const [apiKey, setApiKey] = useState(apiConfig.apiKey || "");
  const [folderId, setFolderId] = useState(apiConfig.folderId || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      setApiConfig({ apiKey, folderId });
      await refreshPhotos();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">เริ่มต้นการใช้งาน</CardTitle>
          <CardDescription>
            เชื่อมต่อกับ Google Drive เพื่อแสดงรูปภาพบนแกลเลอรี่
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Google Drive API Key
              </label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="เช่น AIzaSyBnGk9euYZMBM1234"
                required
              />
              <p className="text-xs text-muted-foreground">
                สร้าง API Key ได้จาก Google Cloud Console
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="folderId" className="text-sm font-medium">
                Folder ID ใน Google Drive
              </label>
              <Input
                id="folderId"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="เช่น 1a2b3c4d5e6f7g8h9i0j"
                required
              />
              <p className="text-xs text-muted-foreground">
                ID ของโฟลเดอร์ที่มีรูปภาพที่ต้องการแสดง
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ApiSetup;
