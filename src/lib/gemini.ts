import { GoogleGenerativeAI } from '@google/generative-ai'

// 環境変数からAPIキーを取得
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }
  return apiKey
}

// Gemini APIの初期化
export const initGemini = () => {
  try {
    const apiKey = getApiKey()
    return new GoogleGenerativeAI(apiKey)
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error)
    throw error
  }
}

// ドメイン名の提案を取得
export async function generateDomainSuggestions(
  businessIdea: string,
  count: number = 5
) {
  try {
    const genAI = initGemini()
    // より詳細な生成が必要なので、Gemini-1.5-proモデルを使用
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
      あなたは高品質なドメイン名を提案する専門家です。
      以下のビジネスアイデアに最適なドメイン名を${count}個提案してください。

      ビジネスアイデア: "${businessIdea}"

      具体的な要件:
      1. 必ずビジネスアイデアの内容を明確に表すドメイン名を提案すること
      2. 複数の単語を組み合わせた、意味のある造語を作ること（例: e + Cook + Class = eCookClass）
      3. 覚えやすく、入力しやすいこと
      4. Cookだけ、Onlineだけといった単一の単語や、意味の薄い一般的な単語の組み合わせは避けること
      5. 一般的なTLD（.com, .net, .org, .ioなど）を使用すること

      ドメイン名のパターン例（料理教室の場合）:
      - 良い例: eCookClass.com, OnlineCooking.net, LearnToCook.org, MasterChefOnline.com, VirtualChef.academy
      - 悪い例: cookshare.com（一般的すぎる）, tastyclass.com（関連性が弱い）, culinaryschool.com（ありきたり）

      フォーマット:
      - 必ず以下のようなドメイン名だけを返してください:
        example.com
        example.net
        example.org
      - 番号や箇条書き記号は使わないでください
      - 説明や理由は不要です
      - ${count}個のドメイン名を提案してください
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    console.log('Gemini API response:', text)

    // 返ってきたテキストからドメイン名だけを抽出
    const domains = extractDomainsFromText(text)

    if (domains.length === 0) {
      // ドメインが抽出できなかった場合のフォールバック
      console.error('Failed to extract domains from response:', text)
      return ['example.com', 'example.net', 'example.org'].slice(0, count)
    }

    return domains.slice(0, count)
  } catch (error) {
    console.error('Error generating domain suggestions:', error)
    throw new Error('ドメイン名の提案中にエラーが発生しました')
  }
}

// テキストからドメイン名を抽出する関数
function extractDomainsFromText(text: string): string[] {
  // ドメイン名のパターンにマッチする正規表現
  const domainRegex = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/g

  // 行ごとに分割して処理
  const lines = text.split('\n')
  const domains: string[] = []

  for (const line of lines) {
    // 行からドメイン名を抽出
    const trimmedLine = line
      .trim()
      .replace(/^[-*•]\s*/, '') // 箇条書き記号を削除
      .replace(/^\d+\.\s*/, '') // 番号を削除
      .replace(/^[- ] /, '') // スペース記号を削除

    // 行全体がドメイン名の場合
    if (trimmedLine.match(domainRegex)) {
      domains.push(trimmedLine)
      continue
    }

    // 行の中からドメイン名を抽出
    const matches = trimmedLine.match(domainRegex)
    if (matches) {
      domains.push(...matches)
    }
  }

  // 重複を除去して返す
  return [...new Set(domains)]
}
