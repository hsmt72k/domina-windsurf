'use client'

import { DomainForm } from '@/components/domains/domain-form'
import { DomainGrid } from '@/components/domains/domain-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useAtom } from 'jotai'
import { resultsAtom } from '@/store/domain-store'
import { DomainStatus } from '@/types/domain'
import { useEffect, useState, useRef } from 'react'

export default function Home() {
  const currentYear = new Date().getFullYear()
  const [results, setResults] = useAtom(resultsAtom)

  // ヘッダー背景色の状態管理
  const [isHeaderTransparent, setIsHeaderTransparent] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)

  // スクロール検出とヘッダー背景色の変更
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom
        // ヒーローセクションの下端がビューポートの上部に達したら背景色を変更
        setIsHeaderTransparent(heroBottom > 60) // ヘッダーの高さ分余裕を持たせる
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初期状態の設定

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 検索結果を処理する関数
  const handleResults = (newResults: DomainStatus[]) => {
    setResults(newResults)
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダーとナビゲーション */}
      <header
        className={`border-b ${
          isHeaderTransparent
            ? 'bg-gradient-to-r from-primary/90 to-primary border-transparent'
            : 'bg-white border-gray-100 shadow-sm'
        } sticky top-0 py-3 px-6 z-20 transition-colors duration-300`}
      >
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={isHeaderTransparent ? 'text-white' : 'text-primary'}
            >
              {/* GoDaddy風の「D」 */}
              <path
                d="M7 7V25H16C20.4183 25 24 21.4183 24 17C24 12.5817 20.4183 9 16 9H7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* クリーンな分割線 */}
              <path
                d="M12 9V25"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* サークルアクセント */}
              <circle cx="18" cy="17" r="1.5" fill="currentColor" />
            </svg>
            <div className="flex flex-col">
              <h1
                className={`text-xl font-bold tracking-tight ${
                  isHeaderTransparent ? 'text-white' : 'text-gray-900'
                }`}
              >
                Domina
              </h1>
              <p
                className={`text-xs ${
                  isHeaderTransparent ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                ドメイン検索ツール
              </p>
            </div>
          </div>
          <div
            className={`text-sm ${
              isHeaderTransparent ? 'text-white/90' : 'text-gray-600'
            }`}
          >
            <span className="hidden md:inline">快適な</span>ドメイン検索体験
          </div>
        </div>
      </header>

      {/* ヒーローセクション - モダンで目を引く見出し */}
      <div
        ref={heroRef}
        className="bg-gradient-to-r from-primary/90 to-primary pt-6 pb-14 md:pt-12 md:pb-28 px-6"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col gap-7 text-center items-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              理想的なドメイン名を
              <span className="text-amber-300">見つけよう</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              ビジネスアイデアからドメイン名を生成し、利用可能なドメインをチェック。AI
              が創造的な提案をします
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* アクションカードスタイル - 入力フォーム */}
        <div className="mb-10 bg-white rounded-xl shadow-xl p-8 -mt-20 relative z-10 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Search className="h-5 w-5 mr-2.5 text-primary" />
            ドメイン検索
          </h2>
          <DomainForm onResults={handleResults} />
        </div>

        {/* 結果表示エリア */}
        <div className="mt-8">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="mb-5">
              <TabsTrigger value="results" className="text-base px-5 py-2.5">
                検索結果{' '}
                {results.length > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-2.5 bg-primary/10 text-primary"
                  >
                    {results.length}件
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="ml-2.5 bg-primary/10 text-primary"
                  >
                    検索してください
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="results" className="mt-0">
              <DomainGrid results={results} />
            </TabsContent>
          </Tabs>
        </div>

        {/* 機能と特徴の説明 */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="AIによる提案"
            description="Gemini AIを活用して、ビジネスアイデアに最適な創造的なドメイン名を提案します。"
            icon={
              <div className="bg-blue-100 p-3.5 rounded-full text-blue-600">
                🧠
              </div>
            }
          />
          <FeatureCard
            title="リアルタイム可用性チェック"
            description="提案されたドメインをリアルタイムでチェックし、利用可能なドメインを素早く発見できます。"
            icon={
              <div className="bg-green-100 p-3.5 rounded-full text-green-600">
                ⚡
              </div>
            }
          />
          <FeatureCard
            title="WHOIS情報の表示"
            description="登録済みドメインの詳細なWHOIS情報をわかりやすく日本語で表示します。"
            icon={
              <div className="bg-purple-100 p-3.5 rounded-full text-purple-600">
                🔍
              </div>
            }
          />
        </div>
      </div>

      {/* フッター */}
      <footer className="mt-20 py-6 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p> {currentYear} Domina Windsurf - ドメイン検索ツール</p>
        </div>
      </footer>
    </div>
  )
}

// 特徴カードコンポーネント
function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {icon}
        <div>
          <h3 className="font-medium text-lg mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}
