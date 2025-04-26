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
import { TLD } from "@/schemas/domain";

interface TldModalProps {
  selectedTlds: TLD[];
  onChange: (tlds: TLD[]) => void;
}

export function TldModal({ selectedTlds, onChange }: TldModalProps) {
  // モーダル内での選択状態を管理（モーダルを閉じるまで確定させない）
  const [tempSelectedTlds, setTempSelectedTlds] = useState<TLD[]>(selectedTlds);
  
  // TLDをカテゴリ別に整理
  const categories: Record<string, TLD[]> = {
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
  const handleTldChange = (tld: TLD, checked: boolean) => {
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

  // すべてのTLDを選択
  const handleSelectAll = () => {
    const allTlds = Object.values(categories).flat();
    setTempSelectedTlds(allTlds);
  };

  // タグをクリックして削除
  const handleRemoveTld = (tld: TLD) => {
    onChange(selectedTlds.filter(t => t !== tld));
  };

  // すべてのタグをクリア
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">チェックするTLDを選択</div>
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hover:cursor-pointer">
              <Settings2 className="h-4 w-4 mr-1" />
              TLDを変更
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>TLDを選択</DialogTitle>
            </DialogHeader>
            
            <div className="flex justify-between items-center py-2">
              <div className="text-sm text-muted-foreground">
                {tempSelectedTlds.length} / {Object.values(categories).flat().length} 件選択中
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClear}
                  className="hover:cursor-pointer"
                >
                  すべて解除
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="hover:cursor-pointer"
                >
                  すべて選択
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2 max-h-[40vh] overflow-y-auto">
              {Object.entries(categories).map(([category, tlds]) => (
                <div key={category} className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">{category}</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {tlds.map((tld) => (
                      <div key={tld} className="flex items-center space-x-2">
                        <Checkbox
                          id={`modal-tld-${tld}`}
                          checked={tempSelectedTlds.includes(tld)}
                          onCheckedChange={(checked) => 
                            handleTldChange(tld, checked as boolean)
                          }
                        />
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="h-5 p-0 text-sm hover:cursor-pointer hover:bg-transparent"
                          onClick={() => handleTldChange(tld, !tempSelectedTlds.includes(tld))}
                        >
                          {tld}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="secondary" size="sm" className="hover:cursor-pointer">キャンセル</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm" onClick={handleApply} className="hover:cursor-pointer">適用 ({tempSelectedTlds.length})</Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {selectedTlds.length > 0 ? (
          <>
            {selectedTlds.map((tld) => (
              <Badge key={tld} variant="secondary" className="flex items-center gap-1 h-6">
                {tld}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent hover:cursor-pointer"
                  onClick={() => handleRemoveTld(tld)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs hover:cursor-pointer" 
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
      
      <div className="text-xs text-right text-muted-foreground">
        {selectedTlds.length} TLDが選択されています
      </div>
    </div>
  );
}
