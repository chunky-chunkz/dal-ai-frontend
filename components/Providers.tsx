'use client'

import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dal-ai-theme">
      {children}
    </ThemeProvider>
  )
}
