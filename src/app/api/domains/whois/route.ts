import { NextResponse } from 'next/server'
import whois from 'whois'
import { promisify } from 'util'

// WHOISをPromise化
const lookupWhois = promisify<string, { timeout?: number }, string>(whois.lookup)

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
    // WHOISクエリを実行
    const whoisData = await lookupWhois(domain, { timeout: 10000 })
    
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
