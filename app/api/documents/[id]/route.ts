import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Forward cookies for authentication
    const cookies = request.headers.get('cookie');
    
    const response = await fetch(`${BACKEND_URL}/api/documents/${params.id}`, {
      method: 'DELETE',
      headers: {
        ...(cookies && { 'Cookie': cookies }),
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
