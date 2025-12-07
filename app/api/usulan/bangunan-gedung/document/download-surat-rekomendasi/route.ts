import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idAsb = searchParams.get('idAsb');
    const view = searchParams.get('view');
    
    if (!idAsb) {
      return NextResponse.json(
        { error: 'idAsb is required' },
        { status: 400 }
      );
    }

    // Get token from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];

    // Build the API URL with optional view parameter
    const apiUrl = view === 'true' 
      ? `${process.env.NEXT_PUBLIC_API_URL}/documents/surat-rekomendasi/${idAsb}?view=true`
      : `${process.env.NEXT_PUBLIC_API_URL}/documents/surat-rekomendasi/${idAsb}`;

    // Fetch from external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch surat rekomendasi', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching surat rekomendasi:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
