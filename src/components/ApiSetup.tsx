
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ApiSetup: React.FC = () => {
  const { apiConfig, setApiConfig, refreshPhotos, setIsSettingsOpen } = useAppContext();
  const [apiKey, setApiKey] = useState(apiConfig.apiKey || "");
  const [folderId, setFolderId] = useState(apiConfig.folderId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateFolderId = (id: string) => {
    // Basic validation for Google Drive Folder ID format
    // Google Drive IDs are typically 33 characters with letters, numbers, hyphens, and underscores
    const folderIdPattern = /^[a-zA-Z0-9_-]{25,33}$/;
    return folderIdPattern.test(id.trim());
  };

  const validateApiKey = (key: string) => {
    // Basic validation for Google API key format
    // Google API keys typically start with "AIza" and are about 39 characters
    return key.trim().startsWith("AIza") && key.trim().length >= 39;
  };

  const extractFolderIdFromUrl = (url: string): string | null => {
    // Try to extract folder ID from various Google Drive URL formats
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]{25,33})/,  // /folders/FOLDERID format
      /id=([a-zA-Z0-9_-]{25,33})/,          // id=FOLDERID format
      /^([a-zA-Z0-9_-]{25,33})$/            // Just the ID itself
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Check if the folder ID might be a URL and try to extract the ID
    let processedFolderId = folderId.trim();
    if (processedFolderId.includes('drive.google.com')) {
      const extractedId = extractFolderIdFromUrl(processedFolderId);
      if (extractedId) {
        processedFolderId = extractedId;
        setFolderId(extractedId);
      }
    }
    
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

    if (!validateFolderId(processedFolderId)) {
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
      const newConfig = { apiKey: apiKey.trim(), folderId: processedFolderId };
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
      
      // Open settings after successful connection
      setIsSettingsOpen(true);
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
          <CardTitle className="text-2xl text-center">เริ่มต้นการใช้งาน</CardTitle>
          <CardDescription className="text-center">
            เชื่อมต่อกับ Google Drive เพื่อแสดงรูปภาพบนแกลเลอรี่
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  Google Drive API Key
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                        <HelpCircle className="h-3 w-3" />
                        <span className="sr-only">คำอธิบาย</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        API Key จะขึ้นต้นด้วย AIza และมีความยาวประมาณ 39 ตัวอักษร
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="เช่น AIzaSyBnGk9euYZMBM1234..."
                required
              />
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  สร้าง API Key ได้จาก <a href="https://console.cloud.google.com/apis/credentials" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>สร้าง Project ใหม่</li>
                  <li>เปิดใช้งาน Google Drive API</li>
                  <li>สร้าง API Key ใหม่จากเมนู Credentials</li>
                </ol>
                <p>
                  <a href="https://developers.google.com/drive/api/quickstart/js" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    ดูคำแนะนำฉบับละเอียด
                  </a>
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="folderId" className="text-sm font-medium">
                  Folder ID ใน Google Drive
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                        <HelpCircle className="h-3 w-3" />
                        <span className="sr-only">คำอธิบาย</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        สามารถใส่ URL ของโฟลเดอร์ได้เลย ระบบจะแยก ID ให้อัตโนมัติ หรือใส่เฉพาะ ID ที่มีความยาวประมาณ 33 ตัวอักษร
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="folderId"
                value={folderId}
                onChange={handleFolderIdChange}
                placeholder="URL โฟลเดอร์ หรือ ID เช่น 1a2b3c4d5e6f7g8h9i0j"
                required
              />
              <div className="text-xs text-muted-foreground space-y-2">
                <p>คุณสามารถใส่ URL ของโฟลเดอร์ได้โดยตรง หรือใส่เฉพาะ ID ก็ได้</p>
                <p>ตัวอย่าง URL: <code className="bg-muted p-1 rounded text-xs">https://drive.google.com/drive/folders/<span className="text-primary">1a2b3c4d5e6f7g8h9i0j</span></code></p>
                <p>ส่วนที่ไฮไลท์คือ Folder ID ที่ต้องนำมาใส่</p>
                <p>
                  <a href="https://developers.google.com/drive/api/guides/search-files" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    อ่านเพิ่มเติมเกี่ยวกับการใช้ Folder ID
                  </a>
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "กำลังเชื่อมต่อ..." : "เริ่มต้นใช้งาน"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ApiSetup;
