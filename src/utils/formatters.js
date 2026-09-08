/**
 * Format raw number into Indian Rupee Currency Format (₹)
 * @param {number} amount 
 * @returns {string} formatted string e.g. ₹ 1,250.00
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(absAmount);
  
  return `₹ ${formatted}`;
}

/**
 * Format timestamp ISO or Date object into user readable format
 * @param {string|Date} date 
 * @returns {string} e.g. 26 Aug 2026, 06:45 PM
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

/**
 * Format phone number for native Android phone dialer (tel:+91XXXXXXXXXX)
 * @param {string} phone
 * @returns {string} e.g. tel:+919876543210
 */
export function formatPhoneForCalling(phone) {
  if (!phone) return '#';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `tel:+91${clean}`;
  } else if (clean.length === 12 && clean.startsWith('91')) {
    return `tel:+${clean}`;
  } else if (phone.trim().startsWith('+')) {
    return `tel:+${clean}`;
  }
  return `tel:+91${clean}`;
}

/**
 * Build WhatsApp Reminder Link (https://wa.me/91XXXXXXXXXX?text=...)
 * @param {string} phone 
 * @param {string} customerName 
 * @param {number} balance amount (> 0 means customer owes you)
 * @param {string} businessName 
 */
export function buildWhatsAppReminderUrl(phone, customerName, balance, businessName = 'JewelLedger') {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`);
  
  const dueAmount = formatCurrency(Math.abs(balance));
  let message = `Dear ${customerName},\n\nYour total balance with ${businessName} is ${dueAmount}. Please settle your pending payment at your earliest convenience.\n\nThank you!`;
  
  if (balance < 0) {
    message = `Hi ${customerName},\n\nThis is a quick update regarding your account with ${businessName}. You have an advance credit/refund balance of ${dueAmount}.\n\nThank you!`;
  }
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Build WhatsApp Bill / Transaction Sharing Link (https://wa.me/91XXXXXXXXXX?text=...)
 * @param {string} phone
 * @param {string} customerName
 * @param {object} tx
 * @param {string} businessName
 */
export function buildWhatsAppBillUrl(phone, customerName, tx, businessName = 'JewelLedger') {
  if (!phone || !tx) return '#';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`);

  const txDate = formatDate(tx.date || new Date().toISOString());
  const isSale = tx.type === 'GAVE';
  const amountStr = formatCurrency(tx.amount || 0);

  let message = `🧾 *${businessName} - Transaction Receipt*\n\n`;
  message += `📅 *Date:* ${txDate}\n`;
  message += `👤 *Customer:* ${customerName}\n`;
  message += `🔖 *Type:* ${isSale ? 'Item Sold / Credit Given' : 'Payment Received'}\n`;
  message += `💰 *Amount:* ${amountStr}\n`;

  if (tx.jewelryCategory || tx.itemType === 'JEWELRY') {
    message += `💍 *Item:* ${tx.jewelryCategory || tx.category || 'Jewelry'}\n`;
    if (tx.purity) message += `✨ *Purity:* ${tx.purity}\n`;
    if (tx.netWeightGrams) message += `⚖️ *Net Weight:* ${tx.netWeightGrams}g\n`;
    if (tx.makingCharges) message += `🛠️ *Making Charges:* ${formatCurrency(tx.makingCharges)}\n`;
  }

  if (tx.paymentStatus) {
    message += `📋 *Payment Status:* ${tx.paymentStatus}\n`;
  }
  if (tx.paidAmount !== undefined && tx.paidAmount !== null && tx.paidAmount > 0) {
    message += `💵 *Paid:* ${formatCurrency(tx.paidAmount)}\n`;
  }
  if (tx.dueAmount !== undefined && tx.dueAmount !== null && tx.dueAmount > 0) {
    message += `⏳ *Due Remaining:* ${formatCurrency(tx.dueAmount)}\n`;
  }
  if (tx.note) {
    message += `📝 *Note:* ${tx.note}\n`;
  }

  message += `\nThank you for choosing ${businessName}!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

