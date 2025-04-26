import * as dns from 'dns2';

interface DNSResult {
  exists: boolean;
  records?: any[];
}

/**
 * DNSを使用してドメインの存在確認を行う
 * WHOISが失敗した場合のフォールバックメカニズム
 */
export async function checkDNS(domain: string): Promise<DNSResult> {
  const resolver = new dns.Packet();
  const recordTypes = ['A', 'MX', 'TXT'];
  
  try {
    // 複数のレコードタイプを確認
    for (const type of recordTypes) {
      const response = await dns.query({
        questions: [{
          name: domain,
          type: type,
        }],
      });

      // 有効なレコードが存在すれば、ドメインは登録済み
      if (response.answers && response.answers.length > 0) {
        return {
          exists: true,
          records: response.answers
        };
      }
    }
    
    // レコードが見つからなければ、ドメインは未登録
    return { exists: false };
  } catch (error) {
    // DNS解決エラー - 通常はNXDOMAIN (存在しない)
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return { exists: false };
    }
    
    // その他のエラーの場合は例外を投げる
    throw error;
  }
}
