
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GridErrorProps {
  error: string;
  onRetry: () => void;
}

const GridError: React.FC<GridErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[400px]">
      <div className="text-lg mb-4 text-destructive">{error}</div>
      <Button onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};

export default GridError;
