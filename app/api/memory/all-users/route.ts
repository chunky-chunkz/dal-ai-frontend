import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/memory/all-users`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user memories')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user memories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user memories' },
      { status: 500 }
    )
  }
}
