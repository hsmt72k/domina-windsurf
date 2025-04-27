import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Noto_Sans_JP } from 'next/font/google'
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

// ヘッディングや強調テキスト用のモダンで洗練されたフォント
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// 本文用の読みやすいフォント
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: "Domina - ドメイン名チェックツール",
  description: "複数のドメイン名を一括でチェックできるツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} ${notoSansJP.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
