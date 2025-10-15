import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

export async function GET(request: NextRequest) {
  try {
    // Forward cookies for authentication
    const cookies = request.headers.get('cookie');
    
    const response = await fetch(`${BACKEND_URL}/api/documents`, {
      method: 'GET',
      headers: {
        ...(cookies && { 'Cookie': cookies }),
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Document list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load documents' },
      { status: 500 }
    );
  }
}
