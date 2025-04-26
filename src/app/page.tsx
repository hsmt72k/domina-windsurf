'use client'

import { useState, useEffect } from 'react'
import { DomainForm } from '@/components/domains/domain-form'
import { DomainGrid } from '@/components/domains/domain-grid'
import { DomainStatus } from '@/types/domain'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Info } from 'lucide-react'

const Home = () => {
  const [results, setResults] = useState<DomainStatus[]>([])
  const [currentYear, setCurrentYear] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("input")

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  // 結果が表示されたら自動的に結果タブに切り替え
  useEffect(() => {
    if (results.length > 0) {
      setActiveTab("results")
    }
  }, [results])

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Domina</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-xl">
          複数のドメイン名を一括でチェックできるツール
        </p>
      </div>
      
      <div className="mx-auto max-w-5xl">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <CardTitle>ドメイン名チェック</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4 opacity-60 text-slate-100">
                    ベースとなるドメイン名と確認したいTLDを選択して、一括でドメインの取得可否を確認できます。
                    ビジネスアイデアを入力すると、AIがドメイン名を提案してくれます。
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="input" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="input" className="hover:cursor-pointer">入力フォーム</TabsTrigger>
                <TabsTrigger value="results" className="hover:cursor-pointer">
                  検索結果 {results.length > 0 && `(${results.length}件)`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="input">
                <DomainForm onResults={setResults} />
              </TabsContent>
              
              <TabsContent value="results">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {results.length > 0 
                      ? `${results.length}件のドメインをチェックしました`
                      : "ドメインの可用性がここに表示されます"}
                  </p>
                  <DomainGrid results={results} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>{currentYear} Domina - All rights reserved.</p>
        <p className="mt-1">
          Powered by Next.js, shadcn/ui, WHOIS API, and Gemini AI
        </p>
      </footer>
    </main>
  )
}

export default Home
