import { DomainStatus } from "@/types/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DomainGridProps {
  results: DomainStatus[];
}

export function DomainGrid({ results }: DomainGridProps) {
  // 結果を利用可能・利用不可・エラーでグループ化
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available && !r.error);
  const errors = results.filter(r => r.error);

  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ドメイン検索結果</CardTitle>
        <CardDescription>
          検索されたドメイン: {results.length}件
          （利用可能: {available.length}件 / 登録済み: {unavailable.length}件 / エラー: {errors.length}件）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">ドメイン名</TableHead>
              <TableHead className="w-1/4">ステータス</TableHead>
              <TableHead className="w-1/4">詳細</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 利用可能なドメインを先に表示 */}
            {available.map((result) => (
              <TableRow key={result.domain}>
                <TableCell className="font-medium">{result.domain}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-green-600">利用可能</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{result.message}</TableCell>
              </TableRow>
            ))}
            
            {/* 利用不可能なドメイン */}
            {unavailable.map((result) => (
              <TableRow key={result.domain}>
                <TableCell className="font-medium">{result.domain}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-red-600">登録済み</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{result.message}</TableCell>
              </TableRow>
            ))}
            
            {/* エラーのあるドメイン */}
            {errors.map((result) => (
              <TableRow key={result.domain}>
                <TableCell className="font-medium">{result.domain}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-amber-600">エラー</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{result.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
