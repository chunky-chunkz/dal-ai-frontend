import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

export async function GET(request: NextRequest) {
  try {
    console.log('🌍 Frontend: Fetching global knowledge...');
    
    const response = await fetch(`${BACKEND_URL}/api/memory/global`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Frontend: Backend error:', errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Frontend: Retrieved global knowledge:', data.count, 'items');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend: Global knowledge fetch error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch global knowledge' },
      { status: 500 }
    );
  }
}
