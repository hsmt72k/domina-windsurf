"use client";

import { useState } from "react";
import { DomainForm } from "@/components/domains/domain-form";
import { DomainGrid } from "@/components/domains/domain-grid";
import { DomainStatus } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [results, setResults] = useState<DomainStatus[]>([]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Domina</h1>
        <p className="text-lg text-muted-foreground">複数のドメイン名を一括でチェックできるツール</p>
      </header>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
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

        {results.length > 0 && <DomainGrid results={results} />}
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p> {new Date().getFullYear()} Domina - All rights reserved.</p>
        <p className="mt-1">
          Powered by Next.js, shadcn/ui, WHOIS API, and Gemini AI
        </p>
      </footer>
    </div>
  );
}
