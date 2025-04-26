import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数からAPIキーを取得
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return apiKey;
};

// Gemini APIの初期化
export const initGemini = () => {
  try {
    const apiKey = getApiKey();
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
    throw error;
  }
};

// ドメイン名の提案を取得
export async function generateDomainSuggestions(businessIdea: string, count: number = 5) {
  try {
    const genAI = initGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      あなたはドメイン名提案の専門家です。
      以下のビジネスアイデアに適したドメイン名を${count}個提案してください。

      ビジネスアイデア: "${businessIdea}"

      条件:
      - 覚えやすく、入力しやすいこと
      - 一般的なTLD（.com, .net, .org, .ioなど）を使用すること
      - 短く、シンプルであること
      - ブランド名として使えること
      - 商標的に問題ないと思われる名前であること

      フォーマット:
      - ドメイン名のみをリストで返してください（説明や理由は不要）
      - example.com のような形式で返してください（TLDを含む）
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // 返ってきたテキストからドメイン名だけを抽出
    const domains = extractDomainsFromText(text);
    
    return domains.slice(0, count);
  } catch (error) {
    console.error("Error generating domain suggestions:", error);
    throw new Error("ドメイン名の提案中にエラーが発生しました");
  }
}

// テキストからドメイン名を抽出する関数
function extractDomainsFromText(text: string): string[] {
  // ドメイン名のパターンにマッチする正規表現
  const domainRegex = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/g;
  
  // 行ごとに分割して処理
  const lines = text.split('\n');
  const domains: string[] = [];
  
  for (const line of lines) {
    // 行からドメイン名を抽出
    const trimmedLine = line.trim().replace(/^[-*•]\s*/, '');
    
    // 行全体がドメイン名の場合
    if (trimmedLine.match(domainRegex)) {
      domains.push(trimmedLine);
      continue;
    }
    
    // 行の中からドメイン名を抽出
    const matches = trimmedLine.match(domainRegex);
    if (matches) {
      domains.push(...matches);
    }
  }
  
  // 重複を除去して返す
  return [...new Set(domains)];
}
