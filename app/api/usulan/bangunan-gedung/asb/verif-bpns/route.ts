import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get token from request headers
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// PUT - Update verif-bpns
export async function PUT(request: NextRequest) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id_asb,
      verif_komponen_nonstd,
      verif_bobot_acuan_nonstd,
    } = body;

    const response = await fetch(`${API_BASE_URL}/asb/verif-bpns`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id_asb,
        verif_komponen_nonstd,
        verif_bobot_acuan_nonstd,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to update verif-bpns' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("PUT verif-bpns success");
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error updating verif-bpns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}