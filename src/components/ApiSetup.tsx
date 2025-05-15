
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ApiSetup: React.FC = () => {
  const { apiConfig, setApiConfig, refreshPhotos } = useAppContext();
  const [apiKey, setApiKey] = useState(apiConfig.apiKey || "");
  const [folderId, setFolderId] = useState(apiConfig.folderId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateFolderId = (id: string) => {
    // Basic validation for Google Drive Folder ID format
    return id.trim().length > 10;
  };

  const validateApiKey = (key: string) => {
    // Basic validation for Google API key format
    return key.trim().length > 20;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    if (!validateApiKey(apiKey)) {
      setError("API Key ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "API Key ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
        variant: "destructive"
      });
      return;
    }

    if (!validateFolderId(folderId)) {
      setError("Folder ID ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "Folder ID ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Update the API configuration
      const newConfig = { apiKey: apiKey.trim(), folderId: folderId.trim() };
      setApiConfig(newConfig);
      
      // Force refresh photos with the new configuration
      const result = await refreshPhotos();
      
      if (result === false) {
        throw new Error("ไม่สามารถเชื่อมต่อกับ Google Drive ได้");
      }
      
      toast({
        title: "เชื่อมต่อสำเร็จ",
        description: "เชื่อมต่อกับ Google Drive สำเร็จแล้ว",
      });
    } catch (err) {
      console.error("Connection error:", err);
      setError("ไม่สามารถเชื่อมต่อกับ Google Drive ได้ กรุณาตรวจสอบ API Key และ Folder ID");
      toast({
        title: "เชื่อมต่อไม่สำเร็จ",
        description: "ไม่สามารถเชื่อมต่อกับ Google Drive ได้ กรุณาตรวจสอบ API Key และ Folder ID",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setError("");
  };

  const handleFolderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderId(e.target.value);
    setError("");
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
                onChange={handleApiKeyChange}
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
                onChange={handleFolderIdChange}
                placeholder="เช่น 1a2b3c4d5e6f7g8h9i0j"
                required
              />
              <p className="text-xs text-muted-foreground">
                ID ของโฟลเดอร์ที่มีรูปภาพที่ต้องการแสดง (หาได้จาก URL ของโฟลเดอร์ใน Google Drive)
              </p>
            </div>
            
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}
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
