import { KeyboardEvent, useRef, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
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
import { Loader2, X, Plus, Sparkles, CornerDownRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  baseNamesAtom,
  businessIdeaAtom,
  baseNameInputAtom,
  suggestionsAtom,
  tldsAtom,
  resultsAtom,
  isLoadingAtom,
  isGeneratingSuggestionsAtom,
} from '@/store/domain-store'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

interface DomainFormProps {
  onResults: (results: DomainStatus[]) => void
}

export function DomainForm({ onResults }: DomainFormProps) {
  // Jotaiを使った状態管理
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const [businessIdea, setBusinessIdea] = useAtom(businessIdeaAtom)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useAtom(
    isGeneratingSuggestionsAtom
  )
  const [suggestions, setSuggestions] = useAtom(suggestionsAtom)
  const [baseNameInput, setBaseNameInput] = useAtom(baseNameInputAtom)
  const [baseNames, setBaseNames] = useAtom(baseNamesAtom)
  const [savedTlds, setSavedTlds] = useAtom(tldsAtom)
  const [, setResults] = useAtom(resultsAtom)

  const baseNameInputRef = useRef<HTMLInputElement>(null)

  // React Hook Formの設定
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...formDefaultValues,
      tlds: savedTlds.length > 0 ? savedTlds : formDefaultValues.tlds,
    },
  })

  // TLDの変更を監視して自動保存
  const watchedTlds = form.watch('tlds')

  useEffect(() => {
    if (
      watchedTlds &&
      watchedTlds.length > 0 &&
      JSON.stringify(watchedTlds) !== JSON.stringify(savedTlds)
    ) {
      setSavedTlds(watchedTlds)
    }
  }, [watchedTlds, savedTlds, setSavedTlds])

  // フォーム送信処理
  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    // ベース名のリストをフォームに設定
    data.baseNames = baseNames.map((tag) => tag.value)

    console.log('フォーム送信前のデータ:', { formData: data, baseNames })

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
      setResults(result.results)
      onResults(result.results)

      console.log('フォーム送信後のデータ:', {
        formValues: form.getValues(),
        baseNames,
      })
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
      const newSuggestions = data.suggestions || []
      setSuggestions(newSuggestions)

      // JotaiでSuggestionsが自動的に保存されるので追加のコードは不要
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
      e.preventDefault() // フォーム送信を防止
      e.stopPropagation() // イベントの伝播を停止

      // 入力があれば追加処理
      if (baseNameInput.trim()) {
        addBaseName(baseNameInput.trim())
      }
    }
  }

  // ベース名をバリデーションして追加
  const addBaseName = (baseName: string) => {
    try {
      // すでにTLDが含まれているかチェック
      if (baseName.includes('.')) {
        toast.error(
          'TLDを含めないドメイン名のベース部分のみを入力してください。例: example（.comではなく）'
        )
        return
      }

      // バリデーション
      const validationResult = domainBaseNameSchema.safeParse(baseName)
      if (!validationResult.success) {
        toast.error(
          validationResult.error.errors.length > 0
            ? validationResult.error.errors[0].message
            : 'ドメイン名が無効です'
        )
        return
      }

      const normalizedBaseName = baseName.toLowerCase().trim()

      // 既に追加済みかチェック
      if (baseNames.some((tag) => tag.value === normalizedBaseName)) {
        toast.info(`"${normalizedBaseName}" は既に追加されています`)
        return
      }

      // 新しいタグを追加
      const newTag: BaseNameTag = {
        id: crypto.randomUUID(),
        value: normalizedBaseName,
      }

      setBaseNames([...baseNames, newTag])
      setBaseNameInput('')

      // Jotaiが自動的に状態を保存するので追加のlocalStorage操作は不要

      // 入力欄にフォーカスを戻す
      baseNameInputRef.current?.focus()
    } catch (error) {
      console.error('Error adding base name:', error)
      toast.error('ドメイン名の追加中にエラーが発生しました')
    }
  }

  // ベース名タグを削除
  const removeBaseName = (id: string) => {
    setBaseNames(baseNames.filter((tag) => tag.id !== id))
    // Jotaiが自動的に状態を保存するので追加のlocalStorage操作は不要
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="space-y-6">
          {/* ビジネスアイデア入力 */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              アイデアからドメイン名を提案
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  placeholder="あなたのビジネスアイデアや事業内容（例：オンライン料理教室）を入力してください..."
                  className="h-24 resize-none pr-[180px]"
                  value={businessIdea}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setBusinessIdea(e.target.value)
                  }
                />
                <div className="absolute right-2 bottom-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-24 px-0 text-xs hover:cursor-pointer"
                    onClick={() => setBusinessIdea('')}
                    disabled={!businessIdea.trim()}
                  >
                    クリア
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 w-24 px-0 text-xs hover:cursor-pointer bg-gray-800 hover:bg-gray-700 text-white"
                    onClick={generateSuggestions}
                    disabled={isGeneratingSuggestions || !businessIdea.trim()}
                  >
                    {isGeneratingSuggestions ? (
                      <>
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        生成中
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-300" />
                        AI 提案
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 提案されたドメイン名（ローディング中はスケルトン表示） */}
          {(suggestions.length > 0 || isGeneratingSuggestions) && (
            <Card className="border border-amber-100 bg-amber-50/50 dark:border-amber-700/30 dark:bg-amber-900/20">
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-3 text-amber-700 dark:text-amber-300/90 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1.5 text-amber-500 dark:text-amber-400/90" />
                  AI 提案のドメイン名
                </div>
                <div className="flex flex-wrap gap-2 min-h-[38px]">
                  {isGeneratingSuggestions ? (
                    // スケルトンローディング表示（波打つエフェクト）
                    <>
                      {Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={`skeleton-${index}`}
                            className="h-8 rounded-full relative overflow-hidden px-4 inline-flex items-center shimmer-animation"
                            style={{
                              width: `${Math.floor(80 + Math.random() * 80)}px`,
                            }}
                          />
                        ))}
                    </>
                  ) : (
                    // 通常の提案表示
                    suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-white border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors flex items-center gap-1 h-8 pr-3 pl-3 dark:bg-[#1E293B]/60 dark:border-amber-500/30 dark:hover:bg-amber-900/30 dark:text-amber-200"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        <span>{suggestion.split('.')[0]}</span>
                        <CornerDownRight className="h-3 w-3 ml-1.5 text-amber-500" />
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ドメイン名入力 */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">
                ドメイン名を入力して追加
              </div>
              <div className="flex gap-2">
                <Input
                  ref={baseNameInputRef}
                  placeholder="例: mycompany"
                  value={baseNameInput}
                  onChange={(e) => setBaseNameInput(e.target.value)}
                  onKeyDown={handleBaseNameKeyDown}
                  onKeyPress={(e) => {
                    // Enterキーの二重処理防止
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="hover:cursor-pointer px-4"
                  disabled={!baseNameInput.trim()}
                  onClick={() => addBaseName(baseNameInput.trim())}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  追加
                </Button>
              </div>

              {/* 追加したベース名のタグ表示 */}
              <div className="flex flex-wrap gap-2 min-h-[48px] p-2 bg-gray-50 rounded-md border border-gray-100">
                {baseNames.length > 0 ? (
                  <>
                    {baseNames.map((baseName) => (
                      <Badge
                        key={baseName.id}
                        variant="secondary"
                        className="flex items-center gap-1 h-8 pr-2.5 pl-3"
                      >
                        {baseName.value}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50 hover:cursor-pointer rounded-full ml-1 transition-colors"
                          onClick={() => removeBaseName(baseName.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </Badge>
                    ))}
                    {baseNames.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs hover:cursor-pointer"
                        onClick={() => setBaseNames([])}
                      >
                        クリア
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground p-1">
                    ドメイン名をまだ追加していません
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* TLD選択 */}
              <div className="text-sm font-medium text-gray-700">TLDを選択</div>
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
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="w-full py-6 hover:cursor-pointer bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
              disabled={isLoading || baseNames.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                  チェック中...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2.5 h-5 w-5"
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

        {baseNames.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            <span className="font-medium text-primary">
              {baseNames.length}個
            </span>
            のドメイン名と
            <span className="font-medium text-primary">
              {form.getValues('tlds').length}個
            </span>
            のTLDを組み合わせて
            <span className="font-medium text-primary">
              {baseNames.length * form.getValues('tlds').length}個
            </span>
            のドメインを一括チェックします
          </div>
        )}
      </Form>
    </div>
  )
}
