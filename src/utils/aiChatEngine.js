/**
 * AI Chat Engine — "Jewel AI"
 * ---------------------------
 * A shop-aware assistant that answers questions about THIS shop's ledger,
 * live bullion rates, current trends and expected prices for upcoming products.
 *
 * Two brains:
 *  1. LOCAL (default, 100% offline): deterministic intent engine that computes
 *     answers directly from LedgerContext + rateHistory data.
 *  2. LLM (optional): if the shop owner saves a Gemini / OpenAI API key in
 *     Shop Preferences, questions are answered by the LLM with the shop's
 *     live data injected as context. Falls back to LOCAL on any error.
 */

import { formatCurrency, formatDate } from './formatters';
import { buildSeries, computeStats, forecastSeries } from './rateHistory';

/* ------------------------------ context build ----------------------------- */

export function buildShopContext(ledger, prefs) {
  const {
    businessName, customers, transactions, inventoryItems,
    totalYouWillGet, totalYouWillGive, netBusinessBalance,
    bullionRates, selectedCity, ratesLastUpdated, isLiveConnected
  } = ledger;

  const city = selectedCity || 'hyderabad';
  const series22 = buildSeries(city, bullionRates, '22K');
  const stats22 = computeStats(series22.points);
  const forecast22 = forecastSeries(series22.points, prefs?.forecastHorizonDays || 30);

  const lowStock = (inventoryItems || []).filter(i => (i.stockQty ?? 0) <= 2);
  const catalogValue = (inventoryItems || []).reduce((acc, i) => acc + (Number(i.fixedUnitPrice) || 0) * Math.max(1, Number(i.stockQty) || 0), 0);

  const debtors = (customers || [])
    .filter(c => c.netBalance > 0)
    .sort((a, b) => b.netBalance - a.netBalance)
    .slice(0, 5);

  return {
    businessName,
    city,
    ratesLastUpdated,
    isLiveConnected,
    rates: bullionRates ? {
      gold24kPerGram: bullionRates.gold24k?.perGram,
      gold22kPerGram: bullionRates.gold22k?.perGram,
      gold18kPerGram: bullionRates.gold18k?.perGram,
      silver999PerGram: bullionRates.silver999?.perGram,
      silver925PerGram: bullionRates.silver925?.perGram
    } : null,
    trend22k: stats22 ? {
      change1dPct: stats22.change1d.pct,
      change7dPct: stats22.change7d.pct,
      change30dPct: stats22.change30d.pct,
      direction: stats22.direction,
      volatilityPct: stats22.volatility,
      high30d: stats22.high, low30d: stats22.low
    } : null,
    forecast22k: forecast22.summary ? {
      next7dValue: forecast22.summary.next7d?.value,
      next7dPct: forecast22.summary.next7d?.pct,
      next30dValue: forecast22.summary.next30d?.value,
      next30dPct: forecast22.summary.next30d?.pct
    } : null,
    totals: {
      youWillGet: totalYouWillGet || 0,
      youWillGive: totalYouWillGive || 0,
      net: netBusinessBalance || 0
    },
    customerCount: (customers || []).length,
    topDebtors: debtors.map(c => ({ name: c.name, balance: c.netBalance, phone: c.phone || '' })),
    transactionCount: (transactions || []).length,
    inventory: {
      itemCount: (inventoryItems || []).length,
      lowStock: lowStock.map(i => ({ name: i.name, stockQty: i.stockQty || 0 })),
      estimatedCatalogValue: catalogValue
    },
    preferences: {
      currency: prefs?.currency || '₹',
      gstPercent: prefs?.gstPercent ?? 3
    }
  };
}

/* ------------------------------ local answers ----------------------------- */

const fmt = (n) => formatCurrency(n);

function rateLines(rates) {
  if (!rates) return 'Rates are still loading. Please try again in a few seconds.';
  return [
    `📍 **Today's bullion rates** (${fmt(rates.gold22kPerGram)}/g for 22K gold):`,
    `• Gold 24K: ${fmt(rates.gold24kPerGram)}/g`,
    `• Gold 22K: ${fmt(rates.gold22kPerGram)}/g`,
    `• Gold 18K: ${fmt(rates.gold18kPerGram)}/g`,
    `• Silver 999: ${fmt(rates.silver999PerGram)}/g`,
    `• Silver 925: ${fmt(rates.silver925PerGram)}/g`
  ].join('\n');
}

