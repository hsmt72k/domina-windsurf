'use client'

import { useState, useEffect } from 'react'
import { DomainForm } from '@/components/domains/domain-form'
import { DomainGrid } from '@/components/domains/domain-grid'
import { DomainStatus } from '@/types/domain'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

const Home = () => {
  const [results, setResults] = useState<DomainStatus[]>([])
  const [currentYear, setCurrentYear] = useState<number>(0)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Domina</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-xl">
          複数のドメイン名を一括でチェックできるツール
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
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
              <DomainForm onResults={setResults} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>検索結果</CardTitle>
              <CardDescription>
                {results.length > 0
                  ? `${results.length}件のドメインをチェックしました`
                  : 'ドメインの可用性がここに表示されます'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DomainGrid results={results} />
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>{currentYear} Domina - All rights reserved.</p>
        <p className="mt-1">
          Powered by Next.js, shadcn/ui, WHOIS API, and Gemini AI
        </p>
      </footer>
    </main>
  )
}

export default Home
