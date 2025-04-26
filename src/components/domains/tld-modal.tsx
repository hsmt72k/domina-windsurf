import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Settings2 } from "lucide-react";

interface TldModalProps {
  selectedTlds: string[];
  onChange: (tlds: string[]) => void;
}

export function TldModal({ selectedTlds, onChange }: TldModalProps) {
  // モーダル内での選択状態を管理（モーダルを閉じるまで確定させない）
  const [tempSelectedTlds, setTempSelectedTlds] = useState<string[]>(selectedTlds);
  
  // TLDをカテゴリ別に整理
  const categories = {
    "一般的": [".com", ".net", ".org"],
    "ビジネス": [".co", ".biz", ".info"],
    "テック": [".io", ".dev", ".app", ".xyz"],
    "国別": [".jp", ".me"],
  };

  // モーダルを開くときに現在の選択状態をロード
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempSelectedTlds([...selectedTlds]);
    }
  };

  // TLDの選択状態を変更
  const handleTldChange = (tld: string, checked: boolean) => {
    if (checked) {
      setTempSelectedTlds(prev => [...prev, tld]);
    } else {
      setTempSelectedTlds(prev => prev.filter(t => t !== tld));
    }
  };

  // モーダルで選択した内容を確定
  const handleApply = () => {
    onChange(tempSelectedTlds);
  };

  // 選択をすべてクリアする
  const handleClear = () => {
    setTempSelectedTlds([]);
  };

  // タグをクリックして削除
  const handleRemoveTld = (tld: string) => {
    onChange(selectedTlds.filter(t => t !== tld));
  };

  // すべてのタグをクリア
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">チェックするTLDを選択</div>
          <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-1" />
                TLDを変更
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>TLDを選択</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 py-4 max-h-[50vh] overflow-y-auto">
                {Object.entries(categories).map(([category, tlds]) => (
                  <div key={category} className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground">{category}</div>
                    <div className="space-y-2">
                      {tlds.map((tld) => (
                        <div key={tld} className="flex items-center space-x-2">
                          <Checkbox
                            id={`modal-tld-${tld}`}
                            checked={tempSelectedTlds.includes(tld)}
                            onCheckedChange={(checked) => 
                              handleTldChange(tld, checked as boolean)
                            }
                          />
                          <div 
                            className="text-sm cursor-pointer" 
                            onClick={() => handleTldChange(tld, !tempSelectedTlds.includes(tld))}
                          >
                            {tld}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClear}
                  className="mr-auto"
                >
                  クリア
                </Button>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="secondary" size="sm">キャンセル</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button size="sm" onClick={handleApply}>適用 ({tempSelectedTlds.length})</Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {selectedTlds.length > 0 ? (
            <>
              {selectedTlds.map((tld) => (
                <Badge key={tld} variant="secondary" className="flex items-center gap-1">
                  {tld}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTld(tld)}
                  />
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={handleClearAll}
              >
                クリア
              </Button>
            </>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              TLDが選択されていません
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-right text-muted-foreground">
        {selectedTlds.length} TLDが選択されています
      </div>
    </div>
  );
}
