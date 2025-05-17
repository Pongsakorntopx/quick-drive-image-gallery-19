
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "../context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowUpRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const ApiSetup: React.FC = () => {
  const { setApiConfig, refreshPhotos, isLoading, setIsSettingsOpen } = useAppContext();
  const [apiKey, setApiKey] = useState("");
  const [folderId, setFolderId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() || !folderId.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "API Key และ Folder ID จำเป็นต้องระบุ",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      setApiConfig({ apiKey, folderId });
      
      // Open settings after configuring API
      setIsSettingsOpen(true);
    } catch (error) {
      console.error("Error setting API config:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>ยินดีต้อนรับสู่แกลเลอรี่รูปภาพ Google Drive</CardTitle>
          <CardDescription>
            กรุณากรอกข้อมูลที่จำเป็นเพื่อเชื่อมต่อกับ Google Drive
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Google Drive API Key</Label>
              <Input
                id="apiKey"
                placeholder="ใส่ API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 p-2 rounded-md">
                <p>API Key สามารถสร้างได้จาก Google Cloud Console ตามขั้นตอนต่อไปนี้:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>สร้าง Project ใหม่</li>
                  <li>เปิดใช้งาน Google Drive API</li>
                  <li>สร้าง API Key จากเมนู Credentials</li>
                  <li>จำกัดสิทธิ์การใช้งาน API Key ให้ใช้ได้เฉพาะ Google Drive API</li>
                </ol>
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-primary hover:underline mt-1"
                >
                  ไปที่ Google Cloud Console <ArrowUpRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <Label htmlFor="folderId">Google Drive Folder ID</Label>
              <Input
                id="folderId"
                placeholder="ใส่รหัสโฟลเดอร์"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              />
              <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 p-2 rounded-md">
                <p>Folder ID คือตัวระบุเฉพาะของโฟลเดอร์ใน Google Drive</p>
                <p>วิธีดู Folder ID:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>เปิดโฟลเดอร์ที่ต้องการใน Google Drive</li>
                  <li>ดูที่ URL จะมีรูปแบบดังนี้:</li>
                  <code className="block bg-muted p-1 rounded mt-1 text-xs overflow-hidden text-ellipsis">
                    https://drive.google.com/drive/folders/<span className="text-primary font-medium">1a2b3c4d5e6f7g8h9i0j</span>
                  </code>
                  <li>ส่วนที่ไฮไลท์คือ Folder ID ที่ต้องนำมาใส่</li>
                </ol>
                <p className="mt-1">
                  <strong>สำคัญ:</strong> โฟลเดอร์ต้องตั้งค่าให้เปิดเป็นสาธารณะหรือแชร์ให้เข้าถึงได้
                </p>
                <a 
                  href="https://developers.google.com/drive/api/guides/folder" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-primary hover:underline mt-1"
                >
                  อ่านเพิ่มเติม <ArrowUpRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            {isConnecting && (
              <Alert className="bg-green-50 border-green-300">
                <AlertDescription className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังเชื่อมต่อไปยัง Google Drive... กรุณารอสักครู่
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full" 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLoading || isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเชื่อมต่อ...
              </>
            ) : (
              "เริ่มต้นใช้งาน"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiSetup;
