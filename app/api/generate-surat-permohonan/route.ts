import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get token from request headers
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    const idAsb = request.nextUrl.searchParams.get('idAsb');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/asb-document/download-surat-permohonan?idAsb=${idAsb}`, {
      method: 'GET',
      headers: request.headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to fetch fungsi ruang data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("fetching success")
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching komponen bangunan standar:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}