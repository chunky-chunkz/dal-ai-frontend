/**
 * MemoryPanelDemo
 * 
 * Standalone demo page for testing the MemoryPanel component
 */

import React from 'react';
import { MemoryPanel } from './MemoryPanel';

export const MemoryPanelDemo: React.FC = () => {
  const handleMemoryDeleted = (memoryId: string) => {
    console.log('✅ Memory deleted:', memoryId);
    alert(`Erinnerung ${memoryId} wurde erfolgreich gelöscht!`);
  };

  const handleError = (error: string) => {
    console.error('❌ Error:', error);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🧠 Memory Panel Demo
        </h1>
        
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ marginBottom: '16px', color: '#333' }}>📖 Anleitung</h2>
          <ul style={{ color: '#666', lineHeight: '1.8' }}>
            <li>Das Memory Panel zeigt alle gespeicherten Erinnerungen des aktuellen Nutzers an</li>
            <li>Klicken Sie auf "🗑️ Löschen" um eine Erinnerung zu entfernen</li>
            <li>Der "🔄 Aktualisieren" Button lädt die Liste neu</li>
            <li>Erinnerungen werden automatisch beim Laden der Seite abgerufen</li>
          </ul>
        </div>

        <MemoryPanel 
          onMemoryDeleted={handleMemoryDeleted}
          onError={handleError}
        />

        <div style={{ 
          marginTop: '32px', 
          textAlign: 'center',
          color: '#888',
          fontSize: '0.9rem'
        }}>
          <p>💡 Tipp: Öffnen Sie die Browser-Konsole für detaillierte Logs</p>
        </div>
      </div>
    </div>
  );
};

export default MemoryPanelDemo;
