import { z } from "zod";

// 一般的なTLDのリスト
export const supportedTlds = [
  ".com", ".net", ".org", ".io", ".dev", ".app", 
  ".co", ".me", ".info", ".biz", ".xyz", ".jp"
] as const;

export const domainBaseNameSchema = z
  .string()
  .min(1, "ドメイン名を入力してください")
  .max(63, "ドメイン名は63文字以内にしてください")
  .regex(/^[a-zA-Z0-9-]+$/, "英数字とハイフンのみ使用できます");

export const checkDomainSchema = z.object({
  baseName: domainBaseNameSchema,
  tlds: z.array(z.enum(supportedTlds)).min(1, "少なくとも1つのTLDを選択してください")
});

export const domainSuggestionSchema = z.object({
  businessIdea: z.string().min(5, "ビジネスアイデアをより詳しく入力してください")
});
