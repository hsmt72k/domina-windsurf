"use client";

import { useState } from "react";
import { DomainForm } from "@/components/domains/domain-form";
import { DomainGrid } from "@/components/domains/domain-grid";
import { DomainStatus } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const [results, setResults] = useState<DomainStatus[]>([]);

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
            <CardHeader className="pb-3">
              <CardTitle>ドメイン名チェック</CardTitle>
              <CardDescription>
                ベースとなるドメイン名と確認したいTLDを選択して、一括でドメインの取得可否を確認できます。
                ビジネスアイデアを入力すると、AIがドメイン名を提案してくれます。
              </CardDescription>
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
                  : "ドメインの可用性がここに表示されます"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DomainGrid results={results} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p> {new Date().getFullYear()} Domina - All rights reserved.</p>
        <p className="mt-1">
          Powered by Next.js, shadcn/ui, WHOIS API, and Gemini AI
        </p>
      </footer>
    </main>
  );
};

export default Home;
