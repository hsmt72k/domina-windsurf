import { NextResponse } from 'next/server'
import whois from 'whois'
import { promisify } from 'util'

// WHOISをPromise化
const lookupWhois = promisify<string, { timeout?: number }, string>(whois.lookup)

// 代替WHOIS API (HTTP経由)
async function fetchWhoisFromExternalApi(domain: string): Promise<string> {
  try {
    // 無料のWHOIS API (注: 実際のプロダクション環境では信頼性の高いサービスに変更することをお勧めします)
    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_demo_key&domainName=${domain}&outputFormat=JSON`)
    
    if (!response.ok) {
      throw new Error(`External WHOIS API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data.WhoisRecord?.rawText || JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('External WHOIS API error:', error)
    throw error
  }
}

export async function GET(request: Request) {
  // URLからクエリパラメータを取得
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return NextResponse.json(
      { error: 'ドメイン名が指定されていません' },
      { status: 400 }
    )
  }

  try {
    let whoisData: string
    
    // 最初に標準のWHOISライブラリを試す
    try {
      console.log(`Attempting WHOIS lookup for ${domain} using whois library`)
      whoisData = await lookupWhois(domain, { timeout: 10000 })
      console.log('WHOIS lookup successful with whois library')
    } catch (nativeError) {
      console.error(`Native WHOIS lookup failed for ${domain}:`, nativeError)
      
      // 標準ライブラリが失敗した場合、外部APIを試す
      console.log(`Attempting WHOIS lookup for ${domain} using external API`)
      whoisData = await fetchWhoisFromExternalApi(domain)
      console.log('WHOIS lookup successful with external API')
    }
    
    return NextResponse.json({ 
      domain,
      whoisData
    })
  } catch (error: unknown) {
    console.error(`WHOIS API error for ${domain}:`, error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `WHOIS情報の取得に失敗しました: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'WHOIS情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}
