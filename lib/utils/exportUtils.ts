import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BOMItem {
  partNumber: string;
  description: string;
  quantity?: number;
  level?: number;
  workCenter?: string;
  materialSpec?: string;
  confidence?: number;
  changeType?: string;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO CSV
// ═══════════════════════════════════════════════════════════════
export function exportToCSV(items: BOMItem[], filename: string = 'bom-export.csv') {
  const data = items.map(item => ({
    'Part Number': item.partNumber,
    'Description': item.description,
    'Quantity': item.quantity || 1,
    'Level': item.level || 0,
    'Work Center': item.workCenter || '',
    'Material Spec': item.materialSpec || '',
    'Confidence': item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : '',
    'Change Type': item.changeType || 'unchanged',
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO EXCEL
// ═══════════════════════════════════════════════════════════════
export function exportToExcel(items: BOMItem[], filename: string = 'bom-export.xlsx') {
  const data = items.map(item => ({
    'Part Number': item.partNumber,
    'Description': item.description,
    'Quantity': item.quantity || 1,
    'Level': item.level || 0,
    'Work Center': item.workCenter || '',
    'Material Spec': item.materialSpec || '',
    'Confidence': item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : '',
    'Change Type': item.changeType || 'unchanged',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'mBOM');

  // Add styling (column widths)
  const colWidths = [
    { wch: 15 }, // Part Number
    { wch: 40 }, // Description
    { wch: 10 }, // Quantity
    { wch: 8 },  // Level
    { wch: 20 }, // Work Center
    { wch: 20 }, // Material Spec
    { wch: 12 }, // Confidence
    { wch: 12 }, // Change Type
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO PDF
// ═══════════════════════════════════════════════════════════════
export function exportToPDF(items: BOMItem[], filename: string = 'bom-export.pdf') {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Manufacturing Bill of Materials (mBOM)', 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Parts: ${items.length}`, 14, 34);

  // Table
  const tableData = items.map(item => [
    item.partNumber,
    item.description.substring(0, 40) + (item.description.length > 40 ? '...' : ''),
    (item.quantity || 1).toString(),
    item.workCenter?.split('-').slice(1, 2).join('-') || '',
    item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : '',
  ]);

  autoTable(doc, {
    head: [['Part Number', 'Description', 'Qty', 'Work Center', 'Confidence']],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [20, 184, 166], // Teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(filename);
}
