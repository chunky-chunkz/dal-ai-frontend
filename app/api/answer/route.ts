import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Memory storage file path
const MEMORY_FILE = path.join(process.cwd(), 'backend', 'data', 'user_memories.json')

// Ensure backend/data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'backend', 'data')
  try {
    await fs.access(dataDir)
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Load memories from file
async function loadMemories() {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log('📝 Creating new user memories file')
    return {}
  }
}

// Save memories to file
async function saveMemories(memories: any) {
  try {
    await ensureDataDirectory()
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memories, null, 2))
  } catch (error) {
    console.error('❌ Error saving memories:', error)
  }
}

// Extract and store personal information
async function processAndStoreMemories(sessionId: string, text: string) {
  const memories = await loadMemories()
  
  if (!memories[sessionId]) {
    memories[sessionId] = {
      userId: sessionId,
      memories: {},
      lastUpdated: new Date().toISOString()
    }
  }

  // German patterns for personal information
  const patterns = [
    { pattern: /meine?\s+lieblingsfarbe\s+ist\s+(\w+)/i, key: 'lieblingsfarbe', label: 'Lieblingsfarbe' },
    { pattern: /ich\s+heiße\s+(\w+)/i, key: 'name', label: 'Name' },
    { pattern: /mein\s+name\s+ist\s+(\w+)/i, key: 'name', label: 'Name' },
    { pattern: /ich\s+bin\s+(\d+)\s+jahre?\s+alt/i, key: 'alter', label: 'Alter' },
    { pattern: /ich\s+wohne\s+in\s+(\w+)/i, key: 'wohnort', label: 'Wohnort' },
    { pattern: /ich\s+komme\s+aus\s+(\w+)/i, key: 'herkunft', label: 'Herkunft' },
    { pattern: /mein\s+hobby\s+ist\s+(\w+)/i, key: 'hobby', label: 'Hobby' },
    { pattern: /ich\s+arbeite\s+als\s+(\w+)/i, key: 'beruf', label: 'Beruf' },
  ]

  const extracted: string[] = []

  patterns.forEach(({ pattern, key, label }) => {
    const match = text.match(pattern)
    if (match) {
      const value = match[1]
      memories[sessionId].memories[key] = {
        value: value,
        timestamp: new Date().toISOString(),
        context: text
      }
      extracted.push(`${label}: ${value}`)
      console.log(`🧠 Learned about ${sessionId}: ${label} = ${value}`)
    }
  })

  if (extracted.length > 0) {
    memories[sessionId].lastUpdated = new Date().toISOString()
    await saveMemories(memories)
  }

  return extracted
}

// Create memory context for responses
async function createMemoryContext(sessionId: string) {
  const memories = await loadMemories()
  const userMemories = memories[sessionId]
  
  if (!userMemories || Object.keys(userMemories.memories).length === 0) {
    return ''
  }

  const memoryItems = Object.entries(userMemories.memories).map(([key, info]: [string, any]) => {
    return `${key}: ${info.value}`
  })

  return `\n[Persönliche Informationen über ${sessionId}: ${memoryItems.join(', ')}]\n`
}

// Generate different response variations
function generateAlternativeResponse(originalQuestion: string, sessionId: string, attempt: number = 1): string {
  const baseResponses = [
    'Das ist eine interessante Frage! Ich helfe gerne.',
    'Danke für deine Frage! Ich denke darüber nach.',
    'Das ist ein guter Punkt. Lass mich das überdenken.',
    'Interessant! Ich merke mir unsere Unterhaltung.',
    'Eine spannende Frage! Ich überlege gerade.',
    'Das beschäftigt mich auch. Lass uns darüber sprechen.',
    'Gute Frage! Ich versuche eine andere Perspektive.',
    'Das ist durchaus berechtigt. Ich denke anders darüber nach.'
  ]
  
  const retryResponses = [
    'Lass mich das anders betrachten...',
    'Hier ist eine andere Sichtweise:',
    'Vielleicht kann ich es so erklären:',
    'Aus einem anderen Blickwinkel gesehen:',
    'Eine alternative Antwort wäre:',
    'Ich versuche es nochmal anders:',
    'Lass mich das neu formulieren:',
    'Hier eine andere Herangehensweise:'
  ]
  
  if (attempt > 1) {
    return retryResponses[Math.floor(Math.random() * retryResponses.length)]
  }
  
  return baseResponses[Math.floor(Math.random() * baseResponses.length)]
}

