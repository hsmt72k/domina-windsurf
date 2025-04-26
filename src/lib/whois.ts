import whois from 'whois';
import { promisify } from 'util';
import { checkDNS } from './dns';
import { DomainStatus } from '@/types/domain';

// WHOISをPromise化
const lookupWhois = promisify(whois.lookup);

// キャッシュ用のマップ
const cache = new Map<string, { status: DomainStatus, timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24時間

/**
 * WHOISを使ってドメインの可用性をチェック
 * 失敗した場合はDNSフォールバックを使用
 */
export async function checkDomainAvailability(domain: string): Promise<DomainStatus> {
  // キャッシュチェック
  const cached = cache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.status;
  }

  try {
    // WHOISクエリ試行
    const result = await lookupWhois(domain, { timeout: 5000 });
    
    // WHOISの結果を分析して利用可能かどうかを判断
    const available = isAvailableFromWhoisResult(result, domain);
    
    const status: DomainStatus = {
      domain,
      available,
      message: available ? "取得可能" : "登録済み"
    };
    
    // キャッシュに保存
    cache.set(domain, { status, timestamp: Date.now() });
    return status;
  } catch (error) {
    console.log(`WHOIS failed for ${domain}: ${error.message}`);
    
    // WHOISが失敗したらDNSフォールバック
    try {
      const dnsResult = await checkDNS(domain);
      const status: DomainStatus = {
        domain,
        available: !dnsResult.exists,
        message: !dnsResult.exists ? "取得可能（DNS確認）" : "登録済み（DNS確認）"
      };
      
      cache.set(domain, { status, timestamp: Date.now() });
      return status;
    } catch (dnsError) {
      // 両方失敗
      return {
        domain,
        available: false,
        error: true,
        message: "チェック失敗 - 後でもう一度お試しください"
      };
    }
  }
}

/**
 * WHOISの結果からドメインが利用可能かどうかを判断
 */
function isAvailableFromWhoisResult(result: string, domain: string): boolean {
  if (!result) return true;
  
  // 結果を小文字に変換
  const resultLower = result.toLowerCase();
  
  // 利用可能かどうかを示す一般的なフレーズのリスト
  const availablePhrases = [
    'no match',
    'not found',
    'no data found',
    'no entries found',
    'domain not found',
    'is available',
    'is free',
    'not registered',
    'no object found'
  ];
  
  // 登録済みかどうかを示す一般的なフレーズのリスト
  const takenPhrases = [
    'domain name:',
    'registrar:',
    'registrant',
    'creation date',
    'registered on',
    'registration date'
  ];
  
  // 利用可能なフレーズがあるかチェック
  for (const phrase of availablePhrases) {
    if (resultLower.includes(phrase)) {
      return true;
    }
  }
  
  // 登録済みフレーズがあるかチェック
  for (const phrase of takenPhrases) {
    if (resultLower.includes(phrase)) {
      return false;
    }
  }
  
  // TLDに応じた特殊処理
  const tld = domain.substring(domain.lastIndexOf('.'));
  
  // デフォルト: ドメイン名が結果に含まれていれば登録済みと判断
  return !resultLower.includes(domain.toLowerCase());
}

/**
 * 複数のドメインを一括チェック
 */
export async function bulkCheckDomains(baseName: string, tlds: string[]): Promise<DomainStatus[]> {
  // 同時に実行するリクエスト数を制限
  const MAX_CONCURRENT = 5;
  const results: DomainStatus[] = [];
  
  // バッチ処理でTLDをチェック
  for (let i = 0; i < tlds.length; i += MAX_CONCURRENT) {
    const batch = tlds.slice(i, i + MAX_CONCURRENT);
    const batchPromises = batch.map(tld => {
      const domain = `${baseName}${tld}`;
      return checkDomainAvailability(domain);
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}
