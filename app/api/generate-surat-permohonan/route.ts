import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { saveSuratPermohonanPDF, SuratPermohonanData } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opd, namaKegiatan, jenisKegiatan, lokasi }: SuratPermohonanData = body;

    // Validate required fields
    if (!opd || !namaKegiatan || !jenisKegiatan || !lokasi) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBlob = saveSuratPermohonanPDF({
      opd,
      namaKegiatan,
      jenisKegiatan,
      lokasi,
    }, "suratPermohonan");

    // Convert blob to buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `surat-permohonan-${timestamp}.pdf`;
    const publicPath = join(process.cwd(), 'public', filename);

    // Ensure public directory exists
    try {
      await mkdir(join(process.cwd(), 'public'), { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Save PDF to public folder
    await writeFile(publicPath, buffer);

    // Return the public URL path
    const publicUrl = `/${filename}`;

    return NextResponse.json({
      success: true,
      filePath: publicUrl,
      filename,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