function tryLocalAnswer(q, ctx) {
  const question = q.toLowerCase().trim();
  const has = (...words) => words.some(w => question.includes(w));

  /* Greetings */
  if (/^(hi|hii+|hello|hey|namaste|namaskaram|vanakkam|good\s*(morning|evening|afternoon))\b/.test(question)) {
    return `🙏 Namaste! I'm **Jewel AI**, ${ctx.businessName}'s assistant.\n\nI can help you with:\n• Today's gold & silver rates\n• Price trends and forecasts\n• Who owes you money / ledger balances\n• Stock & catalog insights\n\nTry: *"What's the gold trend this week?"*`;
  }

  if (has('thank')) return `Happy to help! 😊 Anything else about rates, trends or your ledger?`;

  /* Help */
  if (has('help', 'what can you do', 'features')) {
    return `Here's what I can do for you:\n\n1️⃣ **Live rates** — *"What's today's gold rate?"*\n2️⃣ **Trends** — *"Is gold going up or down?"*, *"Silver trend"*\n3️⃣ **Forecasts** — *"Expected gold price next week?"*\n4️⃣ **Ledger** — *"Who owes me the most?"*, *"Total to receive"*, or ask about a customer by name\n5️⃣ **Stock** — *"Low stock items?"*, *"Catalog value?"*\n\n💡 Tip: connect Gemini/OpenAI in Shop Preferences for free-form answers.`;
  }

  /* ---- Rates ---- */
  const asksGold = has('gold');
  const asksSilver = has('silver');
  const asksRate = has('rate', 'price', 'how much is', 'today');

  if ((asksGold || asksSilver) && asksRate && !has('trend', 'forecast', 'expected', 'tomorrow', 'next week', 'next month')) {
    if (asksGold && !asksSilver) {
      return `🥇 **Gold rates** (per gram, ${ctx.city}):\n• 24K: **${fmt(ctx.rates?.gold24kPerGram)}**\n• 22K: **${fmt(ctx.rates?.gold22kPerGram)}**\n• 18K: **${fmt(ctx.rates?.gold18kPerGram)}**\n\n${ctx.isLiveConnected ? '🟢 Live feed connected' : '🟡 Showing cached rates'} • Updated ${formatDate(ctx.ratesLastUpdated)}`;
    }
    if (asksSilver && !asksGold) {
      return `🥈 **Silver rates** (${ctx.city}):\n• 999: **${fmt(ctx.rates?.silver999PerGram)}/g**\n• 925: **${fmt(ctx.rates?.silver925PerGram)}/g**\n\n${ctx.isLiveConnected ? '🟢 Live feed connected' : '🟡 Showing cached rates'}`;
    }
    return rateLines(ctx.rates);
  }

  if (has('silver') && has('rate', 'price')) {
    return `🥈 **Silver rates** (${ctx.city}):\n• 999: **${fmt(ctx.rates?.silver999PerGram)}/g**\n• 925: **${fmt(ctx.rates?.silver925PerGram)}/g**`;
  }

  /* ---- Trends ---- */
  if (has('trend', 'going up', 'going down', 'up or down', 'history', 'rising', 'falling')) {
    if (!ctx.trend22k) return 'I need a bit more rate history before I can analyse trends. Check back tomorrow!';
    const t = ctx.trend22k;
    const metal = asksSilver ? 'Silver' : 'Gold (22K)';
    const emoji = t.direction === 'UP' ? '📈' : t.direction === 'DOWN' ? '📉' : '➡️';
    return `${emoji} **${metal} trend** (${ctx.city}):\n\n• Today: ${fmt(asksSilver ? ctx.rates?.silver999PerGram : ctx.rates?.gold22kPerGram)}/g\n• 1-day change: **${t.change1dPct > 0 ? '+' : ''}${t.change1dPct}%**\n• 7-day change: **${t.change7dPct > 0 ? '+' : ''}${t.change7dPct}%**\n• 30-day change: **${t.change30dPct > 0 ? '+' : ''}${t.change30dPct}%**\n• 30-day range: ${fmt(t.low30d)} – ${fmt(t.high30d)}\n• Volatility: ${t.volatilityPct}%/day (${t.volatilityPct > 0.5 ? 'choppy ⚠️' : 'calm ✅'})\n\nThe short-term direction is **${t.direction}**. Open the *Live Rates* tab to see the full chart.`;
  }

  /* ---- Forecast / expected price ---- */
  if (has('forecast', 'predict', 'expected', 'tomorrow', 'next week', 'next month', 'future price')) {
    if (!ctx.forecast22k) return 'I need more rate history to forecast. Give me a few days of snapshots!';
    const f = ctx.forecast22k;
    return `🔮 **Gold (22K) forecast** for ${ctx.city}:\n\n• In ~7 days: **${fmt(f.next7dValue)}/g** (${f.next7dPct > 0 ? '+' : ''}${f.next7dPct}%)\n• In ~30 days: **${fmt(f.next30dValue)}/g** (${f.next30dPct > 0 ? '+' : ''}${f.next30dPct}%)\n\n${f.next30dPct > 1 ? '💡 Trend points **up** — if you are planning purchases for upcoming products, locking rates early may save money.' : f.next30dPct < -1 ? '💡 Trend points **down** — you may benefit from waiting before bulk purchases.' : '💡 Trend looks **stable** — no strong signal either way.'}\n\n⚠️ *Statistical estimate (regression + momentum), not investment advice.*\n\nSee the **Expected Prices** section under Live Rates to price specific upcoming products.`;
  }

  /* ---- Ledger: who owes ---- */
  if (has('owe', 'udhaar', 'udhar', 'due', 'debt', 'credit', 'receivable', 'top customer', 'balance')) {
    if (has('total', 'overall', 'summary')) {
      return `📒 **Ledger summary:**\n\n• Total to **receive**: ${fmt(ctx.totals.youWillGet)}\n• Total to **give**: ${fmt(ctx.totals.youWillGive)}\n• Net position: **${fmt(ctx.totals.net)}** ${ctx.totals.net >= 0 ? '(in your favour ✅)' : '(payable ❌)'}\n• ${ctx.customerCount} customers • ${ctx.transactionCount} entries`;
    }
    if (!ctx.topDebtors.length) return `🎉 Great news — **nobody owes you money right now!**\n\nLedger totals: receive ${fmt(ctx.totals.youWillGet)} • give ${fmt(ctx.totals.youWillGive)}.`;
    const lines = ctx.topDebtors.map((c, i) => `${i + 1}. **${c.name}** — owes ${fmt(c.balance)}${c.phone ? ` (${c.phone})` : ''}`);
    return `💰 **Top customers who owe you** (total to receive: ${fmt(ctx.totals.youWillGet)}):\n\n${lines.join('\n')}\n\nOpen a customer in the Dashboard to send a WhatsApp reminder.`;
  }

  /* ---- Specific customer lookup ---- */
  const cust = (ctx.customersRaw || []).find(c => c.name && question.includes(c.name.toLowerCase()));
  if (cust) {
    const owes = cust.netBalance > 0;
    return `👤 **${cust.name}**${cust.tag ? ` (${cust.tag})` : ''}\n\n• Balance: **${fmt(Math.abs(cust.netBalance))} ${owes ? 'owes you' : 'you owe them'}**\n• ${cust.transactionCount} entries in ledger${cust.phone ? `\n• Phone: ${cust.phone}` : ''}\n\n${owes ? '📲 Use WhatsApp reminder from their ledger page.' : '✅ Account is clear or in your payable side.'}`;
  }

  /* ---- Inventory / stock ---- */
  if (has('stock', 'inventory', 'catalog', 'catalogue', 'items')) {
    if (has('low', 'running out', 'alert')) {
      if (!ctx.inventory.lowStock.length) return '✅ No low-stock alerts — every catalog item has healthy stock (more than 2).';
      const lines = ctx.inventory.lowStock.map(i => `• **${i.name}** — only ${i.stockQty} left`);
      return `⚠️ **Low stock alert!**\n\n${lines.join('\n')}\n\nConsider restocking or reordering these pieces.`;
    }
    return `💎 **Catalog snapshot:**\n\n• ${ctx.inventory.itemCount} items in catalog\n• Estimated catalog value: **${fmt(ctx.inventory.estimatedCatalogValue)}**\n• ${ctx.inventory.lowStock.length} items low on stock\n\nManage everything in the *Items Catalog* tab.`;
  }

  /* ---- Business summary ---- */
  if (has('business', 'summary', 'how is', 'sales', 'revenue', 'status')) {
    return `📊 **${ctx.businessName} — snapshot:**\n\n• Receivables: **${fmt(ctx.totals.youWillGet)}** from customers\n• Payables: ${fmt(ctx.totals.youWillGive)}\n• Net position: **${fmt(ctx.totals.net)}**\n• Customers: ${ctx.customerCount} • Entries: ${ctx.transactionCount}\n• Gold 22K today: ${fmt(ctx.rates?.gold22kPerGram)}/g (${ctx.trend22k ? `${ctx.trend22k.change7dPct > 0 ? '+' : ''}${ctx.trend22k.change7dPct}% this week` : 'trend loading'})\n\nAsk *"who owes me the most?"* for the top debtors.`;
  }

  return null; // no local intent matched
}

