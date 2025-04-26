# Domina - ドメイン名チェックツール

複数のドメイン名を一括でチェックできる Web アプリケーションです。

## 機能

- 単一のベースドメイン名に対して、複数のTLD（.com, .net, .jpなど）を同時にチェック
- WHOISを使用した正確なドメイン可用性チェック
- DNSフォールバック機能による信頼性の高い結果
- Gemini AIを活用したドメイン名提案機能

## 技術スタック

- **フロントエンド**: [Next.js](https://nextjs.org)（App Router）, [TypeScript](https://www.typescriptlang.org/), [shadcn/ui](https://ui.shadcn.com/)
- **バックエンド**: Next.js API Routes
- **データ検証**: [Zod](https://zod.dev)
- **フォーム管理**: [React Hook Form](https://react-hook-form.com)
- **AI統合**: [Google Gemini API](https://ai.google.dev/)
- **パッケージ管理**: [Bun](https://bun.sh)

## 始め方

1. リポジトリをクローン:
```bash
git clone https://github.com/yourusername/domina-windsurf.git
cd domina-windsurf
```

2. 依存関係をインストール:
```bash
bun install
```

3. 環境変数を設定:
`.env.local`ファイルを作成し、必要なAPIキーを設定します:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. 開発サーバーを起動:
```bash
bun run dev
```

5. ブラウザで[http://localhost:3000](http://localhost:3000)にアクセス

## 本番環境デプロイ

### Vercelでのデプロイ

このアプリケーションはVercelに最適化されています:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdomina-windsurf)

1. 環境変数`GEMINI_API_KEY`をVercelのプロジェクト設定で追加
2. 自動デプロイを有効にすることで、mainブランチへのプッシュ時に自動的にデプロイされます

### その他のホスティングプラットフォーム

標準的なNext.jsアプリケーションとして以下の手順でデプロイできます:

```bash
bun run build
bun run start
```

詳細は[Next.jsデプロイドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MITライセンスの下で配布されています。
