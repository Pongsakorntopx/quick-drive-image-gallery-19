
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";

interface SettingsLockProps {
  isLocked: boolean;
  onLockChange: (locked: boolean) => void;
  onPinChange: (pin: string) => void;
  pin: string;
  pinLength: number;
  onPinLengthChange: (length: 4 | 6 | 8) => void;
}

const SettingsLock: React.FC<SettingsLockProps> = ({ 
  isLocked, 
  onLockChange, 
  pin, 
  onPinChange,
  pinLength,
  onPinLengthChange
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [mode, setMode] = useState<"unlock" | "set" | "change">("unlock");
  
  const handleLockClick = () => {
    if (!isLocked) {
      // Setting a new PIN
      setMode("set");
      setIsDialogOpen(true);
    } else {
      // Unlocking with PIN
      setMode("unlock");
      setIsDialogOpen(true);
    }
  };
  
  const handlePinSubmit = () => {
    if (mode === "unlock") {
      if (currentPin === pin) {
        onLockChange(false);
        setIsDialogOpen(false);
        toast({
          description: t("settings.lock.unlocked"),
        });
      } else {
        toast({
          variant: "destructive",
          description: t("settings.lock.wrongPin"),
        });
      }
      setCurrentPin("");
    } else if (mode === "set") {
      onPinChange(newPin);
      onLockChange(true);
      setIsDialogOpen(false);
      toast({
        description: t("settings.lock.pinSet"),
      });
      setNewPin("");
    } else if (mode === "change") {
      if (currentPin === pin) {
        onPinChange(newPin);
        setIsDialogOpen(false);
        toast({
          description: t("settings.lock.pinChanged"),
        });
      } else {
        toast({
          variant: "destructive",
          description: t("settings.lock.wrongPin"),
        });
      }
      setCurrentPin("");
      setNewPin("");
    }
  };
  
  const changePinLength = (length: 4 | 6 | 8) => {
    onPinLengthChange(length);
    setCurrentPin("");
    setNewPin("");
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
        
        {isLocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMode("change");
              setIsDialogOpen(true);
            }}
          >
            {t("settings.lock.changePin")}
          </Button>
        )}
        
        {!isLocked && (
          <div className="mt-2">
            <span className="text-sm font-medium block mb-2">{t("settings.lock.pinLength")}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={pinLength === 4 ? "default" : "outline"}
                onClick={() => changePinLength(4)}
              >
                4 {t("settings.lock.digits")}
              </Button>
              <Button
                size="sm"
                variant={pinLength === 6 ? "default" : "outline"}
                onClick={() => changePinLength(6)}
              >
                6 {t("settings.lock.digits")}
              </Button>
              <Button
                size="sm"
                variant={pinLength === 8 ? "default" : "outline"}
                onClick={() => changePinLength(8)}
              >
                8 {t("settings.lock.digits")}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "unlock" && t("settings.lock.enterPin")}
              {mode === "set" && t("settings.lock.setPin")}
              {mode === "change" && t("settings.lock.changePin")}
            </DialogTitle>
            <DialogDescription>
              {mode === "unlock" && t("settings.lock.enterPinDescription")}
              {mode === "set" && t("settings.lock.setPinDescription")}
              {mode === "change" && t("settings.lock.changePinDescription")}
            </DialogDescription>
          </DialogHeader>
          
          {(mode === "unlock" || mode === "change") && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("settings.lock.currentPin")}
              </label>
              <InputOTP
                maxLength={pinLength}
                value={currentPin}
                onChange={setCurrentPin}
                pattern="[0-9]"
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, idx) => (
                      <InputOTPSlot key={idx} {...slot} index={idx} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
          )}
          
          {(mode === "set" || mode === "change") && (
            <div className={mode === "change" ? "mt-4" : ""}>
              <label className="text-sm font-medium mb-2 block">
                {t("settings.lock.newPin")}
              </label>
              <InputOTP
                maxLength={pinLength}
                value={newPin}
                onChange={setNewPin}
                pattern="[0-9]"
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, idx) => (
                      <InputOTPSlot key={idx} {...slot} index={idx} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("settings.cancel")}
            </Button>
            <Button 
              onClick={handlePinSubmit}
              disabled={(mode === "unlock" || mode === "change") && currentPin.length < pinLength || (mode === "set" || mode === "change") && newPin.length < pinLength}
            >
              {t("settings.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsLock;
