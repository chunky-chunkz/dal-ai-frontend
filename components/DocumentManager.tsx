"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, Trash2, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface DocumentItem {
  id: string
  name: string
  uploadedAt: string
  chunkCount: number
}

interface UploadStatus {
  type: 'success' | 'error' | 'loading'
  message: string
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    setIsLoadingDocs(true)
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.documents) {
          setDocuments(data.documents)
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setIsLoadingDocs(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's a .txt file
    if (!file.name.endsWith('.txt')) {
      setUploadStatus({
        type: 'error',
        message: 'Bitte nur .txt Dateien hochladen'
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({
      type: 'loading',
      message: 'Dokument wird verarbeitet...'
    })

    try {
      // Read file content
      const content = await file.text()

      // Upload to backend
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          content: content
        })
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus({
          type: 'success',
          message: `✅ ${file.name} erfolgreich hochgeladen (${result.chunksCreated} Chunks, ${result.memoriesExtracted} Erinnerungen)`
        })
        // Reload documents list
        await loadDocuments()
        // Clear file input
        event.target.value = ''
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

  async function handleDeleteDocument(documentId: string) {
    if (!confirm('Dokument wirklich löschen?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: '🗑️ Dokument gelöscht'
        })
        await loadDocuments()
      } else {
        setUploadStatus({
          type: 'error',
          message: '❌ Löschen fehlgeschlagen'
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `❌ Fehler beim Löschen`
      })
    }
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
            Laden Sie .txt Dateien hoch. Die KI kann sich den Inhalt merken und darauf antworten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Datei auswählen (.txt)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt"
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
              {uploadStatus.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin flex-shrink-0 mt-0.5" />}
              {uploadStatus.type === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              {uploadStatus.type === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hochgeladene Dokumente
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDocuments}
              disabled={isLoadingDocs}
            >
              {isLoadingDocs ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Aktualisieren'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Keine Dokumente hochgeladen</p>
              <p className="text-sm mt-1">Laden Sie Ihr erstes Dokument hoch</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.chunkCount} Chunks • {new Date(doc.uploadedAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
