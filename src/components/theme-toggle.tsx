"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { isDarkModeAtom } from "@/store/domain-store"

interface ThemeToggleProps {
  isHeaderTransparent?: boolean
}

export function ThemeToggle({ isHeaderTransparent = false }: ThemeToggleProps) {
  const { setTheme } = useTheme()
  const [isDarkMode] = useAtom(isDarkModeAtom)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const newTheme = isDarkMode ? "light" : "dark"
        setTheme(newTheme)
      }}
      className={`hover:cursor-pointer transition-all rounded-full ${
        isHeaderTransparent
          ? "bg-white/20 backdrop-blur-sm dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-800/50 text-white dark:text-gray-200 shadow-sm"
          : "bg-transparent hover:bg-gray-200/80 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300"
      }`}
      title={isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
    >
      <Sun className={`h-5 w-5 ${isDarkMode ? "hidden" : "block"}`} />
      <Moon className={`h-5 w-5 ${isDarkMode ? "block" : "hidden"}`} />
      <span className="sr-only">テーマ切替</span>
    </Button>
  )
}
