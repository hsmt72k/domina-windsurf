import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkDomainSchema } from "@/schemas/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { TldModal } from "./tld-modal";
import { DomainStatus } from "@/types/domain";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

interface DomainFormProps {
  onResults: (results: DomainStatus[]) => void;
}

// Zodスキーマと一致する型定義
type FormValues = z.infer<typeof checkDomainSchema>;

export function DomainForm({ onResults }: DomainFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [businessIdea, setBusinessIdea] = useState("");
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(checkDomainSchema),
    defaultValues: {
      baseName: "",
      tlds: [".com", ".net", ".org"]
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/domains/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("ドメインチェックに失敗しました");
      }
      
      const result = await response.json();
      onResults(result.results);
    } catch (error) {
      console.error("Error checking domains:", error);
      toast.error("ドメインチェック中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ビジネスアイデアからドメイン名を提案
  const generateSuggestions = async () => {
    if (!businessIdea.trim() || businessIdea.length < 5) {
      toast.error("ビジネスアイデアをもう少し詳しく入力してください");
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIdea })
      });

      if (!response.ok) {
        throw new Error("ドメイン名の提案に失敗しました");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("ドメイン名の提案に失敗しました");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // 提案されたドメイン名を選択
  const selectSuggestion = (suggestion: string) => {
    // ベース名と拡張子に分ける（example.comならexampleを使用）
    const baseName = suggestion.split(".")[0];
    form.setValue("baseName", baseName);
    toast.success(`「${baseName}」を選択しました`);
  };

  return (
    <div className="space-y-6">
      {/* ビジネスアイデア入力（ドメイン提案用） */}
      <div className="space-y-2">
        <div className="text-sm font-medium">ビジネスアイデアを入力</div>
        <div className="flex gap-2">
          <Input
            placeholder="例: オンライン料理教室を提供するサービス"
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            onClick={generateSuggestions}
            disabled={isGeneratingSuggestions || !businessIdea.trim()}
          >
            {isGeneratingSuggestions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中
              </>
            ) : (
              "ドメイン名を提案"
            )}
          </Button>
        </div>
      </div>

      {/* 提案結果表示 */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-muted rounded-md">
          <h3 className="text-sm font-medium mb-2">ドメイン名の提案</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ドメイン検索フォーム */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="baseName"
            render={({ field }) => (
              <FormItem>
                <div className="text-sm font-medium">ドメイン名（ベース部分）</div>
                <FormControl>
                  <Input placeholder="例: mycompany" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tlds"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TldModal
                    selectedTlds={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                チェック中...
              </>
            ) : (
              "ドメイン可用性をチェック"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
