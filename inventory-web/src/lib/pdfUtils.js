import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = ({ title, columns, data, filename }) => {
    const doc = new jsPDF();

    // Add Logo Text (Opero)
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20); // Dark gray
    doc.text('Opero', 14, 20);

    // Add Report Title
    doc.setFontSize(16);
    doc.setTextColor(80, 80, 80);
    doc.text(title, 14, 30);

    // Add Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    doc.text(`Generated on: ${dateStr}`, 14, 38);

    // Add Table
    autoTable(doc, {
        startY: 45,
        head: [columns],
        body: data,
        theme: 'striped',
        headStyles: {
            fillColor: [31, 41, 55], // Gray-900 like
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251], // Gray-50
        },
    });

    // Footer (Page Numbers)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }

    // Save File
    doc.save(filename || 'report.pdf');
};
