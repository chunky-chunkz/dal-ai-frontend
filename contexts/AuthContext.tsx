"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  id: string;
  email: string;
  displayName?: string;
  name?: string;
  jobTitle?: string;
  officeLocation?: string;
};

type AuthContextValue = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "dal-ai-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Beim ersten Render User aus localStorage laden
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
        console.log('✅ User aus localStorage geladen:', parsed.displayName || parsed.email);
      }
    } catch (err) {
      console.error("❌ Konnte User aus localStorage nicht laden", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. User-Änderungen wieder in localStorage schreiben
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      console.log('💾 User in localStorage gespeichert:', user.displayName || user.email);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ User aus localStorage entfernt');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
  }
  return ctx;
}
