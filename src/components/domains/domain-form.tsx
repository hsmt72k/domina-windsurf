import { useState, KeyboardEvent, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  formSchema,
  domainBaseNameSchema,
  FormSchemaType,
  formDefaultValues,
} from '@/schemas/domain'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { TldModal } from './tld-modal'
import { DomainStatus, BaseNameTag } from '@/types/domain'
import { toast } from 'sonner'
import { Loader2, X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DomainFormProps {
  onResults: (results: DomainStatus[]) => void
}

export function DomainForm({ onResults }: DomainFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [businessIdea, setBusinessIdea] = useState('')
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // ベース名入力用
  const [baseNameInput, setBaseNameInput] = useState('')
  const [baseNames, setBaseNames] = useState<BaseNameTag[]>([])
  const baseNameInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
  })

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    // ベース名のリストをフォームに設定
    data.baseNames = baseNames.map((tag) => tag.value)

    // ベース名もしくはTLDが一つもない場合はエラー
    if (data.baseNames.length === 0) {
      toast.error('少なくとも1つのドメイン名を入力してください')
      return
    }

    if (data.tlds.length === 0) {
      toast.error('少なくとも1つのTLDを選択してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/domains/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseNames: data.baseNames,
          tlds: data.tlds,
        }),
      })

      if (!response.ok) {
        throw new Error('ドメインチェックに失敗しました')
      }

      const result = await response.json()
      onResults(result.results)
    } catch (error) {
      console.error('Error checking domains:', error)
      toast.error('ドメインチェック中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // ビジネスアイデアからドメイン名を提案
  const generateSuggestions = async () => {
    if (!businessIdea.trim() || businessIdea.length < 5) {
      toast.error('ビジネスアイデアをもう少し詳しく入力してください')
      return
    }

    setIsGeneratingSuggestions(true)
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIdea }),
      })

      if (!response.ok) {
        throw new Error('ドメイン名の提案に失敗しました')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error('ドメイン名の提案に失敗しました')
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // 提案されたドメイン名をベース部分として追加
  const selectSuggestion = (suggestion: string) => {
    // ベース名のみを抽出（example.comならexampleのみ）
    const baseName = suggestion.split('.')[0]
    addBaseName(baseName)
  }

  // ベース名を入力して追加するハンドラー
  const handleBaseNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (baseNameInput.trim()) {
        addBaseName(baseNameInput.trim())
      }
    }
  }

  // ベース名をバリデーションして追加
  const addBaseName = (baseName: string) => {
    try {
      // 入力値のバリデーション
      const validateResult = domainBaseNameSchema.safeParse(baseName)
      if (!validateResult.success) {
        toast.error('英数字とハイフンのみ使用できます')
        return
      }

      // 重複チェック
      if (baseNames.some((item) => item.value === baseName)) {
        toast.error('同じドメイン名が既に追加されています')
        return
      }

      // ベース名をタグとして追加
      setBaseNames((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          value: baseName,
        },
      ])

      // 入力フィールドをクリア
      setBaseNameInput('')
      baseNameInputRef.current?.focus()
    } catch (error) {
      console.error('Error adding baseName:', error)
      toast.error('ドメイン名の追加に失敗しました')
    }
  }

  // ベース名タグを削除
  const removeBaseName = (id: string) => {
    setBaseNames((prev) => prev.filter((tag) => tag.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Form全体を包むFormコンポーネント */}
      <Form {...form}>
        {/* グリッドレイアウト - AI提案と手動入力を横並びに */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI提案セクション */}
          <div className="space-y-3">
            <div className="text-sm font-medium">
              ビジネスアイデアから AI提案
            </div>
            <div>
              <Input
                placeholder="例: オンライン料理教室サービス"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={generateSuggestions}
              disabled={isGeneratingSuggestions || !businessIdea.trim()}
              className="hover:cursor-pointer w-full"
            >
              {isGeneratingSuggestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中
                </>
              ) : (
                'AIにドメイン名を提案してもらう'
              )}
            </Button>

            {/* 提案結果表示 */}
            {suggestions.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-md h-[calc(100%-132px)] min-h-[150px] overflow-y-auto">
                <h3 className="text-xs font-medium mb-1.5">
                  提案されたドメイン名
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion, idx) => {
                    // ドメイン名からベース部分のみを抽出（TLDを除去）
                    const baseName = suggestion.split('.')[0]
                    return (
                      <Button
                        key={idx}
                        variant="secondary"
                        size="sm"
                        onClick={() => selectSuggestion(suggestion)}
                        className="h-7 px-2 hover:cursor-pointer"
                      >
                        {baseName}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 手動入力セクション */}
          <div className="space-y-3">
            <div className="text-sm font-medium">ドメイン名を入力して追加</div>
            <div className="flex gap-2">
              <Input
                ref={baseNameInputRef}
                placeholder="例: mycompany"
                value={baseNameInput}
                onChange={(e) => setBaseNameInput(e.target.value)}
                onKeyDown={handleBaseNameKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="hover:cursor-pointer"
                disabled={!baseNameInput.trim()}
                onClick={() => addBaseName(baseNameInput.trim())}
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>

            {/* 追加したベース名のタグ表示 */}
            <div className="flex flex-wrap gap-1.5 min-h-[38px]">
              {baseNames.map((baseName) => (
                <Badge
                  key={baseName.id}
                  variant="secondary"
                  className="flex items-center gap-1 h-6"
                >
                  {baseName.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 hover:bg-transparent hover:cursor-pointer"
                    onClick={() => removeBaseName(baseName.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {baseNames.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:cursor-pointer"
                  onClick={() => setBaseNames([])}
                >
                  クリア
                </Button>
              )}
            </div>

            <div className="pt-2">
              {/* TLD選択 */}
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
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                className="w-full py-6 hover:cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    チェック中...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                    ドメインが利用可能かどうかをチェック
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          複数のドメイン名とTLDを組み合わせて一括チェックできます
        </div>
      </Form>
    </div>
  )
}
