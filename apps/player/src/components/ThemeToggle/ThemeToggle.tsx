'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { type ReactElement, useEffect, useState } from 'react'

export function ThemeToggle(): ReactElement | null {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      aria-pressed={theme === 'dark'}
      className="flex cursor-pointer items-center rounded-lg border border-gray-200 px-4 py-2 text-base transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}
