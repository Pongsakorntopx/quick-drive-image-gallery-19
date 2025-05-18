
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "../context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowUpRight, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "../hooks/useTranslation";

const ApiSetup: React.FC = () => {
  const { setApiConfig, refreshPhotos, isLoading, resetAllData } = useAppContext();
  const [apiKey, setApiKey] = useState("");
  const [folderId, setFolderId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { t } = useTranslation();

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
      // Save the configuration
      setApiConfig({ apiKey, folderId });
      
      // Immediately try to refresh photos
      await refreshPhotos();
      
      // Success toast
      toast({
        title: t("toast.connection.success"),
        description: t("toast.connection.success"),
      });
      
    } catch (error) {
      console.error("Error setting API config:", error);
      toast({
        title: t("toast.connection.error"),
        description: t("toast.connection.error"),
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleReset = () => {
    resetAllData();
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>{t("setup.welcome")}</CardTitle>
          <CardDescription>
            {t("setup.instructions")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t("setup.apiKey")}</Label>
              <Input
                id="apiKey"
                placeholder={t("setup.apiKeyPlaceholder")}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md overflow-auto max-h-28">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-primary hover:underline mt-1"
                >
                  Google Cloud Console <ArrowUpRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <Label htmlFor="folderId">{t("setup.folderId")}</Label>
              <Input
                id="folderId"
                placeholder={t("setup.folderIdPlaceholder")}
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              />
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md overflow-auto max-h-28">
                <code className="block bg-muted p-1 rounded mt-1 text-xs overflow-auto">
                  https://drive.google.com/drive/folders/<span className="text-primary font-medium">1a2b3c4d5e6f7g8h9i0j</span>
                </code>
              </div>
            </div>

            {isConnecting && (
              <Alert className="bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800">
                <AlertDescription className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("setup.connecting")}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLoading || isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("setup.connecting")}
              </>
            ) : (
              t("setup.start")
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10"
            onClick={handleReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("setup.reset")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiSetup;
