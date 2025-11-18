'use client'

import { ThemeProvider } from './ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="dal-ai-theme">
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}
