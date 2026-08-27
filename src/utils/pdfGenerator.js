import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './formatters';

/**
 * Generate PDF Ledger Report for a single Customer
 */
export function generateCustomerPdfReport(customer, transactions, businessName = 'JewelLedger & Bullion Store') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Banner
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(businessName.toUpperCase(), 14, 16);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('JEWELRY & LEDGER CUSTOMER STATEMENT', pageWidth - 14, 16, { align: 'right' });
  
  // Customer Info Box
  let y = 38;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(customer.name, 14, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  if (customer.phone) doc.text(`Phone: ${customer.phone}`, 14, y + 6);
  if (customer.address) doc.text(`Address: ${customer.address}`, 14, y + 12);
  doc.text(`Report Date: ${formatDate(new Date())}`, pageWidth - 14, y, { align: 'right' });
  
  // Balance Summary Card
  y += 20;
  const balance = customer.netBalance || 0;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('Net Balance Status:', 20, y + 14);
  
  doc.setFontSize(12);
  if (balance > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text(`YOU WILL GET: ${formatCurrency(balance)}`, pageWidth - 20, y + 14, { align: 'right' });
  } else if (balance < 0) {
    doc.setTextColor(22, 163, 74);
    doc.text(`YOU WILL GIVE: ${formatCurrency(Math.abs(balance))}`, pageWidth - 20, y + 14, { align: 'right' });
  } else {
    doc.setTextColor(71, 85, 105);
    doc.text('SETTLED (₹ 0)', pageWidth - 20, y + 14, { align: 'right' });
  }
  
  // Transactions Table Header
  y += 30;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DATE & TIME', 18, y + 7);
  doc.text('ITEM DETAILS & SPECS', 65, y + 7);
  doc.text('YOU GAVE (₹)', 135, y + 7, { align: 'right' });
  doc.text('YOU GOT (₹)', pageWidth - 18, y + 7, { align: 'right' });
  
  // Transactions Rows
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  let totalGave = 0;
  let totalGot = 0;
  
  transactions.forEach((tx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setTextColor(30, 41, 59);
    doc.text(formatDate(tx.date), 18, y);
    
    // Spec text construction
    let specText = tx.jewelryCategory || tx.note || tx.category || 'Transaction';
    if (tx.purity) specText += ` [${tx.purity}]`;
    if (tx.netWeightGrams) specText += ` ${tx.netWeightGrams}g`;
    if (tx.makingCharges) specText += ` (Mkg: ₹${tx.makingCharges})`;
    
    doc.text(specText, 65, y);
    
    if (tx.type === 'GAVE') {
      totalGave += tx.amount;
      doc.setTextColor(220, 38, 38);
      doc.text(formatCurrency(tx.amount), 135, y, { align: 'right' });
      doc.text('-', pageWidth - 18, y, { align: 'right' });
    } else {
      totalGot += tx.amount;
      doc.setTextColor(22, 163, 74);
      doc.text('-', 135, y, { align: 'right' });
      doc.text(formatCurrency(tx.amount), pageWidth - 18, y, { align: 'right' });
    }
    
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 4, pageWidth - 14, y + 4);
    y += 10;
  });
  
  // Totals Row
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TOTALS', 65, y);
  doc.setTextColor(220, 38, 38);
  doc.text(formatCurrency(totalGave), 135, y, { align: 'right' });
  doc.setTextColor(22, 163, 74);
  doc.text(formatCurrency(totalGot), pageWidth - 18, y, { align: 'right' });
  
  // Save PDF
  doc.save(`${customer.name.replace(/\s+/g, '_')}_Jewelry_Statement.pdf`);
}

/**
 * Generate Full Business Summary Report PDF
 */
export function generateBusinessPdfReport(customers, businessName = 'JewelLedger & Bullion Store') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(businessName.toUpperCase(), 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('JEWELRY STORE OVERALL SUMMARY', pageWidth - 14, 16, { align: 'right' });
  
  let totalGet = 0;
  let totalGive = 0;
  customers.forEach(c => {
    if (c.netBalance > 0) totalGet += c.netBalance;
    if (c.netBalance < 0) totalGive += Math.abs(c.netBalance);
  });
  const netBalance = totalGet - totalGive;
  
  let y = 38;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Date: ${formatDate(new Date())}`, 14, y);
  doc.text(`Total Customers: ${customers.length}`, pageWidth - 14, y, { align: 'right' });
  
  // Totals Box
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.text(`TOTAL YOU'LL GET: ${formatCurrency(totalGet)}`, 20, y + 12);
  
  doc.setTextColor(22, 163, 74);
  doc.text(`TOTAL YOU'LL GIVE: ${formatCurrency(totalGive)}`, 90, y + 12);
  
  doc.setTextColor(217, 119, 6);
  doc.text(`NET BALANCE: ${formatCurrency(netBalance)}`, pageWidth - 20, y + 12, { align: 'right' });
  
  // Customer Table
  y += 28;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('CUSTOMER NAME', 18, y + 7);
  doc.text('PHONE', 90, y + 7);
  doc.text('BALANCE STATUS', pageWidth - 18, y + 7, { align: 'right' });
  
  y += 12;
  doc.setFont('helvetica', 'normal');
  
  customers.forEach(c => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(30, 41, 59);
    doc.text(c.name, 18, y);
    doc.text(c.phone || '-', 90, y);
    
    if (c.netBalance > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`+ ${formatCurrency(c.netBalance)} (You'll Get)`, pageWidth - 18, y, { align: 'right' });
    } else if (c.netBalance < 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`- ${formatCurrency(Math.abs(c.netBalance))} (You'll Give)`, pageWidth - 18, y, { align: 'right' });
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('Settled ₹ 0', pageWidth - 18, y, { align: 'right' });
    }
    
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 4, pageWidth - 14, y + 4);
    y += 10;
  });
  
  doc.save(`${businessName.replace(/\s+/g, '_')}_Jewelry_Report.pdf`);
}
