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

    // Get idAsb from query parameters
    const { searchParams } = new URL(request.url);
    const idAsb = searchParams.get('idAsb');
    const page = searchParams.get('page');
    const amount = searchParams.get('amount');
    const idAsbJenis = searchParams.get('id_asb_jenis');
    const idAsbTipeBangunan = searchParams.get('id_asb_tipe_bangunan');
    
    const routeidAsbJenis = idAsbJenis ? `&id_asb_jenis=${idAsbJenis}` : '';
    const routeidAsbTipeBangunan = idAsbTipeBangunan ? `&id_asb_tipe_bangunan=${idAsbTipeBangunan}` : '';
    const routeidAsb = idAsb ? `&idAsb=${idAsb}` : '';
    const routePage = page ? `&page=${page}` : '';
    const routeAmount = amount ? `&amount=${amount}` : '';
    
    const route = `${routeidAsb}${routeidAsbJenis}${routeidAsbTipeBangunan}${routePage}${routeAmount}`;
    
    const response = await fetch(`${API_BASE_URL}/asb-komponen-bangunan-nonstds?${route}`, {
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
    console.error('Error fetching fungsi ruang:', error);
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
      komponen_nonstd,
      bobot_nonstd
    } = body;

    console.log("id_asb", id_asb);
    console.log("komponen_nonstd", komponen_nonstd);
    console.log("bobot_nonstd", bobot_nonstd);
    
    const response = await fetch(`${API_BASE_URL}/asb/store-bpns`, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify({
        id_asb,
        komponen_nonstd,
        bobot_nonstd
      }),
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
    console.error('Error fetching fungsi ruang:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}