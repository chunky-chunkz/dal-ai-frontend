'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/button'

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't try to use theme until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return <ThemeToggleInner />
}

function ThemeToggleInner() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(isDark ? 'light' : 'dark')
  }

  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label={isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Theme wechseln</span>
    </Button>
  )
}
