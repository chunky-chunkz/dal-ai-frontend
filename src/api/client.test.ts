/**
 * Test for SSE fallback functionality in API client
 * Demonstrates automatic fallback when EventSource fails
 */

import { askStream } from './client';

// Mock EventSource to simulate unavailability
const originalEventSource = (globalThis as any).EventSource;

/**
 * Test SSE fallback when EventSource is not available
 */
export async function testEventSourceUnavailable() {
  console.log('🧪 Testing SSE fallback when EventSource is unavailable...');
  
  // Temporarily remove EventSource
  (globalThis as any).EventSource = undefined;
  
  try {
    const chunks: string[] = [];
    
    const result = askStream('Test question for fallback', (chunk) => {
      chunks.push(chunk);
      console.log('Received chunk:', chunk);
    });
    
    await result.done;
    
    console.log('✅ Fallback completed successfully');
    console.log('Total chunks received:', chunks.length);
    console.log('Full response:', chunks.join(''));
    
  } catch (error) {
    console.error('❌ Fallback test failed:', error);
  } finally {
    // Restore EventSource
    (globalThis as any).EventSource = originalEventSource;
  }
}

/**
 * Test SSE with timeout fallback
 */
export async function testEventSourceTimeout() {
  console.log('🧪 Testing SSE timeout fallback...');
  
  // Mock EventSource that never connects
  class MockEventSource {
    onopen: ((event: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    
    constructor(public url: string) {
      console.log('MockEventSource created for:', url);
      // Simulate a connection that never opens (timeout scenario)
      setTimeout(() => {
        this.onerror?.(new Event('error'));
      }, 100);
    }
    
    close() {
      console.log('MockEventSource closed');
    }
  }
  
  // Replace EventSource with mock
  (globalThis as any).EventSource = MockEventSource;
  
  try {
    const chunks: string[] = [];
    
    const result = askStream('Test timeout fallback', (chunk) => {
      chunks.push(chunk);
      console.log('Received chunk:', chunk);
    });
    
    await result.done;
    
    console.log('✅ Timeout fallback completed successfully');
    console.log('Total chunks received:', chunks.length);
    
  } catch (error) {
    console.error('❌ Timeout fallback test failed:', error);
  } finally {
    // Restore EventSource
    (globalThis as any).EventSource = originalEventSource;
  }
}

/**
 * Test normal SSE functionality (when available)
 */
export async function testNormalSSE() {
  console.log('🧪 Testing normal SSE functionality...');
  
  try {
    const chunks: string[] = [];
    
    const result = askStream('Test normal SSE', (chunk) => {
      chunks.push(chunk);
      console.log('Received chunk:', chunk);
    });
    
    // Test cancellation after 2 seconds
    setTimeout(() => {
      console.log('Testing cancellation...');
      result.cancel();
    }, 2000);
    
    await result.done;
    
    console.log('✅ Normal SSE completed successfully');
    console.log('Total chunks received:', chunks.length);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      console.log('✅ SSE cancellation worked correctly');
    } else {
      console.error('❌ Normal SSE test failed:', error);
    }
  }
}

/**
 * Run all fallback tests
 */
export async function runAllFallbackTests() {
  console.log('🚀 Starting SSE fallback tests...\n');
  
  await testEventSourceUnavailable();
  console.log('\n');
  
  await testEventSourceTimeout();
  console.log('\n');
  
  await testNormalSSE();
  console.log('\n');
  
  console.log('🎯 All fallback tests completed!');
}

// Export for manual testing
export const fallbackTests = {
  testEventSourceUnavailable,
  testEventSourceTimeout,
  testNormalSSE,
  runAllFallbackTests
};
