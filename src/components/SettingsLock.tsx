
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "@/components/ui/use-toast";

interface SettingsLockProps {
  isLocked: boolean;
  onLockChange: (locked: boolean) => void;
}

const SettingsLock: React.FC<SettingsLockProps> = ({ 
  isLocked, 
  onLockChange
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const handleLockClick = () => {
    if (!isLocked) {
      // Simple locking without PIN
      onLockChange(true);
      toast({
        description: t("settings.lock.locked"),
      });
    } else {
      // Simple dialog to confirm unlocking
      setIsDialogOpen(true);
    }
  };
  
  const handleUnlock = () => {
    onLockChange(false);
    setIsDialogOpen(false);
    toast({
      description: t("settings.lock.unlocked"),
    });
  };
  
  return (
    <>
      <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{t("settings.lock.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {isLocked ? t("settings.lock.locked") : t("settings.lock.unlocked")}
            </p>
          </div>
          
          <Button 
            variant={isLocked ? "destructive" : "outline"} 
            size="sm"
            onClick={handleLockClick}
          >
            {isLocked ? (
              <><Unlock className="h-4 w-4 mr-2" /> {t("settings.lock.unlock")}</>
            ) : (
              <><Lock className="h-4 w-4 mr-2" /> {t("settings.lock.lock")}</>
            )}
          </Button>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.lock.confirmUnlock")}</DialogTitle>
            <DialogDescription>{t("settings.lock.confirmUnlockDescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("settings.cancel")}
            </Button>
            <Button onClick={handleUnlock}>
              {t("settings.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsLock;