export async function POST(request: NextRequest) {
  try {
    const { question, sessionId = 'anonymous', retry = false, attempt = 1, settings = {} } = await request.json()

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    console.log(`🤖 Processing question for ${sessionId}: ${question}${retry ? ' (RETRY #' + attempt + ')' : ''}`)
    if (settings && Object.keys(settings).length > 0) {
      console.log('⚙️ Using custom settings:', settings)
    }

    // Forward request to the real backend KI-system
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081'
    
    // Get cookies from the incoming request to forward to backend
    const cookies = request.headers.get('cookie') || '';
    console.log('🍪 Forwarding cookies to backend:', cookies ? 'YES' : 'NO');
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies, // Forward cookies to backend for auth
        },
        credentials: 'include', // Include credentials
        body: JSON.stringify({ 
          question,
          sessionId,
          retry,
          attempt,
          settings // Forward settings to backend
        }),
      })

      if (backendResponse.ok) {
        const backendData = await backendResponse.json()
        console.log('✅ Backend response received')
        return NextResponse.json(backendData)
      } else {
        console.log('⚠️ Backend unavailable, using fallback memory system')
      }
    } catch (backendError) {
      console.log('⚠️ Backend connection failed, using fallback memory system:', backendError)
    }

    // Fallback to local memory system if backend is unavailable
    // Process and store any new personal information in backend file (only on first attempt)
    const extractedFacts = retry ? [] : await processAndStoreMemories(sessionId, question)
    
    // Get memory context for personalized responses
    const memoryContext = await createMemoryContext(sessionId)
    
    let answer = ''
    
    // Handle specific questions about stored information
    if (question.match(/was\s+ist\s+meine?\s+lieblingsfarbe/i)) {
      const memories = await loadMemories()
      const userMemories = memories[sessionId]
      
      if (userMemories && userMemories.memories.lieblingsfarbe) {
        answer = `Deine Lieblingsfarbe ist ${userMemories.memories.lieblingsfarbe.value}! 🎨`
      } else {
        answer = 'Du hast mir noch nicht deine Lieblingsfarbe verraten. Magst du mir sagen, welche es ist?'
      }
    }
    // Handle greetings with personalization
    else if (question.match(/hallo|hi|guten\s+tag|moin/i)) {
      const memories = await loadMemories()
      const userMemories = memories[sessionId]
      
      if (userMemories && userMemories.memories.name) {
        answer = `Hallo ${userMemories.memories.name.value}! Schön dich wieder zu sehen! 😊`
      } else {
        answer = 'Hallo! Schön dich zu sehen! Wie kann ich dir heute helfen?'
      }
    }
    // Handle questions about other stored information
    else if (question.match(/wie\s+heiße\s+ich|wie\s+ist\s+mein\s+name/i)) {
      const memories = await loadMemories()
      const userMemories = memories[sessionId]
      
      if (userMemories && userMemories.memories.name) {
        answer = `Du heißt ${userMemories.memories.name.value}! 😊`
      } else {
        answer = 'Du hast mir noch nicht deinen Namen gesagt. Wie heißt du denn?'
      }
    }
    // Handle React help questions
    else if (question.match(/react|javascript|jsx|component|props|state/i)) {
      answer = `Gerne helfe ich dir mit React! Für React-Projekte empfehle ich:\n\n• Verwende funktionale Komponenten mit Hooks\n• useState für lokalen State\n• useEffect für Side Effects\n• Halte Komponenten klein und wiederverwendbar\n• Nutze PropTypes oder TypeScript für Type Safety\n\nHast du eine spezifische React-Frage?`
    }
    // Confirmation for new information
    else if (extractedFacts.length > 0) {
      answer = `Verstanden! Ich merke mir: ${extractedFacts.join(', ')}. Das ist gut zu wissen! 😊`
    }
    // Default responses with memory awareness and retry variations
    else {
      const baseResponse = generateAlternativeResponse(question, sessionId, attempt)
      
      // Add personalization if we know the user's name
      const memories = await loadMemories()
      const userMemories = memories[sessionId]
      
      if (userMemories && userMemories.memories.name) {
        answer = `${baseResponse} ${userMemories.memories.name.value}! 😊`
      } else {
        answer = baseResponse
      }
      
      // Add retry context for better responses
      if (retry && attempt > 1) {
        const retryContexts = [
          ' Ich hoffe, das hilft dir besser weiter!',
          ' Vielleicht ist das eine klarere Antwort?',
          ' Ich denke, so macht es mehr Sinn.',
          ' Das sollte deine Frage besser beantworten.',
          ' Hoffentlich ist das verständlicher!'
        ]
        answer += retryContexts[Math.floor(Math.random() * retryContexts.length)]
      }
    }
    
    return NextResponse.json({
      answer,
      confidence: retry ? Math.max(0.6, 0.8 - (attempt - 1) * 0.1) : 0.8, // Slightly lower confidence on retries
      timestamp: new Date().toISOString(),
      model: retry ? `Fallback-Memory-AI-v${attempt}` : 'Fallback-Memory-AI',
      tokens: answer.length,
      extractedFacts: extractedFacts.length > 0 ? extractedFacts : undefined,
      memoryContext: memoryContext || undefined,
      memoryFile: MEMORY_FILE,
      isRetry: retry,
      attempt: attempt
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    
    return NextResponse.json({
      answer: 'Es tut mir leid, es gab einen technischen Fehler. Bitte versuchen Sie es später erneut.',
      confidence: 0.1,
      timestamp: new Date().toISOString(),
      error: true
    }, { status: 200 }) // Return 200 to avoid frontend errors
  }
}
