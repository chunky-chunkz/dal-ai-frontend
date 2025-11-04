"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import LoginButton from "@/components/LoginButton"
import { MemoryStats } from "@/components/MemoryStats"

export default function MemoryStatsPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Chat
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Memory-Statistiken
              </h1>
            </div>
            <LoginButton />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Überwachung und Analyse der Memory-System-Performance
              </p>
            </div>
            <MemoryStats />
          </div>
        </div>
      </div>
    </div>
  )
}
