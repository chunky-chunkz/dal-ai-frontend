"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Menu, X, Settings, User, LogOut, FileText, Brain } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

interface MobileNavigationProps {
  currentUser?: string | null
  onLogout?: () => void
}

export default function MobileNavigation({ currentUser, onLogout }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close mobile menu when clicking outside or on a menu item
  const handleMenuClick = () => {
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="bg-transparent mobile-touchable">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[350px]">
          <VisuallyHidden asChild>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <SheetDescription>Main navigation menu for mobile devices</SheetDescription>
          </VisuallyHidden>
          
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-semibold">Menü</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="mobile-touchable"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info */}
            {currentUser && (
              <div className="py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Angemeldet als</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {currentUser}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="flex-1 py-4">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start mobile-button mobile-touchable"
                  onClick={() => {
                    window.location.href = '/documents'
                    handleMenuClick()
                  }}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Dokumente
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mobile-button mobile-touchable"
                  onClick={() => {
                    window.location.href = '/knowledge'
                    handleMenuClick()
                  }}
                >
                  <Brain className="w-4 h-4 mr-3" />
                  Wissen
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mobile-button mobile-touchable"
                  onClick={() => {
                    window.location.href = '/memories'
                    handleMenuClick()
                  }}
                >
                  <Brain className="w-4 h-4 mr-3" />
                  Meine Erinnerungen
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mobile-button mobile-touchable"
                  onClick={() => {
                    window.location.href = '/stats/memory'
                    handleMenuClick()
                  }}
                >
                  <Brain className="w-4 h-4 mr-3" />
                  Memory-Statistiken
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mobile-button mobile-touchable"
                  onClick={() => {
                    window.location.href = '/settings'
                    handleMenuClick()
                  }}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Einstellungen
                </Button>

                <div className="flex items-center justify-between pt-2 px-3">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </nav>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t space-y-2">
              {currentUser && onLogout && (
                <Button
                  variant="outline"
                  className="w-full justify-start mobile-button mobile-touchable"
                  onClick={() => {
                    onLogout()
                    handleMenuClick()
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Abmelden
                </Button>
              )}
              
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  DAL-AI Assistant v1.0
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
