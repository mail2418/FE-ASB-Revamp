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

    if (!idAsb) {
      return NextResponse.json(
        { success: false, error: 'idAsb parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/asb-document/download-surat-permohonan?idAsb=${idAsb}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Try to get error message if it's JSON, otherwise use status text
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { success: false, error: errorData.message || 'Failed to fetch document' },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to fetch document: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the PDF binary data
    const pdfBuffer = await response.arrayBuffer();
    
    console.log("fetching surat permohonan success, size:", pdfBuffer.byteLength);

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="surat-permohonan-${idAsb}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error fetching surat permohonan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}