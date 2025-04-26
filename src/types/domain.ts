export interface DomainStatus {
  domain: string;
  available: boolean;
  message: string;
  error?: boolean;
}

export interface DomainCheckResult {
  results: DomainStatus[];
}

export interface TLDOption {
  value: string;
  label: string;
}
