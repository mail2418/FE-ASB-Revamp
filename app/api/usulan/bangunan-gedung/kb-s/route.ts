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

    const response = await fetch(`${API_BASE_URL}/asb-komponen-bangunans?page=1&amount=100`, {
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

export async function PUT(request: NextRequest){
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
      id_asb_bipek_standard,
      komponen_std,
      bobot_std
    } = body;
    
    console.log("id_asb", id_asb);
    console.log("id_asb_bipek_standard", id_asb_bipek_standard);
    console.log("komponen_std", komponen_std);
    console.log("bobot_std", bobot_std);
    
    const response = await fetch(`${API_BASE_URL}/asb/store-bps`, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify({
        id_asb,
        id_asb_bipek_standard,
        komponen_std,
        bobot_std
      })
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
