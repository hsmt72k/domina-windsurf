import { NextResponse } from "next/server";
import { checkDomainSchema } from "@/schemas/domain";
import { bulkCheckDomains } from "@/lib/whois";
import { DomainStatus } from "@/types/domain";

export async function POST(request: Request) {
  try {
    // リクエストボディの解析
    const body = await request.json();
    
    // Zodによるバリデーション
    const validatedData = checkDomainSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "無効なリクエスト", issues: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    const { baseName, tlds } = validatedData.data;
    
    // 複数ドメインの一括チェック
    const results: DomainStatus[] = await bulkCheckDomains(baseName, tlds);
    
    // 結果の返却
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json(
      { error: "ドメインチェック処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
