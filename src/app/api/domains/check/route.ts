import { NextResponse } from "next/server";
import { bulkCheckDomains } from "@/lib/whois";
import { apiSchema } from "@/schemas/domain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = apiSchema.parse(body);
    const { baseNames, tlds } = validatedData;
    
    // 結果を格納する配列
    const results = [];
    
    // ベース名とTLDの組み合わせをチェック
    for (const baseName of baseNames) {
      const batchResults = await bulkCheckDomains(baseName, tlds);
      results.push(...batchResults);
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json(
      { error: "ドメインの可用性チェックに失敗しました" },
      { status: 400 }
    );
  }
}
