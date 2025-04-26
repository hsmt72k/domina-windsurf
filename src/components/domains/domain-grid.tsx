import { DomainStatus } from "@/types/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhoisModal } from "./whois-modal";
import { Badge } from "@/components/ui/badge";

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
        <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
          <span>検索されたドメイン: {results.length}件</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              利用可能: {available.length}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
              <XCircle className="h-3.5 w-3.5 mr-1" />
              登録済み: {unavailable.length}
            </Badge>
            {errors.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                エラー: {errors.length}
              </Badge>
            )}
          </div>
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
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    利用可能
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{result.message}</TableCell>
              </TableRow>
            ))}
            
            {/* 利用不可能なドメイン */}
            {unavailable.map((result) => (
              <TableRow key={result.domain}>
                <TableCell className="font-medium">{result.domain}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    登録済み
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{result.message}</span>
                    <WhoisModal domain={result.domain} whoisData={result.whoisData} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {/* エラーのあるドメイン */}
            {errors.map((result) => (
              <TableRow key={result.domain}>
                <TableCell className="font-medium">{result.domain}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    エラー
                  </Badge>
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
