import { jsPDF } from 'jspdf';

export interface SuratPermohonanData {
  opd: string;
  namaKegiatan: string;
  jenisKegiatan: 'Pembangunan' | 'Pemeliharaan';
  lokasi: string;
}

export function generateSuratPermohonan(data: SuratPermohonanData): jsPDF {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('times', 'normal');
  
  // Title
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text('SURAT PERMOHONAN', 105, 40, { align: 'center' });
  
  // Spacing after title
  let yPos = 70;
  
  // Recipient information
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  doc.text('Kepada Yth. Sdr. Ketua Tim Anggaran Pemerintah Daerah (TAPD)', 20, yPos);
  yPos += 7;
  doc.text('Kabupaten Tulungagung', 20, yPos);
  yPos += 7;
  doc.text('Cq.', 20, yPos);
  yPos += 7;
  doc.text('Kepala Bagian Administrasi Pembangunan', 20, yPos);
  yPos += 7;
  doc.text('Sekretariat Daerah Kabupaten Tulungagung', 20, yPos);
  
  // Spacing before main content
  yPos += 20;
  
  // Main content
  const mainText = 'Bersama ini kami mengajukan usulan kegiatan agar dapatnya dilakukan ' +
    'verifikasi kesesuaian dengan Analisis Standar Belanja (ASB) Fisik, dengan data ' +
    'sebagai berikut :';
  
  const splitText = doc.splitTextToSize(mainText, 170);
  doc.text(splitText, 20, yPos);
  yPos += splitText.length * 7 + 10;
  
  // Data fields
  doc.text('1.  OPD', 20, yPos);
  doc.text(':', 70, yPos);
  doc.text(data.opd, 80, yPos);
  yPos += 10;
  
  doc.text('2.  Nama Kegiatan', 20, yPos);
  doc.text(':', 70, yPos);
  doc.text(data.namaKegiatan, 80, yPos);
  yPos += 10;
  
  doc.text('3.  Jenis Kegiatan', 20, yPos);
  doc.text(':', 70, yPos);
  
  // Add checkbox styling for Jenis Kegiatan
  const isPembangunan = data.jenisKegiatan === 'Pembangunan';
  const isPemeliharaan = data.jenisKegiatan === 'Pemeliharaan';
  
  // Pembangunan checkbox
  doc.rect(80, yPos - 3, 4, 4);
  if (isPembangunan) {
    doc.text('X', 81, yPos);
  }
  doc.text('Pembangunan', 87, yPos);
  
  // Pemeliharaan checkbox  
  doc.text('/', 115, yPos);
  doc.rect(120, yPos - 3, 4, 4);
  if (isPemeliharaan) {
    doc.text('X', 121, yPos);
  }
  doc.text('Pemeliharaan', 127, yPos);
  
  doc.setFontSize(10);
  doc.text('(Coret yang tidak perlu)', 165, yPos);
  doc.setFontSize(12);
  
  yPos += 10;
  
  doc.text('4.  Lokasi', 20, yPos);
  doc.text(':', 70, yPos);
  const splitLokasi = doc.splitTextToSize(data.lokasi, 110);
  doc.text(splitLokasi, 80, yPos);
  yPos += splitLokasi.length * 7 + 10;
  
  // Closing text
  const closingText = 'Demikan usulan ini, atas perhatiannya disampaikan terimakasih.';
  doc.text(closingText, 20, yPos);
  
  return doc;
}

export function saveSuratPermohonanPDF(data: SuratPermohonanData, filename: string): Blob {
  const doc = generateSuratPermohonan(data);
  return doc.output('blob');
}
