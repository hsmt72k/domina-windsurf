import { NextResponse } from "next/server";
import { domainSuggestionSchema } from "@/schemas/domain";
import { generateDomainSuggestions } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    // リクエストボディの解析
    const body = await request.json();
    
    // Zodによるバリデーション
    const validatedData = domainSuggestionSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "無効なリクエスト", issues: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    const { businessIdea } = validatedData.data;
    
    // Gemini APIを使用してドメイン名の提案を取得
    const suggestions = await generateDomainSuggestions(businessIdea, 5);
    
    // 結果の返却
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Domain suggestion error:", error);
    return NextResponse.json(
      { error: "ドメイン名の提案中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
