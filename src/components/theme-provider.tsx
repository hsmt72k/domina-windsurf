"use client"

import { useAtom } from "jotai"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { isDarkModeAtom } from "@/store/domain-store"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  attribute?: string
  disableTransitionOnChange?: boolean
}

const initialState: {
  theme: Theme
  setTheme: (theme: Theme) => void
} = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = false,
  attribute = "data-theme",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [, setIsDarkMode] = useAtom(isDarkModeAtom)
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  const applyTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    const root = window.document.documentElement

    if (disableTransitionOnChange) {
      root.classList.add("no-transitions")
    }

    if (attribute === "class") {
      root.classList.remove("light", "dark")
      if (newTheme !== "system") {
        root.classList.add(newTheme)
      }
    } else {
      if (newTheme === "system") {
        root.removeAttribute(attribute)
      } else {
        root.setAttribute(attribute, newTheme)
      }
    }

    if (disableTransitionOnChange) {
      setTimeout(() => {
        root.classList.remove("no-transitions")
      }, 0)
    }
  }, [disableTransitionOnChange, attribute])

  const setTheme = (newTheme: Theme) => {
    if (newTheme === "system" && enableSystem) {
      setIsDarkMode(
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
    } else {
      setIsDarkMode(newTheme === "dark")
    }
    applyTheme(newTheme)
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        setIsDarkMode(media.matches)
      }
    }

    // 初期テーマの適用
    if (theme === "system" && enableSystem) {
      setIsDarkMode(media.matches)
    } else {
      setIsDarkMode(theme === "dark")
    }
    applyTheme(theme)

    // システムテーマの変更を監視
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [theme, setIsDarkMode, enableSystem, applyTheme])

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
