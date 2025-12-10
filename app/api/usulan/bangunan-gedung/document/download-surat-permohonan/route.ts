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

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    // Get idAsb and view from query parameters
    const { searchParams } = new URL(request.url);
    const idAsb = searchParams.get('idAsb');
    const view = searchParams.get('view');

    if (!idAsb) {
      return NextResponse.json(
        { success: false, error: 'idAsb is required' },
        { status: 400 }
      );
    }

    let apiUrl = `${API_BASE_URL}/asb-document/download-surat-permohonan?idAsb=${idAsb}`;
    if (view === 'true') {
      apiUrl += `&view=true`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Try to parse error as JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { success: false, error: errorData.message || 'Failed to fetch surat permohonan data' },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch surat permohonan data' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    console.log("fetching surat permohonan success, content-type:", contentType);

    // If response is PDF directly, pass it through as PDF
    if (contentType?.includes('application/pdf')) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="surat-permohonan-${idAsb}.pdf"`,
        },
      });
    }

    // If response is octet-stream (binary), treat as PDF
    if (contentType?.includes('application/octet-stream')) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="surat-permohonan-${idAsb}.pdf"`,
        },
      });
    }

    // Otherwise, pass through JSON response (may contain base64 or URL)
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching surat permohonan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}