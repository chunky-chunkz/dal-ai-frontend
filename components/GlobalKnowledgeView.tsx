"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Brain, RefreshCw, Database, Upload, CheckCircle2, AlertCircle } from "lucide-react"

interface GlobalMemory {
  id: string
  type: string
  key: string
  value: string
  confidence: number
  createdAt: string
  updatedAt: string
}

interface UserMemory {
  userId: string
  key: string
  value: string
  timestamp: string
  context: string
}

interface GlobalMemorySummary {
  byType: Record<string, number>
  totalFacts: number
}

interface UploadStatus {
  type: 'success' | 'error' | 'loading'
  message: string
}

export default function GlobalKnowledgeView() {
  const [memories, setMemories] = useState<GlobalMemory[]>([])
  const [userMemories, setUserMemories] = useState<UserMemory[]>([])
  const [summary, setSummary] = useState<GlobalMemorySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadGlobalKnowledge()
  }, [])

  async function loadGlobalKnowledge() {
    setIsLoading(true)
    try {
      // Load global knowledge from documents
      const globalResponse = await fetch('/api/memory/global')
      if (globalResponse.ok) {
        const globalResult = await globalResponse.json()
        setMemories(globalResult.data || [])
        setSummary(globalResult.summary)
      }

      // Load user memories
      const userResponse = await fetch('/api/memory/all-users')
      if (userResponse.ok) {
        const userResult = await userResponse.json()
        setUserMemories(userResult.data || [])
      }
    } catch (error) {
      console.error('Failed to load knowledge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's a .txt, .pdf or .docx file
    const isValidFile = file.name.endsWith('.txt') || 
                       file.name.toLowerCase().endsWith('.pdf') ||
                       file.name.toLowerCase().endsWith('.docx')
    if (!isValidFile) {
      setUploadStatus({
        type: 'error',
        message: 'Bitte nur .txt, .pdf oder .docx Dateien hochladen'
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({
      type: 'loading',
      message: 'Dokument wird verarbeitet und Fakten extrahiert...'
    })

    try {
      // Read file content
      let content: string
      if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')) {
        // Read PDF as base64
        const arrayBuffer = await file.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        content = base64
      } else {
        // Read text file
        content = await file.text()
      }

      // Upload to backend (without userId - will be stored as global-knowledge)
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          content: content
          // No userId - will automatically use 'global-knowledge'
        })
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus({
          type: 'success',
          message: `✅ ${file.name} erfolgreich hochgeladen! ${result.memoriesExtracted} Fakten extrahiert.`
        })
        // Reload global knowledge to show new facts
        await loadGlobalKnowledge()
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: `❌ Fehler: ${result.error || 'Unbekannter Fehler'}`
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `❌ Upload fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'fact': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'profile_fact': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'preference': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'experience': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'fact': 'Fakt',
      'profile_fact': 'Profil',
      'preference': 'Präferenz',
      'experience': 'Erfahrung'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-4">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Dokument hochladen
          </CardTitle>
          <CardDescription>
            Laden Sie .txt, .pdf oder .docx Dateien hoch. Fakten werden automatisch extrahiert und für alle Benutzer verfügbar gemacht.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Datei auswählen (.txt, .pdf oder .docx)</Label>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>

          {uploadStatus && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 ${
                uploadStatus.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : uploadStatus.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}
            >
              {uploadStatus.type === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              {uploadStatus.type === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              {uploadStatus.type === 'loading' && <Loader2 className="h-5 w-5 flex-shrink-0 mt-0.5 animate-spin" />}
              <p className="text-sm">{uploadStatus.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Globale Wissensdatenbank</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadGlobalKnowledge}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Aktualisieren</span>
            </Button>
          </div>
          <CardDescription>
            Aus hochgeladenen Dokumenten extrahierte Informationen (für alle Benutzer verfügbar)
          </CardDescription>
        </CardHeader>
        
        {/* Summary */}
        {summary && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">{summary.totalFacts} Fakten gespeichert</span>
              </div>
              {Object.entries(summary.byType).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="font-normal">
                  {getTypeLabel(type)}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Memories List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gespeicherte Informationen (Dokumente)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Informationen in der Wissensdatenbank.</p>
              <p className="text-sm mt-1">Laden Sie Dokumente hoch, um Fakten zu extrahieren.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeColor(memory.type)}>
                            {getTypeLabel(memory.type)}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {(memory.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-muted-foreground">
                            {memory.key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-base font-semibold">{memory.value}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Hinzugefügt: {new Date(memory.createdAt).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* User Memories List */}
      {userMemories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Benutzerspezifische Informationen</CardTitle>
            <CardDescription>
              Fakten aus Unterhaltungen mit Benutzern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {userMemories.map((memory, index) => (
                  <div
                    key={`${memory.userId}-${memory.key}-${index}`}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Benutzer: {memory.userId}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-muted-foreground">
                            {memory.key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-base font-semibold">{memory.value}</p>
                          {memory.context && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              Kontext: &quot;{memory.context}&quot;
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Hinzugefügt: {new Date(memory.timestamp).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
