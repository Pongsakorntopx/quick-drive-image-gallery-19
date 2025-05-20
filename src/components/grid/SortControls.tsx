
import React from "react";
import { SortOrder } from "@/context/AppContextTypes";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  ListOrdered
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SortControlsProps {
  sortOrder: SortOrder;
  onChange: (sortOrder: SortOrder) => void;
  language: string;
}

const SortControls: React.FC<SortControlsProps> = ({ 
  sortOrder, 
  onChange,
  language
}) => {
  const toggleDirection = () => {
    onChange({
      ...sortOrder,
      direction: sortOrder.direction === "asc" ? "desc" : "asc"
    });
  };

  const handleFieldChange = (field: "name" | "modifiedTime" | "createdTime") => {
    onChange({
      ...sortOrder,
      field
    });
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 text-sm">
            {sortOrder.field === "name" && <ListOrdered className="h-4 w-4" />}
            {sortOrder.field === "modifiedTime" && <CalendarDays className="h-4 w-4" />}
            {sortOrder.field === "createdTime" && <CalendarDays className="h-4 w-4" />}
            
            {language === "th" ? "เรียงลำดับตาม" : "Sort by"}: {" "}
            {sortOrder.field === "name" && (language === "th" ? "ชื่อ" : "Name")}
            {sortOrder.field === "modifiedTime" && (language === "th" ? "วันที่แก้ไข" : "Modified Date")}
            {sortOrder.field === "createdTime" && (language === "th" ? "วันที่สร้าง" : "Created Date")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>{language === "th" ? "เรียงลำดับตาม" : "Sort by"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleFieldChange("name")}
            className="flex items-center gap-2"
          >
            <ListOrdered className="h-4 w-4" />
            {language === "th" ? "ชื่อ" : "Name"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleFieldChange("modifiedTime")}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            {language === "th" ? "วันที่แก้ไข" : "Modified Date"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleFieldChange("createdTime")}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            {language === "th" ? "วันที่สร้าง" : "Created Date"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleDirection}
        className="text-xs"
      >
        {sortOrder.direction === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default SortControls;
