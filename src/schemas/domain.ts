import { z } from "zod";

// 一般的なTLDのリスト
export const supportedTlds = [
  ".com", ".net", ".org", ".io", ".dev", ".app", 
  ".co", ".me", ".info", ".biz", ".xyz", ".jp", ".co.jp"
] as const;

// TLD型の定義
export type TLD = typeof supportedTlds[number];

export const domainBaseNameSchema = z
  .string()
  .min(1, "ドメイン名を入力してください")
  .max(63, "ドメイン名は63文字以内にしてください")
  .regex(/^[a-zA-Z0-9-]+$/, "英数字とハイフンのみ使用できます");

// 完全なドメイン名の検証スキーマ（example.comなど）
export const fullDomainNameSchema = z
  .string()
  .min(1, "ドメイン名を入力してください")
  .max(253, "ドメイン名は253文字以内にしてください")
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
    "有効なドメイン名を入力してください（例: example.com）"
  );

// ベース名をバリデーションするスキーマ
export const baseNamesSchema = z.array(domainBaseNameSchema).min(0);

// TLDをバリデーションするスキーマ
export const tldsSchema = z.array(z.enum(supportedTlds))
  .min(1, "少なくとも1つのTLDを選択してください");

// ドメイン名を直接入力するスキーマ
export const domainsSchema = z.array(fullDomainNameSchema).min(0);

// フォーム用の正確なスキーマ
export const formSchema = z.object({
  baseNames: baseNamesSchema,
  tlds: tldsSchema,
  domains: domainsSchema
});

// 単一ベース名 + 複数TLDの従来のスキーマ
export const checkDomainSchema = z.object({
  baseName: domainBaseNameSchema,
  tlds: tldsSchema
});

// API用のスキーマ
export const apiSchema = z.object({
  baseNames: baseNamesSchema,
  tlds: tldsSchema
});

export const domainSuggestionSchema = z.object({
  businessIdea: z.string().min(5, "ビジネスアイデアをより詳しく入力してください")
});

// フォーム用の型定義 - React Hook Form用に明示的に型を一致させる
export type FormSchemaType = z.infer<typeof formSchema>;

// フォームのデフォルト値
export const formDefaultValues: FormSchemaType = {
  baseNames: [],
  tlds: [".com", ".net", ".org"],
  domains: []
};
