declare module 'dns2' {
  export interface Question {
    name: string;
    type: string;
  }

  export interface Answer {
    name: string;
    type: string;
    class: string;
    ttl: number;
    address?: string;
    data?: string;
    exchange?: string;
    priority?: number;
  }

  export interface Authority {
    name: string;
    type: string;
    class: string;
    ttl: number;
    data?: string;
  }

  export interface Additional {
    name: string;
    type: string;
    class: string;
    ttl: number;
    data?: string;
  }

  export interface DNSResponse {
    answers: Answer[];
    questions: Question[];
    authorities: Authority[];
    additionals: Additional[];
  }

  export function query(options: {
    questions: Question[];
  }): Promise<DNSResponse>;

  export class Packet {}
}
