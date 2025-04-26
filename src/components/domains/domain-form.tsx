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
import { Loader2, Lightbulb, X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { z } from 'zod'

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
      // ベース名のバリデーション
      const validatedBaseName = domainBaseNameSchema.parse(baseName)

      // 重複チェック
      if (baseNames.some((b) => b.value === validatedBaseName)) {
        toast.error('このドメイン名は既に追加されています')
        return
      }

      // 新しいベース名をタグとして追加
      const newBaseName: BaseNameTag = {
        id: `basename-${Date.now()}`,
        value: validatedBaseName,
      }

      setBaseNames([...baseNames, newBaseName])
      setBaseNameInput('') // 入力フィールドをクリア
      toast.success(`「${validatedBaseName}」を追加しました`)
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message || '無効なドメイン名です')
      } else {
        toast.error('ドメイン名の追加に失敗しました')
      }
    }
  }

  // ベース名タグを削除
  const removeBaseName = (id: string) => {
    setBaseNames(baseNames.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* ビジネスアイデア入力（ドメイン提案用） */}
      <div>
        <div className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              ビジネスアイデアを入力
            </div>
            <Input
              placeholder="例: オンライン料理教室を提供するサービス"
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={generateSuggestions}
            disabled={isGeneratingSuggestions || !businessIdea.trim()}
            className="mt-6"
          >
            {isGeneratingSuggestions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中
              </>
            ) : (
              '提案'
            )}
          </Button>
        </div>

        {/* 提案結果表示 */}
        {suggestions.length > 0 && (
          <div className="p-3 mt-2 bg-muted/50 rounded-md">
            <h3 className="text-xs font-medium mb-1.5">ドメイン名の提案</h3>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  size="sm"
                  onClick={() => selectSuggestion(suggestion)}
                  className="h-7 px-2"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ドメイン検索フォーム */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ベース名入力 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">ドメイン名（ベース部分）</div>
            <div className="flex flex-col gap-3">
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
                  onClick={() => {
                    if (baseNameInput.trim()) {
                      addBaseName(baseNameInput.trim())
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>

              {/* 追加したベース名のタグ表示 */}
              {baseNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {baseNames.map((baseName) => (
                    <Badge
                      key={baseName.id}
                      variant="secondary"
                      className="flex items-center gap-1 h-6"
                    >
                      {baseName.value}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeBaseName(baseName.id)}
                      />
                    </Badge>
                  ))}
                  {baseNames.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setBaseNames([])}
                    >
                      クリア
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

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
              'ドメイン可用性をチェック'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
