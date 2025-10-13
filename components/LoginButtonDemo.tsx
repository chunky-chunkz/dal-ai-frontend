"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, Calendar, Mail } from "lucide-react";

export interface LoginButtonDemoProps {
  className?: string;
}

export const LoginButtonDemo: React.FC<LoginButtonDemoProps> = ({ 
  className = "" 
}) => {
  const [user, setUser] = useState<any>(null);
  const [showDemoData, setShowDemoData] = useState(false);

  const handleDemoLogin = () => {
    // Simuliere einen eingeloggten Benutzer
    setUser({
      displayName: "Demo User",
      mail: "demo@example.com",
      id: "demo-123"
    });
  };

  const handleLogout = () => {
    setUser(null);
    setShowDemoData(false);
  };

  const toggleDemoData = () => {
    setShowDemoData(!showDemoData);
  };

  if (user) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleDemoData}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            {user.displayName}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {showDemoData && (
          <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Demo Microsoft Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>Benutzer: {user.displayName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>E-Mail: {user.mail}</span>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Demo-Daten:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Nächster Termin: Meeting um 15:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>Ungelesene E-Mails: 3</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-amber-600">
                  ⚠️ Demo-Modus aktiv. Für echte Microsoft-Integration ist eine Azure App Registration erforderlich.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Button 
      onClick={handleDemoLogin}
      size="sm" 
      className={className}
    >
      <User className="w-4 h-4 mr-2" />
      Microsoft Login (Demo)
    </Button>
  );
};

export default LoginButtonDemo;
