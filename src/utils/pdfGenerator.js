import { formatCurrency, formatDate } from './formatters';
import { exportElementToPdf, ensureFontsLoaded } from './jewelryPdfEngine';

/**
 * Generate High-Resolution PDF Ledger Report for a single Customer.
 * Renders an off-screen high-res DOM tree and captures it with html2canvas-pro + jsPDF,
 * guaranteeing Telugu (తెలుగు), Hindi (हिन्दी) and Indian Rupee (₹) render without question marks (????).
 */
export async function generateCustomerPdfReport(customer, transactions = [], businessName = 'JewelLedger & Bullion Store') {
  if (!customer) return;

  await ensureFontsLoaded();

  // Filter transactions for this customer if needed
  const custTxs = Array.isArray(transactions) 
    ? transactions.filter(t => !t.customerId || t.customerId === customer.id)
    : [];

  // Calculate metrics
  let totalBilled = 0;
  let totalPaid = 0;
  let totalNetWeight = 0;
  let totalGrossWeight = 0;

  custTxs.forEach(tx => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'GAVE') {
      totalBilled += amt;
    } else {
      totalPaid += amt;
    }
    if (tx.grossWeightGrams) totalGrossWeight += Number(tx.grossWeightGrams);
    else if (tx.netWeightGrams) totalGrossWeight += Number(tx.netWeightGrams);

    if (tx.netWeightGrams) totalNetWeight += Number(tx.netWeightGrams);
  });

  const balanceDue = totalBilled - totalPaid;
  totalNetWeight = Math.round(totalNetWeight * 1000) / 1000;
  totalGrossWeight = Math.round(totalGrossWeight * 1000) / 1000;

  // Build Off-Screen DOM Container
  const offscreenContainer = document.createElement('div');
  offscreenContainer.id = 'pdf-render-offscreen';
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '800px';
  offscreenContainer.style.zIndex = '-9999';
  offscreenContainer.style.background = '#ffffff';
  offscreenContainer.style.color = '#0f172a';
  offscreenContainer.style.fontFamily = "'Inter', 'Noto Sans Telugu', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif";

  // Generate Table Rows HTML
  const rowsHtml = custTxs.map((tx, idx) => {
    const isSale = tx.type === 'GAVE';
    const grossWt = tx.grossWeightGrams || (tx.netWeightGrams ? tx.netWeightGrams : null);
    const netWt = tx.netWeightGrams || null;
    const stoneWt = (grossWt && netWt && grossWt > netWt) ? Math.round((grossWt - netWt) * 1000) / 1000 : null;

    const itemVal = isSale ? tx.amount : 0;
    const paidVal = !isSale ? tx.amount : (tx.paidAmount || 0);
    const diffVal = isSale ? (tx.dueAmount !== undefined ? tx.dueAmount : Math.max(0, itemVal - paidVal)) : 0;

    const dateFormatted = formatDate(tx.date);
    const itemName = tx.jewelryCategory || tx.note || tx.category || (isSale ? 'Jewelry Sale' : 'Payment Received');
    const purityBadge = tx.purity ? `<span style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:800;border:1px solid #fde68a;">${tx.purity}</span>` : '';

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'}; font-size: 11px;">
        <td style="padding: 9px 10px; text-align: center; color: #94a3b8; font-weight: 700;">${idx + 1}</td>
        <td style="padding: 9px 10px; color: #475569; white-space: nowrap;">${dateFormatted}</td>
        <td style="padding: 9px 10px; color: #0f172a;">
          <div style="font-weight: 700;">${itemName} ${purityBadge}</div>
          ${tx.note && tx.note !== itemName ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${tx.note}</div>` : ''}
        </td>
        <td style="padding: 9px 10px; text-align: right;">
          ${netWt ? `<div style="font-weight: 700; color: #0f172a;">${netWt}g <span style="font-weight:400;color:#64748b;font-size:10px;">(Net)</span></div>` : '<span style="color:#cbd5e1;">-</span>'}
          ${grossWt ? `<div style="font-size: 10px; color: #64748b;">${grossWt}g (Gross)${stoneWt ? ` - ${stoneWt}g` : ''}</div>` : ''}
        </td>
        <td style="padding: 9px 10px; text-align: right;">
          ${tx.appliedRate ? `<div style="font-weight: 600; color: #1e293b;">₹${tx.appliedRate}/g</div>` : ''}
          ${tx.makingCharges ? `<div style="font-size: 10px; color: #64748b;">+${formatCurrency(tx.makingCharges)}</div>` : ''}
          ${!tx.appliedRate && !tx.makingCharges ? '<span style="color:#cbd5e1;">-</span>' : ''}
        </td>
        <td style="padding: 9px 10px; text-align: right; font-weight: 800; color: #0f172a;">
          ${isSale ? `<span style="color:#78350f;">${formatCurrency(tx.amount)}</span>` : '<span style="color:#cbd5e1;">-</span>'}
        </td>
        <td style="padding: 9px 10px; text-align: right; font-weight: 800;">
          ${!isSale ? `<span style="color:#15803d;">${formatCurrency(tx.amount)}</span>` : paidVal > 0 ? `<span style="color:#16a34a;">${formatCurrency(paidVal)}</span>` : '<span style="color:#cbd5e1;">₹0</span>'}
        </td>
        <td style="padding: 9px 10px; text-align: right; font-weight: 800;">
          ${isSale && diffVal > 0 ? `<span style="color:#dc2626;">${formatCurrency(diffVal)}</span>` : isSale && diffVal === 0 ? '<span style="color:#16a34a; font-size:10px;">Settled</span>' : !isSale ? '<span style="color:#16a34a; font-size:10px;">Credit</span>' : '<span style="color:#cbd5e1;">-</span>'}
        </td>
      </tr>
    `;
  }).join('');

  offscreenContainer.innerHTML = `
    <div style="width: 800px; min-height: 1123px; padding: 32px; background: #ffffff; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <!-- Brand Header -->
        <div style="border-bottom: 2px solid #d97706; padding-bottom: 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">💍</span>
              <h1 style="font-size: 22px; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase;">${businessName}</h1>
            </div>
            <p style="font-size: 12px; color: #92400e; font-weight: 600; margin: 4px 0 0 0;">Hallmark Gold, Certified Diamond & Silver Ornaments</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Regd. Hallmark Ornaments Ledger • Phone: +91 98765 43210</p>
          </div>
          <div style="text-align: right;">
            <div style="background: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-block; text-transform: uppercase;">
              CUSTOMER JEWELRY STATEMENT
            </div>
            <p style="font-size: 11px; font-weight: 700; color: #475569; margin: 4px 0 0 0;">ఖాతా స్టేట్‌మెంట్ • ग्राहक खाता विवरणी</p>
            <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0;">Date: ${formatDate(new Date())}</p>
          </div>
        </div>

        <!-- Customer & Balance Infobox -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Customer Profile / కస్టమర్ వివరాలు</span>
            <h2 style="font-size: 17px; font-weight: 900; color: #0f172a; margin: 2px 0 6px 0;">
              ${customer.name} ${customer.tag ? `<span style="font-size: 10px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${customer.tag}</span>` : ''}
            </h2>
            <div style="font-size: 12px; color: #475569; line-height: 1.5;">
              ${customer.phone ? `<div><span style="color:#94a3b8;">Phone / ఫోన్:</span> <strong>+91 ${customer.phone}</strong></div>` : ''}
              ${customer.address ? `<div><span style="color:#94a3b8;">Address / చిరునామా:</span> ${customer.address}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right; border-left: 1px solid #e2e8f0; padding-left: 16px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Ledger Status / స్థితి</span>
            <div style="margin-top: 4px;">
              ${balanceDue > 0 ? `
                <span style="background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800;">
                  BALANCE DUE / బాకీ ఉంది
                </span>
              ` : balanceDue < 0 ? `
                <span style="background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800;">
                  ADVANCE CREDIT / అడ్వాన్స్
                </span>
              ` : `
                <span style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800;">
                  SETTLED / క్లియర్ అయింది
                </span>
              `}
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 6px 0 0 0;">Total Entries: <strong>${custTxs.length}</strong></p>
          </div>
        </div>

        <!-- 3 Summary Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 22px;">
          <!-- Total Billed -->
          <div style="background: #fefce8; border: 2px solid #fef08a; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; color: #854d0e; text-transform: uppercase;">
              Total Bill / మొత్తం బిల్లు / कुल बिल
            </div>
            <div style="font-size: 20px; font-weight: 900; color: #713f12; margin-top: 4px;">
              ${formatCurrency(totalBilled)}
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #a16207; margin-top: 2px;">
              Net Weight: ${totalNetWeight}g
            </div>
          </div>

          <!-- Total Paid -->
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase;">
              Total Paid / స్వీకరించినది / प्राप्त राशि
            </div>
            <div style="font-size: 20px; font-weight: 900; color: #14532d; margin-top: 4px;">
              ${formatCurrency(totalPaid)}
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #15803d; margin-top: 2px;">
              Cash / UPI / Bank / Metal
            </div>
          </div>

          <!-- Remaining Due / Balance Difference -->
          <div style="background: ${balanceDue > 0 ? '#fff1f2' : '#f8fafc'}; border: 2px solid ${balanceDue > 0 ? '#fecdd3' : '#e2e8f0'}; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; color: ${balanceDue > 0 ? '#9f1239' : '#334155'}; text-transform: uppercase;">
              Remaining Due / బాకీ / शेष अंतर
            </div>
            <div style="font-size: 20px; font-weight: 900; color: ${balanceDue > 0 ? '#be123c' : balanceDue < 0 ? '#4338ca' : '#334155'}; margin-top: 4px;">
              ${formatCurrency(Math.abs(balanceDue))} ${balanceDue < 0 ? '(Cr)' : ''}
            </div>
            <div style="font-size: 10px; font-weight: 700; color: ${balanceDue > 0 ? '#e11d48' : '#64748b'}; margin-top: 2px;">
              ${balanceDue > 0 ? 'Pending to Collect' : balanceDue === 0 ? 'Fully Settled Clean' : 'Advance Credit'}
            </div>
          </div>
        </div>

        <!-- Line Item & Price Difference Table -->
        <div style="border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; color: #334155; font-size: 10.5px; font-weight: 800; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 8px 10px; text-align: center; width: 30px;">#</th>
                <th style="padding: 8px 10px; width: 115px;">Date / తేదీ</th>
                <th style="padding: 8px 10px;">Item & Purity / ఆభరణం</th>
                <th style="padding: 8px 10px; text-align: right; width: 110px;">Weight / బరువు</th>
                <th style="padding: 8px 10px; text-align: right; width: 90px;">Rate & Mkg</th>
                <th style="padding: 8px 10px; text-align: right; width: 90px;">Total Value</th>
                <th style="padding: 8px 10px; text-align: right; width: 90px;">Paid / Received</th>
                <th style="padding: 8px 10px; text-align: right; width: 90px;">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="8" style="padding: 24px; text-align: center; color: #94a3b8;">No entries recorded yet.</td></tr>`}
            </tbody>
            <tfoot>
              <tr style="background: #fef3c7; border-top: 2px solid #f59e0b; font-weight: 800; font-size: 11px; color: #0f172a;">
                <td colspan="3" style="padding: 10px; color: #92400e; text-transform: uppercase;">
                  LEDGER TOTALS / మొత్తం లెక్కలు (${custTxs.length} Items)
                </td>
                <td style="padding: 10px; text-align: right; color: #78350f;">
                  <div>${totalNetWeight}g</div>
                  <div style="font-size: 9px; color: #92400e;">Net Weight</div>
                </td>
                <td style="padding: 10px; text-align: right; color: #94a3b8;">-</td>
                <td style="padding: 10px; text-align: right; font-size: 12px; font-weight: 900; color: #78350f;">
                  ${formatCurrency(totalBilled)}
                </td>
                <td style="padding: 10px; text-align: right; font-size: 12px; font-weight: 900; color: #15803d;">
                  ${formatCurrency(totalPaid)}
                </td>
                <td style="padding: 10px; text-align: right; font-size: 12px; font-weight: 900; color: #b91c1c;">
                  ${formatCurrency(balanceDue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Signatures & Disclaimer Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="max-w: 420px; font-size: 10px; color: #64748b; line-height: 1.4;">
          <div>Certified computer-generated jewelry statement. All gold ornaments are BIS 916 Hallmarked.</div>
          <div style="color: #92400e; font-weight: 600; margin-top: 2px;">కంప్యూటర్ రూపొందించిన ఆభరణాల స్టేట్‌మెంట్. అన్ని బంగారు ఆభరణాలు BIS హాల్‌మార్క్ చేయబడినవి.</div>
          <div style="color: #94a3b8; font-size: 9px; margin-top: 3px;">JewelLedger Secure Mobile Accounting System</div>
        </div>

        <div style="display: flex; gap: 36px; text-align: center;">
          <div>
            <div style="width: 130px; border-bottom: 1px solid #94a3b8; height: 35px; margin-bottom: 4px;"></div>
            <div style="font-size: 10px; font-weight: 700; color: #475569;">Customer Sign / కస్టమర్ సంతకం</div>
          </div>
          <div>
            <div style="width: 140px; border-bottom: 1px solid #d97706; height: 35px; margin-bottom: 4px; display: flex; align-items: flex-end; justify-content: center;">
              <span style="font-size: 9px; font-weight: 800; color: #b45309; letter-spacing: 0.5px;">[STORE SEAL]</span>
            </div>
            <div style="font-size: 10px; font-weight: 800; color: #92400e;">Authorized Store Seal & Sign</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(offscreenContainer);

  try {
    const filename = `${(customer.name || 'Customer').replace(/\s+/g, '_')}_Jewelry_Statement.pdf`;
    await exportElementToPdf(offscreenContainer, filename);
  } finally {
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }
}

/**
 * Generate Full Business Summary Report PDF with High Resolution & Indic Script support
 */
export async function generateBusinessPdfReport(customers = [], businessName = 'JewelLedger & Bullion Store') {
  await ensureFontsLoaded();

  let totalGet = 0;
  let totalGive = 0;
  customers.forEach(c => {
    if (c.netBalance > 0) totalGet += c.netBalance;
    if (c.netBalance < 0) totalGive += Math.abs(c.netBalance);
  });
  const netBalance = totalGet - totalGive;

  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '800px';
  offscreenContainer.style.zIndex = '-9999';
  offscreenContainer.style.background = '#ffffff';
  offscreenContainer.style.color = '#0f172a';
  offscreenContainer.style.fontFamily = "'Inter', 'Noto Sans Telugu', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif";

  const rowsHtml = customers.map((c, idx) => {
    const bal = c.netBalance || 0;
    return `
      <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'}; font-size: 11px;">
        <td style="padding: 8px 10px; text-align: center; color: #94a3b8; font-weight: 700;">${idx + 1}</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a;">${c.name}</td>
        <td style="padding: 8px 10px; color: #475569;">${c.phone || '-'}</td>
        <td style="padding: 8px 10px; color: #475569;">${c.address || '-'}</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 800;">
          ${bal > 0 ? `<span style="color:#dc2626;">+ ${formatCurrency(bal)} (You'll Get / బాకీ)</span>` : bal < 0 ? `<span style="color:#16a34a;">- ${formatCurrency(Math.abs(bal))} (You'll Give)</span>` : '<span style="color:#94a3b8;">Settled (₹0)</span>'}
        </td>
      </tr>
    `;
  }).join('');

  offscreenContainer.innerHTML = `
    <div style="width: 800px; min-height: 1123px; padding: 32px; background: #ffffff; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="border-bottom: 2px solid #d97706; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 22px; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase;">${businessName}</h1>
            <p style="font-size: 12px; color: #92400e; font-weight: 600; margin: 4px 0 0 0;">Overall Business Ledger & Customer Balance Summary</p>
          </div>
          <div style="text-align: right;">
            <div style="background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; display: inline-block;">
              BUSINESS LEDGER REPORT
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Date: ${formatDate(new Date())}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 22px;">
          <div style="background: #fff1f2; border: 2px solid #fecdd3; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; color: #9f1239; text-transform: uppercase;">TOTAL YOU'LL GET (బాకీ)</div>
            <div style="font-size: 20px; font-weight: 900; color: #be123c; margin-top: 4px;">${formatCurrency(totalGet)}</div>
          </div>
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase;">TOTAL YOU'LL GIVE</div>
            <div style="font-size: 20px; font-weight: 900; color: #14532d; margin-top: 4px;">${formatCurrency(totalGive)}</div>
          </div>
          <div style="background: #fefce8; border: 2px solid #fef08a; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; color: #854d0e; text-transform: uppercase;">NET LEDGER BALANCE</div>
            <div style="font-size: 20px; font-weight: 900; color: #713f12; margin-top: 4px;">${formatCurrency(netBalance)}</div>
          </div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 800; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 8px 10px; text-align: center; width: 35px;">#</th>
                <th style="padding: 8px 10px;">Customer Name / కస్టమర్ పేరు</th>
                <th style="padding: 8px 10px;">Phone</th>
                <th style="padding: 8px 10px;">Address</th>
                <th style="padding: 8px 10px; text-align: right;">Net Balance Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 10px; color: #94a3b8;">
        JewelLedger Certified Business Accounts • Generated on ${formatDate(new Date())}
      </div>
    </div>
  `;

  document.body.appendChild(offscreenContainer);

  try {
    const filename = `${businessName.replace(/\s+/g, '_')}_Business_Report.pdf`;
    await exportElementToPdf(offscreenContainer, filename);
  } finally {
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }
}
