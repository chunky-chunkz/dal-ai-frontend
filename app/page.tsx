"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles, Zap, Brain, Menu, Settings, RotateCcw } from "lucide-react"
import LoginButton from "@/components/LoginButton"
import MobileNavigation from "@/components/MobileNavigation"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  canRetry?: boolean
  originalQuestion?: string
  retryCount?: number
}

// Helper function for consistent time formatting (avoids hydration issues)
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function AIToolFrontend() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Function to clear chat messages on logout
  const handleLogout = () => {
    console.log('🗑️ Clearing chat messages due to logout');
    setCurrentUser(null);
    setMessages([
      {
        id: "1",
        content: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  // Function to handle user login
  const handleAuthChange = (user: any) => {
    if (user) {
      console.log('✅ User logged in:', user.displayName || user.name || user.email);
      setCurrentUser(user.displayName || user.name || user.email);
    } else {
      console.log('❌ User logged out');
      setCurrentUser(null);
    }
  };

  // Auto-scroll chat area to bottom when new messages are added
  const scrollToBottom = () => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      // Find the viewport element within ScrollArea
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSendMessage = async (question?: string, isRetry: boolean = false, retryCount: number = 1) => {
    const messageText = question || inputValue.trim()
    if (!messageText) return

    // Only add user message if it's not a retry
    if (!isRetry) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageText,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
    }
    
    setIsLoading(true)

    // Make real API call via Next.js API route
    try {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: messageText,
          sessionId: currentUser || 'anonymous',
          retry: isRetry,
          attempt: retryCount
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer || "Entschuldigung, ich konnte Ihre Frage nicht beantworten.",
        sender: "ai",
        timestamp: new Date(),
        canRetry: true,
        originalQuestion: messageText,
        retryCount: retryCount
      }
      
      if (isRetry) {
        // Replace the last AI message with the new retry response
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastAiIndex = newMessages.length - 1
          if (lastAiIndex >= 0 && newMessages[lastAiIndex].sender === 'ai') {
            newMessages[lastAiIndex] = aiMessage
          } else {
            newMessages.push(aiMessage)
          }
          return newMessages
        })
      } else {
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error calling API:', error)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Es tut mir leid, es gab einen technischen Fehler. Bitte versuchen Sie es später erneut.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async (originalQuestion: string, currentRetryCount: number) => {
    await handleSendMessage(originalQuestion, true, currentRetryCount + 1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background mobile-optimized">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 mobile-header mobile-safe-top">
        <div className="container mx-auto px-4 py-4 mobile-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center logo">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground mobile-heading-3">KI-Assistent</h1>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" size="sm" className="mobile-touchable">
                <Sparkles className="w-4 h-4 mr-2" />
                KI-Features
              </Button>
              <Button variant="ghost" size="sm" className="mobile-touchable">
                <Zap className="w-4 h-4 mr-2" />
                Modelle
              </Button>
              <Button variant="ghost" size="sm" className="mobile-touchable">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
              <LoginButton 
                className="ml-2" 
                onLogout={handleLogout}
                onAuthChange={handleAuthChange}
              />
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <LoginButton 
                className="text-xs px-2 py-1" 
                onLogout={handleLogout}
                onAuthChange={handleAuthChange}
              />
              <MobileNavigation 
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl mobile-main mobile-safe-bottom">
        <div className="grid gap-6 mobile-gap-large">
          {/* Welcome Section */}
          <div className="text-center space-y-4 mobile-welcome">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mobile-badge">
              <Sparkles className="w-4 h-4" />
              Powered by Ollama KI
            </div>
            <h2 className="text-3xl font-bold text-foreground text-balance mobile-heading-1">Ihr intelligenter KI-Assistent</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty mobile-body">
              Erleben Sie die Kraft der KI mit unserem intuitiven Chat-Interface. Stellen Sie Fragen, erhalten Sie Einblicke und entdecken Sie neue Möglichkeiten.
            </p>
          </div>

          {/* Chat Interface */}
          <Card className="w-full max-w-4xl mx-auto mobile-chat-card mobile-card">
            <CardHeader className="pb-4 mobile-chat-header">
              <CardTitle className="flex items-center gap-2 mobile-heading-3">
                <Bot className="w-5 h-5 text-primary" />
                Chat mit KI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mobile-chat-content">
              {/* Messages */}
              <ScrollArea className="h-96 w-full pr-4 mobile-messages-area mobile-scroll-area" ref={scrollAreaRef}>
                <div className="space-y-4 mobile-gap-medium">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 mobile-message ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "ai" && (
                        <Avatar className="w-8 h-8 bg-primary mobile-avatar">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 mobile-message-content ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed mobile-body">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70 mobile-message-time mobile-tiny">
                            {isClient ? formatTime(message.timestamp) : "--:--"}
                            {message.retryCount && message.retryCount > 1 && (
                              <span className="ml-2 px-1 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
                                Versuch #{message.retryCount}
                              </span>
                            )}
                          </span>
                          {message.sender === "ai" && message.canRetry && message.originalQuestion && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetry(message.originalQuestion!, message.retryCount || 1)}
                              disabled={isLoading}
                              className="h-6 px-2 text-xs opacity-70 hover:opacity-100 mobile-retry-button mobile-touchable"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Neu generieren
                            </Button>
                          )}
                        </div>
                      </div>

                      {message.sender === "user" && (
                        <Avatar className="w-8 h-8 bg-secondary mobile-avatar">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start mobile-message">
                      <Avatar className="w-8 h-8 bg-primary mobile-avatar">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 mobile-loading mobile-message-content">
                        <div className="flex items-center gap-2">
                          <span className="mobile-small">KI denkt nach</span>
                          <div className="flex items-center gap-1 mobile-loading-dots">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce mobile-loading-dot" />
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce mobile-loading-dot"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce mobile-loading-dot"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2 pt-4 border-t border-border mobile-input-area">
                <div className="mobile-input-container flex gap-2 w-full">
                  <Input
                    placeholder="Stellen Sie hier Ihre Frage..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 mobile-input mobile-touchable"
                  />
                  <Button 
                    onClick={() => handleSendMessage()} 
                    disabled={!inputValue.trim() || isLoading} 
                    size="icon"
                    className="mobile-send-button mobile-touchable"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
