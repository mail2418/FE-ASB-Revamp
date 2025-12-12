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

// GET - Fetch all fungsi ruang
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    // Get idAsb and view from query parameters
    const { searchParams } = new URL(request.url);
    const idAsb = searchParams.get('idAsb');

    console.log(idAsb)

    // Get pagination parameters from query
    const page = searchParams.get('page') || '1';
    const amount = searchParams.get('amount') || '100';
    const tahunAnggaran = searchParams.get('tahunAnggaran') || '2025';

    console.log(tahunAnggaran)

    let apiUrl = `${API_BASE_URL}/asb?page=${page}&amount=${amount}&tahunAnggaran=${tahunAnggaran}`;
    if (idAsb) {
      apiUrl = `${API_BASE_URL}/asb/id?id=${idAsb}`;
    }

    console.log(apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to fetch fungsi ruang data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("fetching asb success")
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching fungsi ruang:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

