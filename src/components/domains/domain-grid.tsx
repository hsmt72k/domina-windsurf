import { DomainStatus } from "@/types/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, AlertCircle, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhoisModal } from "./whois-modal";
import { Badge } from "@/components/ui/badge";

interface DomainGridProps {
  results: DomainStatus[];
}

export function DomainGrid({ results }: DomainGridProps) {
  // 利用可能なドメイン
  const available = results.filter((result) => result.available && !result.error);
  // 利用不可能なドメイン
  const unavailable = results.filter(
    (result) => !result.available && !result.error
  );
  // エラーのあるドメイン
  const errors = results.filter((result) => result.error);

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="mb-5 rounded-full bg-primary/10 p-4">
            <div className="rounded-full bg-primary/20 p-3">
              <Globe className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-semibold">検索結果がありません</h3>
          <p className="mb-5 text-sm text-muted-foreground leading-relaxed">
            ドメイン名を入力して「チェック」ボタンをクリックすると、
            <br />利用可能なドメインとその詳細がここに表示されます。
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-gray-100 overflow-hidden shadow-sm">
      <CardHeader className="bg-gray-50/80 py-5 px-6">
        <CardTitle className="text-lg">ドメイン検索結果</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-3 mt-2">
          <span>検索されたドメイン: {results.length}件</span>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-[#223042]/60 dark:text-[#A8E890]/90 dark:hover:bg-[#223042]/70 px-3 py-1">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              利用可能: {available.length}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 dark:bg-[#2A1E28]/60 dark:text-[#F87171]/90 dark:hover:bg-[#2A1E28]/70 px-3 py-1">
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              登録済み: {unavailable.length}
            </Badge>
            {errors.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-[#2A2420]/60 dark:text-[#FBBF24]/90 dark:hover:bg-[#2A2420]/70 px-3 py-1">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                エラー: {errors.length}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[200px] py-3.5 pl-6">ドメイン名</TableHead>
              <TableHead className="w-[150px]">ステータス</TableHead>
              <TableHead className="pr-6">詳細</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 利用可能なドメインを先に表示 */}
            {available.map((result) => (
              <TableRow key={result.domain} className="hover:bg-green-50/30 dark:hover:bg-[#1F3A2C]/30">
                <TableCell className="font-medium py-3.5 pl-6">{result.domain}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 px-2.5 dark:bg-[#223042]/60 dark:text-[#A8E890]/90 dark:hover:bg-[#223042]/70">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    利用可能
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center justify-between pr-6">
                  <span className="text-muted-foreground">{result.message}</span>
                </TableCell>
              </TableRow>
            ))}
            
            {/* 利用不可能なドメイン */}
            {unavailable.map((result) => (
              <TableRow key={result.domain} className="hover:bg-red-50/20 dark:hover:bg-[#3A2027]/30">
                <TableCell className="font-medium py-3.5 pl-6">{result.domain}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50 text-red-700 px-2.5 dark:bg-[#2A1E28]/60 dark:text-[#F87171]/90 dark:hover:bg-[#2A1E28]/70">
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    登録済み
                  </Badge>
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{result.message}</span>
                    <WhoisModal domain={result.domain} whoisData={result.whoisData} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {/* エラーのあるドメイン */}
            {errors.map((result) => (
              <TableRow key={result.domain} className="hover:bg-amber-50/20 dark:hover:bg-[#382918]/30">
                <TableCell className="font-medium py-3.5 pl-6">{result.domain}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 px-2.5 dark:bg-[#2A2420]/60 dark:text-[#FBBF24]/90 dark:hover:bg-[#2A2420]/70">
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                    エラー
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground pr-6">{result.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
