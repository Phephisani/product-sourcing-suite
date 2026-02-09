import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Supplier } from './store';

// Extend jsPDF type to include autoTable
interface AutoTableJsPDF extends jsPDF {
    lastAutoTable: { finalY: number };
}

export interface POItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export const generatePurchaseOrder = (supplier: Supplier, items: POItem[], poNumber: string) => {
    const doc = new jsPDF() as AutoTableJsPDF;
    const today = new Date().toLocaleDateString();

    // -- COLORS & FONTS --
    const primaryColor = [22, 163, 74]; // Emerald-600

    // -- HEADER --
    // Company Logo/Name
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('YOUR COMPANY', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Business Road, Cape Town, 8000', 20, 26);
    doc.text('Email: sourcing@yourcompany.co.za', 20, 31);

    // Title
    doc.setFontSize(28);
    doc.setTextColor(0);
    doc.text('PURCHASE ORDER', 130, 25);

    // -- INFO SECTION --
    doc.setDrawColor(200);
    doc.line(20, 40, 190, 40);

    // Supplier Details (Left)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('VENDOR:', 20, 50);
    doc.setFont('helvetica', 'normal');
    const supplierText = [
        supplier.name,
        supplier.contactPerson || 'Sales Manager',
        supplier.email || '',
        supplier.phone || '',
        supplier.location || ''
    ].filter(Boolean);
    doc.text(supplierText, 20, 58);

    // PO Details (Right)
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER DETAILS:', 130, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${today}`, 130, 58);
    doc.text(`PO #: ${poNumber}`, 130, 64);
    doc.text(`Currency: USD`, 130, 70);

    // -- TABLE OF ITEMS --
    const tableData = items.map(item => [
        item.description,
        item.quantity,
        `$ ${item.unitPrice.toFixed(2)}`,
        `$ ${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);

    // Calculate Total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    autoTable(doc, {
        startY: 85,
        head: [['Description', 'Quantity', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 90 }, // Description
            1: { halign: 'center' }, // Qty
            2: { halign: 'right' }, // Unit Price
            3: { halign: 'right', fontStyle: 'bold' } // Total
        },
    });

    // -- TOTALS --
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text('SUBTOTAL:', 140, finalY);
    doc.text(`$ ${total.toFixed(2)}`, 190, finalY, { align: 'right' });

    doc.text('SHIPPING:', 140, finalY + 7);
    doc.text('$ 0.00', 190, finalY + 7, { align: 'right' }); // Placeholder

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, finalY + 16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`$ ${total.toFixed(2)}`, 190, finalY + 16, { align: 'right' });

    // -- FOOTER --
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const termsY = finalY + 40;
    doc.text('Terms & Conditions:', 20, termsY);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text([
        '1. Payment terms: 30% Deposit, 70% Balance before shipment.',
        '2. Please confirm receipt of this order within 24 hours.',
        '3. Shipping Mark: [Your Company Code]'
    ], 20, termsY + 6);

    // Signatures
    const sigY = 250;
    doc.setDrawColor(0);
    doc.line(20, sigY, 90, sigY);
    doc.text('Authorized Signature', 20, sigY + 5);

    doc.line(120, sigY, 190, sigY);
    doc.text('Supplier Acceptance', 120, sigY + 5);

    // Save
    doc.save(`PO_${poNumber}_${supplier.name.replace(/\s+/g, '_')}.pdf`);
};
