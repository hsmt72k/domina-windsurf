import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'
import { useState } from 'react'

interface WhoisModalProps {
  domain: string
  whoisData?: string
}

export function WhoisModal({
  domain,
  whoisData: initialWhoisData,
}: WhoisModalProps) {
  const [whoisData, setWhoisData] = useState<string | null>(
    initialWhoisData || null
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // WHOISデータの取得
  const fetchWhoisData = async () => {
    if (whoisData) return // 既にデータがある場合は何もしない

    setIsLoading(true)
    try {
      console.log(`Fetching WHOIS data for domain: ${domain}`)
      const response = await fetch(
        `/api/domains/whois?domain=${encodeURIComponent(domain)}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('WHOIS API error response:', errorData)
        throw new Error(`WHOIS 情報の取得に失敗しました: ${errorData.error || response.status}`)
      }

      const data = await response.json()
      console.log('WHOIS data received:', data)
      setWhoisData(data.whoisData || 'WHOIS情報が空です。サーバー側の設定を確認してください。')
    } catch (error) {
      console.error('Error fetching WHOIS data:', error)
      setWhoisData(`WHOIS 情報の取得中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // モーダルが開かれたときにWHOISデータを取得
  const handleOpenChange = (open: boolean) => {
    if (open && !whoisData) {
      fetchWhoisData()
    }
  }

  // WHOIS情報を整形して表示
  const formatWhoisData = (data: string) => {
    // ここで必要に応じてWHOIS情報を整形する
    return data.split('\n').map((line, index) => {
      // キーと値に分割
      const [key, ...values] = line.split(':')
      const value = values.join(':')

      // 重要な情報（登録者・有効期限など）を強調表示
      const isImportant =
        key &&
        [
          'Registrar',
          'Registrant',
          'Creation Date',
          'Updated Date',
          'Registry Expiry Date',
          'Name Server',
          'Domain Status',
        ].some((k) => key.trim().includes(k))

      if (key && value) {
        // 英語表示に統一（ラベル翻訳を無効化）
        const translatedKey = key.trim()

        return (
          <div
            key={index}
            className={`py-1 ${isImportant ? 'font-semibold' : ''}`}
          >
            <span className="text-muted-foreground">{translatedKey}:</span>{' '}
            <span>{value.trim()}</span>
          </div>
        )
      }
      return <div key={index}>{line}</div>
    })
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:cursor-pointer">
          <InfoIcon className="h-4 w-4 mr-1" />
          WHOIS 情報
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{domain} の WHOIS情報</DialogTitle>
          <DialogDescription>
            ドメイン登録情報の詳細（登録者、期限、ネームサーバーなど）
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : whoisData ? (
            <div className="font-mono text-sm whitespace-pre-wrap">
              {formatWhoisData(whoisData)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              WHOIS 情報が見つかりませんでした
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
