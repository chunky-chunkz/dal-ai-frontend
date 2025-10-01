import React from 'react';
import { ChatStream } from './ChatStream';
import './ChatApp.css';

/**
 * Example App Component demonstrating ChatStream usage
 */
export const ChatApp: React.FC = () => {
  return (
    <div className="chat-app">
      <div className="chat-app-container">
        <ChatStream 
          placeholder="Stellen Sie hier Ihre Frage..."
          maxHeight="70vh"
          className="main-chat"
        />
        
        <div className="chat-app-footer">
          <p>
            💡 <strong>Tipp:</strong> Nutzen Sie die Beispielfragen oder fragen Sie direkt nach:
          </p>
          <ul>
            <li>Rechnungen und Zahlungen</li>
            <li>Passwort-Problemen</li>
            <li>Account-Verwaltung</li>
            <li>Technischem Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
