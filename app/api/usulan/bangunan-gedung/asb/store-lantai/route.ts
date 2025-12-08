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

// PUT - Update store-lantai
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
        id_asb_detail,
        luas_lantai,
        id_asb_lantai,
        id_asb_fungsi_ruang
    } = body;

    console.log(id_asb)
    console.log(id_asb_detail)
    console.log(luas_lantai)
    console.log(id_asb_lantai)
    console.log(id_asb_fungsi_ruang)

    const response = await fetch(`${API_BASE_URL}/asb/store-lantai`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id_asb,
        id_asb_detail,
        luas_lantai,
        id_asb_lantai,
        id_asb_fungsi_ruang
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to update store-lantai' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("PUT store-lantai success");
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error updating store-lantai:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}