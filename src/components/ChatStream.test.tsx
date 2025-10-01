/**
 * ChatStream Component Testing Guide
 * 
 * This file provides testing examples for the ChatStream component.
 * To run these tests, you'll need to install testing dependencies:
 * 
 * npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest
 * 
 * Uncomment the code below once testing dependencies are installed.
 */

/*
 * Temporarily disabled tests - need to be updated for new API structure
 * TODO: Update tests to work with new askStream interface
 */

/*
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatStream } from './ChatStream';

// Mock the askStream function
jest.mock('../api/client', () => ({
  askStream: jest.fn()
}));

import { askStream } from '../api/client';
const mockAskStream = askStream as jest.MockedFunction<typeof askStream>;

describe('ChatStream Component', () => {
  beforeEach(() => {
    mockAskStream.mockClear();
  });

  test('renders welcome message initially', () => {
    render(<ChatStream />);
    
    expect(screen.getByText(/Hallo! Ich kann Ihnen bei Fragen/)).toBeInTheDocument();
    expect(screen.getByText(/FAQ Chat/)).toBeInTheDocument();
  });

  test('shows example questions', () => {
    render(<ChatStream />);
    
    expect(screen.getByText(/Wie kann ich meine Rechnung bezahlen/)).toBeInTheDocument();
    expect(screen.getByText(/Wie kann ich mein Passwort zurücksetzen/)).toBeInTheDocument();
    expect(screen.getByText(/Welche Zahlungsmethoden/)).toBeInTheDocument();
  });

  test('allows typing in input field', () => {
    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    fireEvent.change(input, { target: { value: 'Test question' } });
    
    expect(input).toHaveValue('Test question');
  });

  test('send button is disabled when input is empty', () => {
    render(<ChatStream />);
    
    const sendButton = screen.getByTitle(/Nachricht senden/);
    expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when input has text', () => {
    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    const sendButton = screen.getByTitle(/Nachricht senden/);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    expect(sendButton).not.toBeDisabled();
  });

  test('handles Enter key to send message', async () => {
    // Mock successful streaming
    const mockStream = {
      done: Promise.resolve(),
      cancel: jest.fn()
    };
    
    mockAskStream.mockImplementation((question, onChunk) => {
      // Simulate streaming chunks
      setTimeout(() => {
        onChunk('Hello ');
        onChunk('world!');
      }, 10);
      return mockStream;
    });

    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    // Check that user message appears
    await waitFor(() => {
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });

    // Check that askStream was called
    expect(mockAskStream).toHaveBeenCalledWith('Test question', expect.any(Function));
    
    // Check that input is cleared
    expect(input).toHaveValue('');
  });

  test('shows typing indicator during streaming', async () => {
    const mockStream = {
      done: new Promise(() => {}), // Never resolves to keep streaming state
      cancel: jest.fn()
    };
    
    mockAskStream.mockReturnValue(mockStream);

    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    const sendButton = screen.getByTitle(/Nachricht senden/);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/tippt.../)).toBeInTheDocument();
      expect(screen.getByText(/Bot tippt.../)).toBeInTheDocument();
    });
  });

  test('shows cancel button during streaming', async () => {
    const mockStream = {
      done: new Promise(() => {}), // Never resolves
      cancel: jest.fn()
    };
    
    mockAskStream.mockReturnValue(mockStream);

    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    const sendButton = screen.getByTitle(/Nachricht senden/);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    });
  });

  test('handles cancellation', async () => {
    const mockCancel = jest.fn();
    const mockStream = {
      done: new Promise(() => {}), // Never resolves
      cancel: mockCancel
    };
    
    mockAskStream.mockReturnValue(mockStream);

    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    const sendButton = screen.getByTitle(/Nachricht senden/);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);

    // Wait for cancel button to appear
    const cancelButton = await screen.findByText('Abbrechen');
    fireEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
  });

  test('handles streaming errors', async () => {
    const mockStream = {
      done: Promise.reject(new Error('Network error')),
      cancel: jest.fn()
    };
    
    mockAskStream.mockReturnValue(mockStream);

    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    const sendButton = screen.getByTitle(/Nachricht senden/);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Fehler: Network error/)).toBeInTheDocument();
    });
  });

  test('clears chat when clear button is clicked', async () => {
    render(<ChatStream />);
    
    // First add a message
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    const sendButton = screen.getByTitle(/Nachricht senden/);
    
    const mockStream = {
      done: Promise.resolve(),
      cancel: jest.fn()
    };
    mockAskStream.mockReturnValue(mockStream);
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });

    // Then clear the chat
    const clearButton = screen.getByTitle(/Chat löschen/);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('Test question')).not.toBeInTheDocument();
      expect(screen.getByText(/Hallo! Ich kann Ihnen bei Fragen/)).toBeInTheDocument();
    });
  });

  test('fills input when example question is clicked', () => {
    render(<ChatStream />);
    
    const exampleButton = screen.getByText(/Wie kann ich meine Rechnung bezahlen/);
    fireEvent.click(exampleButton);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    expect(input).toHaveValue('Wie kann ich meine Rechnung bezahlen?');
  });

  test('respects maxLength for input', () => {
    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/) as HTMLInputElement;
    expect(input.maxLength).toBe(500);
  });

  test('shows character count', () => {
    render(<ChatStream />);
    
    const input = screen.getByPlaceholderText(/Frage eingeben/);
    fireEvent.change(input, { target: { value: 'Test' } });
    
    expect(screen.getByText(/4\/500 Zeichen/)).toBeInTheDocument();
  });
});
*/
