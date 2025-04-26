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
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // WHOISデータの取得
  const fetchWhoisData = async () => {
    if (whoisData) return // 既にデータがある場合は何もしない

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/domains/whois?domain=${encodeURIComponent(domain)}`
      )

      if (!response.ok) {
        throw new Error('WHOIS情報の取得に失敗しました')
      }

      const data = await response.json()
      setWhoisData(data.whoisData)
    } catch (error) {
      console.error('Error fetching WHOIS data:', error)
      setWhoisData('WHOIS情報の取得中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  // モーダルが開かれたときにWHOISデータを取得
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !whoisData) {
      fetchWhoisData()
    }
  }

  // WHOIS情報を整形して表示
  const formatWhoisData = (data: string) => {
    // WHOIS情報のラベルを日本語に変換するマッピング
    const labelTranslations: Record<string, string> = {
      'Domain Name': 'ドメイン名',
      'Registry Domain ID': '登録ドメイン ID',
      Registrar: '登録事業者',
      'Registrar URL': '登録事業者 URL',
      Registrant: '登録者',
      'Registrant Name': '登録者名',
      'Registrant Organization': '登録組織',
      Admin: '管理者',
      'Admin Name': '管理者名',
      'Admin Organization': '管理者組織',
      'Admin Email': '管理者メール',
      'Creation Date': '作成日',
      'Updated Date': '更新日',
      'Registry Expiry Date': '有効期限',
      'Name Server': 'ネームサーバー',
      DNSSEC: 'DNSSEC',
      'Domain Status': 'ドメイン状態',
      'WHOIS Server': 'WHOISサーバー',
      'Referral URL': '参照URL',
      'URL of the ICANN WHOIS': 'ICANN WHOIS URL',
      'Last update of WHOIS database': 'WHOIS DB 最終更新日',
    }

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
        // キーを日本語に変換（部分一致による変換）
        let translatedKey = key.trim()
        for (const [engLabel, jpLabel] of Object.entries(labelTranslations)) {
          if (translatedKey.includes(engLabel)) {
            translatedKey = jpLabel
            break
          }
        }

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <InfoIcon className="h-4 w-4 mr-1" />
          WHOIS 情報
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{domain} のWHOIS情報</DialogTitle>
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
              WHOIS情報が見つかりませんでした
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
