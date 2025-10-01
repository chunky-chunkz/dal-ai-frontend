/**
 * Memory suggestion parsing utilities
 * 
 * Helps extract memory suggestions from backend response text and convert them to MemoryItem format.
 */

import { MemoryItem } from '../types/api';

/**
 * Parse memory suggestions from backend response text
 * 
 * Looks for patterns like:
 * "(Ich kann mir merken: dass Sie gerne Kaffee trinken. Möchten Sie das speichern? ✅/❌)"
 */
export function parseMemorySuggestions(responseText: string, userId: string = 'current-user'): {
  cleanText: string;
  suggestions: MemoryItem[];
} {
  // Pattern to match memory suggestions
  const memoryPattern = /\(Ich kann mir merken:\s*([^.]+)\.\s*Möchten Sie das speichern\?\s*[✅❌\/]+\)/gi;
  
  const suggestions: MemoryItem[] = [];
  let cleanText = responseText;
  
  let match;
  while ((match = memoryPattern.exec(responseText)) !== null) {
    const suggestionText = match[1].trim();
    
    // Parse the suggestion text to extract memory details
    const memoryItem = parseMemoryText(suggestionText, userId);
    if (memoryItem) {
      suggestions.push(memoryItem);
    }
    
    // Remove the memory suggestion from the clean text
    cleanText = cleanText.replace(match[0], '').trim();
  }
  
  return {
    cleanText,
    suggestions
  };
}

/**
 * Parse individual memory suggestion text into MemoryItem
 */
function parseMemoryText(suggestionText: string, userId: string): MemoryItem | null {
  try {
    // Generate unique ID for this suggestion
    const id = `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Common patterns for different memory types
    const patterns = [
      // Preferences: "dass Sie gerne Kaffee trinken"
      {
        pattern: /dass Sie (.+)/i,
        type: 'preference' as const,
        keyExtractor: (_match: RegExpMatchArray) => 'präferenz',
        valueExtractor: (match: RegExpMatchArray) => match[1].trim()
      },
      // Profile facts: "dass Beruf: Software-Entwickler"
      {
        pattern: /dass ([^:]+):\s*(.+)/i,
        type: 'profile_fact' as const,
        keyExtractor: (match: RegExpMatchArray) => match[1].trim().toLowerCase(),
        valueExtractor: (match: RegExpMatchArray) => match[2].trim()
      },
      // Contact info: "Ihre Email: john@example.com"
      {
        pattern: /Ihre ([^:]+):\s*(.+)/i,
        type: 'contact' as const,
        keyExtractor: (match: RegExpMatchArray) => match[1].trim().toLowerCase(),
        valueExtractor: (match: RegExpMatchArray) => match[2].trim()
      },
      // Task hints: "Aufgabe: Meeting - Heute 15:00"
      {
        pattern: /Aufgabe:\s*([^-]+)-\s*(.+)/i,
        type: 'task_hint' as const,
        keyExtractor: (match: RegExpMatchArray) => match[1].trim(),
        valueExtractor: (match: RegExpMatchArray) => match[2].trim()
      }
    ];
    
    // Try to match against known patterns
    for (const { pattern, type, keyExtractor, valueExtractor } of patterns) {
      const match = suggestionText.match(pattern);
      if (match) {
        return {
          id,
          userId,
          type,
          key: keyExtractor(match),
          value: valueExtractor(match),
          confidence: 0.8, // Default confidence for parsed suggestions
          createdAt: new Date().toISOString()
        };
      }
    }
    
    // Fallback: treat as general preference
    return {
      id,
      userId,
      type: 'preference',
      key: 'allgemein',
      value: suggestionText,
      confidence: 0.7,
      createdAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.warn('Failed to parse memory suggestion:', suggestionText, error);
    return null;
  }
}

/**
 * Helper function to integrate memory parsing into chat flow
 * 
 * Usage:
 * const result = processResponseWithMemory(backendResponse, userId);
 * setMessages(prev => [...prev, { ...botMessage, content: result.cleanText }]);
 * if (result.suggestions.length > 0) {
 *   setMemorySuggestions(result.suggestions);
 * }
 */
export function processResponseWithMemory(responseText: string, userId?: string): {
  cleanText: string;
  suggestions: MemoryItem[];
  hasMemorySuggestions: boolean;
} {
  const { cleanText, suggestions } = parseMemorySuggestions(responseText, userId || 'anonymous');
  
  return {
    cleanText,
    suggestions,
    hasMemorySuggestions: suggestions.length > 0
  };
}

/**
 * Format memory item for display
 */
export function formatMemoryForDisplay(item: MemoryItem): string {
  switch (item.type) {
    case 'preference':
      return `dass Sie ${item.value}`;
    case 'profile_fact':
      return `dass ${item.key}: ${item.value}`;
    case 'contact':
      return `Ihre ${item.key}: ${item.value}`;
    case 'task_hint':
      return `Aufgabe: ${item.key} - ${item.value}`;
    default:
      return `${item.key}: ${item.value}`;
  }
}
