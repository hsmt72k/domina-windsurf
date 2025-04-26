import { useState } from "react";
import { supportedTlds } from "@/schemas/domain";
import { Checkbox } from "@/components/ui/checkbox";

interface TldSelectorProps {
  selectedTlds: string[];
  onChange: (tlds: string[]) => void;
}

export function TldSelector({ selectedTlds, onChange }: TldSelectorProps) {
  // TLDをカテゴリ別に整理
  const categories = {
    "一般的": [".com", ".net", ".org"],
    "ビジネス": [".co", ".biz", ".info"],
    "テック": [".io", ".dev", ".app", ".xyz"],
    "国別": [".jp", ".me"],
  };

  const handleTldChange = (tld: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTlds, tld]);
    } else {
      onChange(selectedTlds.filter((t) => t !== tld));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(categories).map(([category, tlds]) => (
          <div key={category} className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">{category}</div>
            <div className="space-y-2">
              {tlds.map((tld) => (
                <div key={tld} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tld-${tld}`}
                    checked={selectedTlds.includes(tld)}
                    onCheckedChange={(checked) => 
                      handleTldChange(tld, checked as boolean)
                    }
                  />
                  <div className="text-sm cursor-pointer" onClick={() => handleTldChange(tld, !selectedTlds.includes(tld))}>
                    {tld}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-right text-muted-foreground">
        {selectedTlds.length} TLDが選択されています
      </div>
    </div>
  );
}
