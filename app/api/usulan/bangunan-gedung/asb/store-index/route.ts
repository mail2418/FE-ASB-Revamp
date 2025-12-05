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

export async function POST(request: NextRequest){
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    const requestData = await request.json();
    const {
        tahunAnggaran,
        namaAsb,
        alamat,
        totalLantai,
        idAsbTipeBangunan,
        idKabkota,
        jumlahKontraktor,
        idAsbJenis
    } = requestData;

    console.log(tahunAnggaran)
    console.log(namaAsb)
    console.log(alamat)
    console.log(totalLantai)
    console.log(idAsbTipeBangunan)
    console.log(idKabkota)
    console.log(jumlahKontraktor)
    console.log(idAsbJenis)

    const response = await fetch(`${API_BASE_URL}/asb/store-index`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tahunAnggaran,
        namaAsb,
        alamat,
        totalLantai,
        idAsbTipeBangunan,
        idKabkota,
        jumlahKontraktor,
        idAsbJenis
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
    console.log("fetching fungsi ruang success")
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

    const response = await fetch(`${API_BASE_URL}/asb/store-index`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: request.body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to fetch fungsi ruang data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("fetching fungsi ruang success")
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching fungsi ruang:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}