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
 * Build WhatsApp Reminder Link
 * @param {string} phone 
 * @param {string} customerName 
 * @param {number} balance amount (> 0 means customer owes you)
 * @param {string} businessName 
 */
export function buildWhatsAppReminderUrl(phone, customerName, balance, businessName = 'My Business') {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const dueAmount = formatCurrency(Math.abs(balance));
  let message = `Dear ${customerName},\n\nYour total balance with ${businessName} is ${dueAmount}. Please settle your pending payment at your earliest convenience.\n\nThank you!`;
  
  if (balance < 0) {
    message = `Hi ${customerName},\n\nThis is a quick update regarding your account with ${businessName}. You have an advance credit/refund balance of ${dueAmount}.\n\nThank you!`;
  }
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
