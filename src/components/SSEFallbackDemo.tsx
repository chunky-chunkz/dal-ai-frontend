/**
 * Demo component to test SSE fallback functionality
 * Shows different scenarios: normal SSE, fallback mode, and error handling
 */

import { useState, useCallback } from 'react';
import { askStream, checkSSESupport } from '../api/client';

// Simple demo component for testing SSE fallback functionality
export function SSEFallbackDemo() {
  const [response, setResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMode, setStreamingMode] = useState<'sse' | 'fallback' | 'unknown'>('unknown');
  const [error, setError] = useState<string>('');
  const [currentCancel, setCurrentCancel] = useState<(() => void) | null>(null);

  // Check SSE support
  const sseSupport = checkSSESupport();

  const handleAskQuestion = useCallback(async (question: string, forceMode?: 'normal' | 'fallback') => {
    setResponse('');
    setError('');
    setIsStreaming(true);
    setStreamingMode('unknown');
    
    // For demo: simulate EventSource unavailability
    const originalEventSource = (globalThis as any).EventSource;
    if (forceMode === 'fallback') {
      (globalThis as any).EventSource = undefined;
      setStreamingMode('fallback');
    } else {
      setStreamingMode('sse');
    }

    try {
      let fullResponse = '';
      
      const result = askStream(question, (chunk: string) => {
        fullResponse += chunk;
        setResponse(fullResponse);
      });
      
      setCurrentCancel(() => result.cancel);
      
      await result.done;
      
      console.log(`✅ Question answered using ${streamingMode} mode`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Streaming failed:', errorMessage);
    } finally {
      setIsStreaming(false);
      setCurrentCancel(null);
      
      // Restore EventSource if we mocked it
      if (forceMode === 'fallback') {
        (globalThis as any).EventSource = originalEventSource;
      }
    }
  }, [streamingMode]);

  const handleCancel = useCallback(() => {
    if (currentCancel) {
      currentCancel();
      setIsStreaming(false);
      setCurrentCancel(null);
      console.log('🛑 Streaming cancelled by user');
    }
  }, [currentCancel]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">SSE Fallback Demo</h2>
        
        {/* Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p><strong>SSE Support:</strong> {sseSupport.reason}</p>
          <p><strong>Mode:</strong> {sseSupport.mode === 'sse' ? 'Server-Sent Events' : 'Fallback (POST)'}</p>
          <p><strong>Status:</strong> 
            {isStreaming ? (
              <span className="text-blue-600"> Streaming ({streamingMode})</span>
            ) : (
              <span className="text-green-600"> Ready</span>
            )}
          </p>
        </div>

        {/* Demo Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => handleAskQuestion('Wie kann ich meine Rechnung bezahlen?', 'normal')}
            disabled={isStreaming}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Test Normal SSE
          </button>
          
          <button
            onClick={() => handleAskQuestion('Test fallback mode question', 'fallback')}
            disabled={isStreaming}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Test Fallback Mode
          </button>
          
          <button
            onClick={() => handleAskQuestion('Test cancellation')}
            disabled={isStreaming}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            Test Cancellation
          </button>
        </div>

        {/* Cancel Button */}
        {isStreaming && (
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-red-500 text-white rounded mb-4"
          >
            Cancel Streaming
          </button>
        )}

        {/* Response Display */}
        {response && (
          <div className="border rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Response:</h3>
            <div className="p-3 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap text-sm">{response}</pre>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1">|</span>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="border border-red-300 bg-red-50 rounded p-4 mb-4">
            <p className="text-red-700"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="border rounded p-4 text-sm">
          <h3 className="font-semibold mb-2">How the Fallback Works:</h3>
          <ol className="list-decimal list-inside space-y-1 mb-3">
            <li><strong>Normal SSE:</strong> Uses EventSource for real-time streaming</li>
            <li><strong>Fallback Detection:</strong> Detects when SSE is unavailable or blocked</li>
            <li><strong>Automatic Fallback:</strong> Falls back to POST /api/answer</li>
            <li><strong>Simulated Streaming:</strong> Shows full answer character by character</li>
            <li><strong>Transparent UX:</strong> User sees the same streaming experience</li>
          </ol>
          
          <div className="p-2 bg-blue-50 rounded text-xs">
            <strong>Fallback Triggers:</strong>
            <ul className="list-disc list-inside mt-1">
              <li>EventSource not supported by browser</li>
              <li>CORS policy blocks SSE connections</li>
              <li>Network errors during SSE connection</li>
              <li>SSE connection timeout (10 seconds)</li>
              <li>Server returns [ERROR] event</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SSEFallbackDemo;
