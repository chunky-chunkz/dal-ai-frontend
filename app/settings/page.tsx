"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, RotateCcw, Brain, Zap, Shield, Database } from "lucide-react"
import Link from "next/link"

interface AISettings {
  // LLM Settings
  model: string
  temperature: number
  maxTokens: number
  
  // RAG Settings
  useRAG: boolean
  topK: number
  similarityThreshold: number
  
  // Memory Settings
  useMemory: boolean
  memoryDepth: number
  
  // Other Settings
  streamResponse: boolean
}

const DEFAULT_SETTINGS: AISettings = {
  model: "phi3",
  temperature: 0.2,
  maxTokens: 220,
  useRAG: true,
  topK: 5,
  similarityThreshold: 0.7,
  useMemory: true,
  memoryDepth: 10,
  streamResponse: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    try {
      localStorage.setItem('aiSettings', JSON.stringify(settings))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('aiSettings')
    setSaveStatus('idle')
  }

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KI Einstellungen
              </h1>
            </div>
            <Link href="/">
              <Button variant="outline">
                Zurück zum Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="llm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">LLM</span>
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">RAG</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Speicher</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Weitere</span>
            </TabsTrigger>
          </TabsList>

          {/* LLM Settings */}
          <TabsContent value="llm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  LLM Einstellungen
                </CardTitle>
                <CardDescription>
                  Konfigurieren Sie das Sprachmodell und dessen Parameter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model">Modell</Label>
                  <Select value={settings.model} onValueChange={(value) => updateSetting('model', value)}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phi3">Phi-3 Mini (Standard)</SelectItem>
                      <SelectItem value="llama3">Llama 3</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                      <SelectItem value="gemma">Gemma</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Wählen Sie das Sprachmodell für die Antwortgenerierung
                  </p>
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperatur</Label>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {settings.temperature.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[settings.temperature]}
                    onValueChange={([value]) => updateSetting('temperature', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Niedrigere Werte (0.1-0.3) = präziser und fokussierter<br/>
                    Höhere Werte (0.7-1.0) = kreativer und vielfältiger
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxTokens">Maximale Token</Label>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {settings.maxTokens}
                    </span>
                  </div>
                  <Slider
                    id="maxTokens"
                    min={50}
                    max={2000}
                    step={10}
                    value={[settings.maxTokens]}
                    onValueChange={([value]) => updateSetting('maxTokens', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Begrenzt die Länge der generierten Antworten (Standard: 220)
                  </p>
                </div>

                {/* Stream Response */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="streamResponse">Streaming aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Zeigt Antworten Wort für Wort in Echtzeit an
                    </p>
                  </div>
                  <Switch
                    id="streamResponse"
                    checked={settings.streamResponse}
                    onCheckedChange={(checked) => updateSetting('streamResponse', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAG Settings */}
          <TabsContent value="rag">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  RAG Einstellungen
                </CardTitle>
                <CardDescription>
                  Retrieval-Augmented Generation für dokumentbasierte Antworten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable RAG */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="useRAG">RAG aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Nutzt hochgeladene Dokumente für bessere Antworten
                    </p>
                  </div>
                  <Switch
                    id="useRAG"
                    checked={settings.useRAG}
                    onCheckedChange={(checked) => updateSetting('useRAG', checked)}
                  />
                </div>

                {/* Top K */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="topK">Top K Dokumente</Label>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {settings.topK}
                    </span>
                  </div>
                  <Slider
                    id="topK"
                    min={1}
                    max={10}
                    step={1}
                    value={[settings.topK]}
                    onValueChange={([value]) => updateSetting('topK', value)}
                    className="w-full"
                    disabled={!settings.useRAG}
                  />
                  <p className="text-sm text-muted-foreground">
                    Anzahl der relevantesten Dokumente, die für die Antwort verwendet werden
                  </p>
                </div>

                {/* Similarity Threshold */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="similarityThreshold">Ähnlichkeitsschwelle</Label>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {settings.similarityThreshold.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="similarityThreshold"
                    min={0.3}
                    max={0.95}
                    step={0.05}
                    value={[settings.similarityThreshold]}
                    onValueChange={([value]) => updateSetting('similarityThreshold', value)}
                    className="w-full"
                    disabled={!settings.useRAG}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimale Ähnlichkeit für relevante Dokumente (höher = strenger)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Settings */}
          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Speicher Einstellungen
                </CardTitle>
                <CardDescription>
                  Konversations-Speicher für kontextbezogene Antworten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable Memory */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="useMemory">Konversations-Speicher aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Erinnert sich an frühere Nachrichten im Gespräch
                    </p>
                  </div>
                  <Switch
                    id="useMemory"
                    checked={settings.useMemory}
                    onCheckedChange={(checked) => updateSetting('useMemory', checked)}
                  />
                </div>

                {/* Memory Depth */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="memoryDepth">Speichertiefe</Label>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {settings.memoryDepth}
                    </span>
                  </div>
                  <Slider
                    id="memoryDepth"
                    min={3}
                    max={20}
                    step={1}
                    value={[settings.memoryDepth]}
                    onValueChange={([value]) => updateSetting('memoryDepth', value)}
                    className="w-full"
                    disabled={!settings.useMemory}
                  />
                  <p className="text-sm text-muted-foreground">
                    Anzahl der vorherigen Nachrichten, die berücksichtigt werden
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Settings */}
          <TabsContent value="other">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Weitere Einstellungen
                </CardTitle>
                <CardDescription>
                  Zusätzliche Konfigurationsoptionen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-muted-foreground py-8">
                  Weitere Einstellungen werden in zukünftigen Versionen hinzugefügt
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Zurücksetzen
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Speichert...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Einstellungen speichern
                  </>
                )}
              </Button>
            </div>

            {/* Save Status Message */}
            {saveStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                saveStatus === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {saveStatus === 'success' 
                  ? '✓ Einstellungen erfolgreich gespeichert'
                  : '✗ Fehler beim Speichern der Einstellungen'}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
