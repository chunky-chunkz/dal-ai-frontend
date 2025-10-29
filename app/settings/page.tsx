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
import { MemoryPanel } from "@/src/components/MemoryPanel"

interface AISettings {
  // LLM Settings
  model: string
  temperature: number
  maxTokens: number
  
  // RAG Settings
  useRAG: boolean
  topK: number
  similarityThreshold: number
  
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
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Erinnerungen</span>
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
                      {/* Kleine & Schnelle Modelle */}
                      <SelectItem value="phi3">Phi-3 Mini (Standard) 🚀</SelectItem>
                      <SelectItem value="phi3:mini">Phi-3 Mini (Kompakt)</SelectItem>
                      <SelectItem value="phi3:medium">Phi-3 Medium (14B)</SelectItem>
                      
                      {/* Meta Llama Familie */}
                      <SelectItem value="llama3.2">Llama 3.2 (Neueste) ✨</SelectItem>
                      <SelectItem value="llama3.2:90b">Llama 3.2 90B (Premium) 🌟</SelectItem>
                      <SelectItem value="llama3.1">Llama 3.1</SelectItem>
                      <SelectItem value="llama3.1:70b">Llama 3.1 70B (Gross) 💎</SelectItem>
                      <SelectItem value="llama3">Llama 3</SelectItem>
                      
                      {/* Mistral Familie */}
                      <SelectItem value="mistral">Mistral 7B 💡</SelectItem>
                      <SelectItem value="mistral-nemo">Mistral Nemo 12B</SelectItem>
                      <SelectItem value="mixtral">Mixtral 8x7B (47B) 🔥</SelectItem>
                      <SelectItem value="mixtral:8x22b">Mixtral 8x22B (141B) 🚀</SelectItem>
                      
                      {/* Spezialisierte Modelle */}
                      <SelectItem value="codellama">CodeLlama (Code) 💻</SelectItem>
                      <SelectItem value="codellama:70b">CodeLlama 70B (Code Pro) 💻💎</SelectItem>
                      <SelectItem value="deepseek-coder">DeepSeek Coder (Code) 🧑‍💻</SelectItem>
                      <SelectItem value="deepseek-coder:33b">DeepSeek Coder 33B 🧑‍💻💎</SelectItem>
                      
                      {/* Weitere Top-Modelle */}
                      <SelectItem value="gemma">Gemma 2B 🎯</SelectItem>
                      <SelectItem value="gemma2:27b">Gemma 2 27B (Gross) 💎</SelectItem>
                      <SelectItem value="qwen2">Qwen 2 🌟</SelectItem>
                      <SelectItem value="qwen2:72b">Qwen 2 72B (Premium) 💎</SelectItem>
                      <SelectItem value="command-r">Command R (Cohere)</SelectItem>
                      <SelectItem value="command-r-plus">Command R+ (Cohere Premium) 👑</SelectItem>
                      
                      {/* Spezial-Modelle */}
                      <SelectItem value="wizardlm2">WizardLM 2 🧙</SelectItem>
                      <SelectItem value="solar">Solar 10.7B ☀️</SelectItem>
                      <SelectItem value="nous-hermes2">Nous Hermes 2 🔮</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Wählen Sie das Sprachmodell für die Antwortgenerierung</p>
                    {settings.model === 'phi3' && (
                      <p className="text-blue-600 dark:text-blue-400">
                        🚀 <strong>Empfohlen:</strong> Schnell, effizient, gut für allgemeine Fragen
                      </p>
                    )}
                    {settings.model === 'llama3.2' && (
                      <p className="text-green-600 dark:text-green-400">
                        ✨ <strong>Neueste Version:</strong> Verbesserte Genauigkeit und Kontext
                      </p>
                    )}
                    {(settings.model === 'llama3.2:90b' || settings.model === 'llama3.1:70b' || settings.model === 'qwen2:72b') && (
                      <p className="text-purple-600 dark:text-purple-400">
                        💎 <strong>Premium-Modell:</strong> Höchste Qualität, beste Antworten, benötigt mehr Ressourcen
                      </p>
                    )}
                    {(settings.model === 'mixtral' || settings.model === 'mixtral:8x22b') && (
                      <p className="text-orange-600 dark:text-orange-400">
                        🔥 <strong>Mixtral Expert:</strong> Mixture of Experts, sehr leistungsfähig
                      </p>
                    )}
                    {(settings.model === 'codellama' || settings.model === 'codellama:70b' || settings.model === 'deepseek-coder' || settings.model === 'deepseek-coder:33b') && (
                      <p className="text-indigo-600 dark:text-indigo-400">
                        💻 <strong>Code-Spezialist:</strong> Optimiert für Programmierung und technische Fragen
                      </p>
                    )}
                    {settings.model === 'mistral' && (
                      <p className="text-purple-600 dark:text-purple-400">
                        💡 <strong>Kreativ:</strong> Gut für längere, detaillierte Antworten
                      </p>
                    )}
                    {settings.model === 'gemma' && (
                      <p className="text-pink-600 dark:text-pink-400">
                        🎯 <strong>Kompakt:</strong> Schnell, für einfache Fragen optimal
                      </p>
                    )}
                    {(settings.model === 'command-r' || settings.model === 'command-r-plus') && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        👑 <strong>Cohere:</strong> Exzellent für RAG und Konversationen
                      </p>
                    )}
                  </div>
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

          {/* Memory Management */}
          <TabsContent value="memory">
            <div className="space-y-6">
              <MemoryPanel 
                onMemoryDeleted={(id) => console.log('Memory deleted:', id)}
                onError={(error) => console.error('Memory error:', error)}
              />
            </div>
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
