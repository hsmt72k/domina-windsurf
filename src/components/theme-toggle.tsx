"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useAtom } from "jotai"
import { isDarkModeAtom } from "@/store/domain-store"

interface ThemeToggleProps {
  isHeaderTransparent?: boolean
}

export function ThemeToggle({ isHeaderTransparent = false }: ThemeToggleProps) {
  const { setTheme } = useTheme()
  const [isDarkMode] = useAtom(isDarkModeAtom)
  const handleRef = React.useRef<HTMLDivElement>(null)
  
  // UseEffectでスイッチハンドルのスタイルを直接操作
  React.useEffect(() => {
    const handle = handleRef.current
    if (!handle) return
    
    handle.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    handle.style.backgroundColor = isDarkMode ? "#1F2937" : "#FFFFFF"
    
    // サムの位置をアニメーションで変更
    setTimeout(() => {
      handle.style.transform = isDarkMode ? "translateX(28px)" : "translateX(0px)"
    }, 0)
  }, [isDarkMode])

  const handleThemeChange = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <div 
      className="relative inline-block w-[56px] h-[28px] rounded-full cursor-pointer"
      style={{
        backgroundColor: isHeaderTransparent
          ? "rgba(255, 255, 255, 0.2)"
          : isDarkMode
            ? "rgb(55, 65, 81)"
            : "rgb(229, 231, 235)",
        transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
      onClick={handleThemeChange}
      role="switch"
      aria-checked={isDarkMode}
    >
      {/* サム */}
      <div
        ref={handleRef}
        className="absolute top-[2px] left-[2px] w-[24px] h-[24px] rounded-full flex items-center justify-center shadow-sm"
      >
        {isDarkMode ? (
          <Moon className="h-3.5 w-3.5 text-gray-300" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-gray-500" />
        )}
      </div>
      
      {/* 非アクティブアイコン */}
      <div
        className="absolute"
        style={{
          top: "7px",
          [isDarkMode ? "left" : "right"]: "7px",
          opacity: 0.3,
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {isDarkMode ? (
          <Sun className="h-3.5 w-3.5 text-gray-300" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-gray-500" />
        )}
      </div>
    </div>
  )
}