/* -------------------------------- LLM brain ------------------------------- */

function buildLlmSystemPrompt(ctx) {
  return `You are "Jewel AI", the assistant inside ${ctx.businessName}'s jewelry-shop ledger app (JewelLedger) in India.
Answer briefly (under 180 words), in a warm, practical tone for a shop owner. Use ₹ formatting like ₹1,23,456.
You may give general jewelry-business advice. For price forecasts, remind that estimates are statistical, not investment advice.
NEVER invent data that contradicts the live shop context below.

LIVE SHOP CONTEXT (source of truth):
${JSON.stringify(ctx, null, 1)}`;
}

async function askGemini(question, ctx, prefs) {
  const model = prefs.chatModel || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(prefs.chatApiKey)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildLlmSystemPrompt(ctx) }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 }
      })
    });
    if (!res.ok) throw new Error(`Gemini API ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('\n');
    if (!text) throw new Error('Empty Gemini response');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function askOpenAI(question, ctx, prefs) {
  const model = prefs.chatModel || 'gpt-4o-mini';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${prefs.chatApiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: 'system', content: buildLlmSystemPrompt(ctx) },
          { role: 'user', content: question }
        ]
      })
    });
    if (!res.ok) throw new Error(`OpenAI API ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty OpenAI response');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------ main dispatcher --------------------------- */

/**
 * Get an assistant reply for a question.
 * @param {string} question
 * @param {object} ctx   shop context from buildShopContext()
 * @param {object} prefs shop preferences (chatProvider, chatApiKey, chatModel)
 * @param {object} ledgerExtra raw customers list for name matching
 * @returns {Promise<{text: string, engine: 'local'|'llm'}>}
 */
export async function getAssistantReply(question, ctx, prefs, ledgerExtra = {}) {
  const ctxWithCustomers = { ...ctx, customersRaw: (ledgerExtra.customers || []).map(c => ({ name: c.name, netBalance: c.netBalance, tag: c.tag, phone: c.phone, transactionCount: c.transactionCount })) };

  // Try LLM first when configured
  if (prefs?.chatProvider !== 'local' && prefs?.chatApiKey) {
    try {
      const text = prefs.chatProvider === 'openai'
        ? await askOpenAI(question, ctxWithCustomers, prefs)
        : await askGemini(question, ctxWithCustomers, prefs);
      return { text, engine: 'llm' };
    } catch (err) {
      console.warn('[aiChat] LLM failed, using local brain:', err.message);
      const local = tryLocalAnswer(question, ctxWithCustomers);
      return {
        text: local || `⚠️ I couldn't reach the AI service (${err.message}), and I don't have a built-in answer for that.\n\nTry asking about rates, trends, ledger balances or stock.`,
        engine: 'local'
      };
    }
  }

  // Small delay so the typing indicator feels natural on instant answers
  const local = tryLocalAnswer(question, ctxWithCustomers);
  if (local) {
    await new Promise(r => setTimeout(r, 350));
    return { text: local, engine: 'local' };
  }

  return {
    text: `🤔 I'm best at questions about:\n\n• **Rates** — "What's today's 22K gold rate?"\n• **Trends** — "Is gold going up or down?"\n• **Forecast** — "Expected price next week?"\n• **Ledger** — "Who owes me the most?" or a customer's name\n• **Stock** — "Any low stock items?"\n\n💡 For free-form questions, add a free Gemini or OpenAI API key in **Shop Preferences → AI Assistant**.`,
    engine: 'local'
  };
}
