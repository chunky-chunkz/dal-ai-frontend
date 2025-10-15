import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Frontend: Auth me request');
    // Forward cookies for authentication
    const cookies = request.headers.get('cookie');
    console.log('🍪 Frontend: Has cookies:', !!cookies);
    
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        ...(cookies && { 'Cookie': cookies }),
      },
      credentials: 'include',
    });

    console.log('📥 Frontend: Auth me response status:', response.status);

    if (!response.ok) {
      console.log('⚠️ Frontend: Not authenticated');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const data = await response.json();
    console.log('✅ Frontend: User authenticated:', data?.user?.email || 'unknown');
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Frontend: Auth me error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
