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
      ? `${process.env.NEXT_PUBLIC_API_URL}/asb-document/download-kertas-kerja?idAsb=${idAsb}&view=true`
      : `${process.env.NEXT_PUBLIC_API_URL}/asb-document/download-kertas-kerja?idAsb=${idAsb}`;

    // Fetch from external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log("fetching surat rekomendasi, response:", response);
    
    if (!response.ok) {
      // Try to parse error as JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: 'Failed to fetch surat rekomendasi', details: errorData },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch surat rekomendasi' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    console.log("fetching surat rekomendasi success, content-type:", contentType);

    // If response is PDF directly, pass it through as PDF
    if (contentType?.includes('application/pdf')) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="surat-rekomendasi-${idAsb}.pdf"`,
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
          'Content-Disposition': `inline; filename="surat-rekomendasi-${idAsb}.pdf"`,
        },
      });
    }

    // Otherwise, pass through JSON response (may contain base64 or URL)
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
