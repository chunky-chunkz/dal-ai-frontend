import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Frontend: Document upload request received');
    const body = await request.json();
    console.log('📄 Frontend: File info:', { 
      filename: body.filename, 
      contentLength: body.content?.length,
      hasUserId: !!body.userId 
    });
    
    // Forward cookies for authentication
    const cookies = request.headers.get('cookie');
    console.log('🍪 Frontend: Forwarding cookies:', cookies ? 'YES' : 'NO');
    
    console.log('🔗 Frontend: Calling backend:', `${BACKEND_URL}/api/documents/upload`);
    
    const response = await fetch(`${BACKEND_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('📥 Frontend: Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Frontend: Backend error:', errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Frontend: Upload successful');
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Frontend: Document upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload document' },
      { status: 500 }
    );
  }
}
