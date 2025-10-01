/**
 * Test and usage examples for the askStream API client
 */

import { askStream, ask } from './client';

/**
 * Basic streaming example
 */
async function testBasicStreaming() {
  const question = "Wie kann ich meine Rechnung bezahlen?";
  
  console.log(`🤔 Question: ${question}\n`);
  console.log('🔄 Streaming answer:\n');
  
  let fullAnswer = '';
  
  const stream = askStream(question, (chunk) => {
    process.stdout.write(chunk);
    fullAnswer += chunk;
  });
  
  try {
    await stream.done;
    console.log('\n\n✅ Streaming completed successfully!');
    console.log(`📝 Full answer: "${fullAnswer}"`);
  } catch (error) {
    console.error('\n❌ Streaming failed:', error);
  }
}

/**
 * Streaming with cancellation example
 */
async function testStreamingWithCancellation() {
  const question = "Erkläre mir alle Details über Sunrise Services";
  
  console.log(`🤔 Question: ${question}\n`);
  console.log('🔄 Streaming answer (will be cancelled after 2 seconds):\n');
  
  const stream = askStream(question, (chunk) => {
    process.stdout.write(chunk);
  });
  
  // Cancel after 2 seconds
  setTimeout(() => {
    console.log('\n\n⏰ Cancelling stream...');
    stream.cancel();
  }, 2000);
  
  try {
    await stream.done;
    console.log('\n✅ Streaming completed');
  } catch (error) {
    console.log('\n⚠️ Streaming was cancelled or failed');
  }
}

/**
 * Compare streaming vs non-streaming
 */
async function testCompareApproaches() {
  const question = "Was kostet eine Rufnummernportierung?";
  
  console.log('🧪 Comparing streaming vs non-streaming approaches...\n');
  
  // Test non-streaming first
  console.log('📊 Non-streaming (traditional):');
  const startTime1 = Date.now();
  
  try {
    const result = await ask(question);
    const duration1 = Date.now() - startTime1;
    console.log(`Answer: ${result.answer}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Duration: ${duration1}ms\n`);
  } catch (error) {
    console.error('Non-streaming failed:', error);
  }
  
  // Test streaming
  console.log('⚡ Streaming (real-time):');
  const startTime2 = Date.now();
  let firstChunkTime = 0;
  let chunkCount = 0;
  
  const stream = askStream(question, (chunk) => {
    if (chunkCount === 0) {
      firstChunkTime = Date.now() - startTime2;
    }
    chunkCount++;
    process.stdout.write(chunk);
  });
  
  try {
    await stream.done;
    const duration2 = Date.now() - startTime2;
    console.log(`\nFirst chunk: ${firstChunkTime}ms`);
    console.log(`Total duration: ${duration2}ms`);
    console.log(`Chunks received: ${chunkCount}`);
  } catch (error) {
    console.error('\nStreaming failed:', error);
  }
}

/**
 * Error handling example
 */
async function testErrorHandling() {
  console.log('🧪 Testing error handling...\n');
  
  // Test with empty question (should trigger validation error)
  console.log('1. Testing empty question:');
  
  const stream1 = askStream('', (chunk) => {
    console.log('Chunk:', chunk);
  });
  
  try {
    await stream1.done;
    console.log('✅ Empty question handled');
  } catch (error) {
    console.log('❌ Empty question error:', error);
  }
  
  // Test with very short question
  console.log('\n2. Testing short question:');
  
  const stream2 = askStream('hi', (chunk) => {
    console.log('Chunk:', chunk);
  });
  
  try {
    await stream2.done;
    console.log('✅ Short question handled');
  } catch (error) {
    console.log('❌ Short question error:', error);
  }
}

/**
 * Real-time UI simulation
 */
async function simulateRealTimeUI() {
  const question = "Wie erreiche ich den Kundenservice?";
  
  console.log('🖥️ Simulating real-time UI updates...\n');
  console.log(`Question: ${question}\n`);
  
  let displayText = '';
  const updateInterval = 100; // Simulate UI updates every 100ms
  
  // Simulate UI state
  console.log('Chat UI State:');
  console.log('User: ' + question);
  console.log('Bot: [thinking...]');
  
  const stream = askStream(question, (chunk) => {
    displayText += chunk;
  });
  
  // Simulate periodic UI updates
  const uiUpdateInterval = setInterval(() => {
    // Clear previous bot response line
    process.stdout.write('\r\x1b[K'); // Clear line
    process.stdout.write(`Bot: ${displayText}${displayText ? '█' : '[thinking...]'}`); // Add cursor
  }, updateInterval);
  
  try {
    await stream.done;
    clearInterval(uiUpdateInterval);
    process.stdout.write('\r\x1b[K'); // Clear line
    console.log(`Bot: ${displayText}`);
    console.log('\n✅ Real-time UI simulation completed!');
  } catch (error) {
    clearInterval(uiUpdateInterval);
    console.error('\n❌ UI simulation failed:', error);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    console.log('🚀 Starting Frontend API Client Tests...\n');
    
    console.log('='.repeat(60));
    console.log('Test 1: Basic Streaming');
    console.log('='.repeat(60));
    await testBasicStreaming();
    
    console.log('\n' + '='.repeat(60));
    console.log('Test 2: Streaming with Cancellation');
    console.log('='.repeat(60));
    await testStreamingWithCancellation();
    
    console.log('\n' + '='.repeat(60));
    console.log('Test 3: Compare Approaches');
    console.log('='.repeat(60));
    await testCompareApproaches();
    
    console.log('\n' + '='.repeat(60));
    console.log('Test 4: Error Handling');
    console.log('='.repeat(60));
    await testErrorHandling();
    
    console.log('\n' + '='.repeat(60));
    console.log('Test 5: Real-time UI Simulation');
    console.log('='.repeat(60));
    await simulateRealTimeUI();
    
    console.log('\n\n🎉 All frontend API tests completed!');
    
  } catch (error) {
    console.error('\n\n💥 Test suite failed:', error);
  }
}

// Export all functions
export {
  testBasicStreaming,
  testStreamingWithCancellation,
  testCompareApproaches,
  testErrorHandling,
  simulateRealTimeUI,
  runAllTests
};
