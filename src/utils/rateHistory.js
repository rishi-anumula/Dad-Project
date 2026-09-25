/**
 * Rate History, Trends & Forecast Engine
 * ---------------------------------------
 * Powers "Live prices -> Current trends" and "Expected prices for upcoming products".
 *
 * - Every live-rate refresh is recorded as a per-city daily snapshot in localStorage.
 * - If fewer than MIN_REAL_POINTS real days exist, a deterministic (seeded) backfill
 *   of ~90 days is generated that smoothly converges into today's REAL rate so charts
 *   and forecasts work from day one. Backfilled points are flagged `estimated: true`.
 * - Trends: 1d/7d/30d change, high/low/avg, volatility & direction.
 * - Forecast: blended linear-regression + momentum projection with an expanding
 *   confidence band, used to compute expected prices for upcoming products.
 */

const HISTORY_PREFIX = 'khatabook_rate_history_v1_';
const MAX_POINTS = 400;
const BACKFILL_DAYS = 90;
export const MIN_REAL_POINTS = 4; // below this, series is marked as estimated

const METAL_KEYS = {
  '24K': 'g24',
  '22K': 'g22',
  '18K': 'g18',
  'SILVER': 's999'
};

/* ---------------------------- storage helpers ---------------------------- */

function storageKey(city) {
  return `${HISTORY_PREFIX}${(city || 'hyderabad').toLowerCase()}`;
}

export function loadRawHistory(city) {
  try {
    const raw = localStorage.getItem(storageKey(city));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[rateHistory] failed to read history', e);
    return [];
  }
}

function saveHistory(city, points) {
  try {
    localStorage.setItem(storageKey(city), JSON.stringify(points.slice(-MAX_POINTS)));
  } catch (e) {
    console.warn('[rateHistory] failed to persist history', e);
  }
}

export function todayKey(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Record (upsert by day) a snapshot of live rates for a city.
 * Called from LedgerContext.refreshRates() after every successful fetch.
 */
export function recordRateSnapshot(city, rates, timestamp) {
  if (!city || !rates) return;
  const g24 = Number(rates?.gold24k?.perGram) || 0;
  const g22 = Number(rates?.gold22k?.perGram) || 0;
  const g18 = Number(rates?.gold18k?.perGram) || 0;
  const s999 = Number(rates?.silver999?.perGram) || 0;
  if (!g24 && !g22 && !s999) return;

  const points = loadRawHistory(city);
  const day = todayKey(timestamp);
  const entry = { date: day, ts: timestamp || new Date().toISOString(), g24, g22, g18, s999, estimated: false };

  const idx = points.findIndex(p => p.date === day);
  if (idx >= 0) points[idx] = entry; // keep freshest quote of the day
  else points.push(entry);

  points.sort((a, b) => (a.date < b.date ? -1 : 1));
  saveHistory(city, points);
}

/* ------------------------------ backfilling ------------------------------ */

// Deterministic PRNG (mulberry32) so backfilled history is stable per city+month
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Build the full analysis series for a city & metal.
 * Returns points: [{ date: 'YYYY-MM-DD', value: number, estimated: boolean }]
 */
export function buildSeries(city, currentRates, metal = '22K') {
  const raw = loadRawHistory(city);
  const metalKey = METAL_KEYS[metal] || 'g22';
  const currentRate = pickCurrentRate(currentRates, metalKey);
  if (!currentRate) return { points: [], isEstimated: false, realCount: raw.length };

  const points = raw.map(p => ({ date: p.date, value: Number(p[metalKey]) || 0, estimated: Boolean(p.estimated) }))
    .filter(p => p.value > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const realCount = points.filter(p => !p.estimated).length;

  if (points.length < 21) {
    // Backfill a plausible 90-day walk that ends exactly at today's real rate.
    const rand = seededRandom(hashString(`${city}-${metal}-${todayKey()}`));
    const dailyVol = metal === 'SILVER' ? 0.006 : 0.004; // silver is choppier
    const drift = (rand() - 0.45) * dailyVol * 0.8;

    const start = new Date();
    start.setDate(start.getDate() - BACKFILL_DAYS);
    const walk = [];
    let v = currentRate * (1 - drift * BACKFILL_DAYS * 0.9);
    for (let i = 0; i < BACKFILL_DAYS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      v = v * (1 + drift + (rand() - 0.5) * 2 * dailyVol);
      walk.push({
        date: todayKey(d),
        value: Math.max(v, currentRate * 0.75),
        estimated: true
      });
    }
    // Pin exact alignment: scale walk so its final value equals today's real rate
    const scale = currentRate / (walk[walk.length - 1]?.value || currentRate);
    const blended = walk.map(p => ({ ...p, value: +(p.value * scale).toFixed(2) }));

    const byDate = new Map(blended.map(p => [p.date, p]));
    for (const p of points) byDate.set(p.date, { ...p, estimated: false });
    const merged = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
    // Guarantee the last point is today's real rate
    merged.push({ date: todayKey(), value: currentRate, estimated: false });
    return { points: merged, isEstimated: true, realCount };
  }

  return { points, isEstimated: false, realCount };
}

function pickCurrentRate(currentRates, metalKey) {
  if (!currentRates) return 0;
  switch (metalKey) {
    case 'g24': return Number(currentRates.gold24k?.perGram) || 0;
    case 'g18': return Number(currentRates.gold18k?.perGram) || 0;
    case 's999': return Number(currentRates.silver999?.perGram) || 0;
    default: return Number(currentRates.gold22k?.perGram) || 0;
  }
}

/* --------------------------------- trends -------------------------------- */

/**
 * Compute trend statistics for a series of points.
 */
export function computeStats(points) {
  if (!points || points.length < 2) return null;
  const n = points.length;
  const current = points[n - 1].value;

  const at = (back) => {
    const idx = n - 1 - back;
    return idx >= 0 ? points[idx].value : points[0].value;
  };

  const day1 = at(1), day7 = at(7), day30 = at(30);
  const pct = (from) => (from > 0 ? ((current - from) / from) * 100 : 0);

  const window30 = points.slice(-30).map(p => p.value);
  const high = Math.max(...window30);
  const low = Math.min(...window30);
  const avg = window30.reduce((a, b) => a + b, 0) / window30.length;

  // volatility: stdev of daily % returns over last 30 points
  const rets = [];
  for (let i = Math.max(1, n - 30); i < n; i++) {
    rets.push((points[i].value - points[i - 1].value) / points[i - 1].value * 100);
  }
  const meanRet = rets.reduce((a, b) => a + b, 0) / rets.length;
  const volatility = Math.sqrt(rets.reduce((a, r) => a + (r - meanRet) ** 2, 0) / rets.length);

  const change7 = pct(day7);
  return {
    current,
    change1d: { abs: +(current - day1).toFixed(2), pct: +pct(day1).toFixed(2) },
    change7d: { abs: +(current - day7).toFixed(2), pct: +change7.toFixed(2) },
    change30d: { abs: +(current - day30).toFixed(2), pct: +pct(day30).toFixed(2) },
    high, low, avg: +avg.toFixed(2), volatility: +volatility.toFixed(2),
    direction: current > day7 ? 'UP' : current < day7 ? 'DOWN' : 'FLAT',
    sparkline: points.slice(-14).map(p => p.value)
  };
}

/* -------------------------------- forecast ------------------------------- */

/**
 * Forecast future values: linear regression over the last `regWindow` points,
 * blended with short-term momentum, plus an expanding confidence band.
 */
export function forecastSeries(points, days = 30, regWindow = 30) {
  if (!points || points.length < 5) return { points: [], summary: null };
  const hist = points.slice(-Math.max(regWindow, 10));
  const n = hist.length;

  // --- Linear regression y = a + b*x ---
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  hist.forEach((p, i) => { sx += i; sy += p.value; sxy += i * p.value; sxx += i * i; });
  const b = (n * sxy - sx * sy) / Math.max(1e-9, (n * sxx - sx * sx));
  const a = (sy - b * sx) / n;

  // --- Momentum: average daily change over last 5 points ---
  const last5 = points.slice(-6);
  let momentum = 0;
  if (last5.length >= 2) {
    for (let i = 1; i < last5.length; i++) momentum += last5[i].value - last5[i - 1].value;
    momentum = momentum / (last5.length - 1);
  }

  // --- Volatility for confidence band ---
  const rets = [];
  for (let i = 1; i < points.length; i++) rets.push((points[i].value - points[i - 1].value) / points[i - 1].value);
  const meanRet = rets.reduce((x, y) => x + y, 0) / Math.max(1, rets.length);
  const vol = Math.sqrt(rets.reduce((x, r) => x + (r - meanRet) ** 2, 0) / Math.max(1, rets.length));

  const anchor = points[points.length - 1];
  const anchorMs = new Date(anchor.date + 'T00:00:00').getTime();
  const DAY = 86400000;
  const lastVal = anchor.value;
  const regrLast = a + b * (n - 1);

  const out = [];
  for (let d = 1; d <= days; d++) {
    const regressVal = a + b * (n - 1 + d);
    // blend regression slope with recent momentum (regression dominates)
    const blended = regressVal + momentum * d * 0.35;
    const smooth = lastVal + (blended - lastVal) * Math.min(1, d / days) * 0.9 + (blended - lastVal) * 0.1;
    const band = Math.abs(smooth - lastVal) * 0.4 + lastVal * vol * Math.sqrt(d) * 1.2;
    out.push({
      date: todayKey(new Date(anchorMs + d * DAY)),
      value: +Math.max(smooth, 1).toFixed(2),
      lo: +Math.max(smooth - band, 1).toFixed(2),
      hi: +(smooth + band).toFixed(2)
    });
  }

  const d30 = out[Math.min(out.length, 30) - 1] || out[out.length - 1];
  const d7 = out[Math.min(out.length, 7) - 1];
  const summary = {
    next7d: d7 ? { value: d7.value, pct: +(((d7.value - lastVal) / lastVal) * 100).toFixed(2) } : null,
    next30d: { value: d30.value, pct: +(((d30.value - lastVal) / lastVal) * 100).toFixed(2) },
    bandLow: d30.lo, bandHigh: d30.hi,
    direction: d30.value > lastVal ? 'UP' : d30.value < lastVal ? 'DOWN' : 'FLAT'
  };
  return { points: out, summary };
}

/** Find forecast value nearest to a target date (e.g. product launch date). */
export function forecastAtDate(forecastPoints, targetDate) {
  if (!forecastPoints?.length || !targetDate) return null;
  const t = todayKey(targetDate);
  let best = forecastPoints[0];
  let bestDiff = Infinity;
  for (const p of forecastPoints) {
    const diff = Math.abs(new Date(p.date) - new Date(t));
    if (diff < bestDiff) { bestDiff = diff; best = p; }
  }
  return best;
}

/* --------------------- expected product pricing math --------------------- */

const PURITY_TO_METAL_RATE = {
  '24K': (r) => r?.gold24k?.perGram || 0,
  '22K': (r) => r?.gold22k?.perGram || 0,
  '18K': (r) => r?.gold18k?.perGram || 0,
  '999 Silver': (r) => r?.silver999?.perGram || 0,
  '925 Silver': (r) => r?.silver925?.perGram || 0
};

/**
 * Expected price of a product either right now (live rates) or on a future
 * date (using forecast). makingCharges can be a flat ₹ amount.
 */
export function expectedProductPrice(product, currentRates, forecastPoints, { gstPercent = 3, includeGst = true } = {}) {
  const rateFn = PURITY_TO_METAL_RATE[product.purity] || PURITY_TO_METAL_RATE['22K'];
  const weight = Number(product.netWeightGrams) || 0;
  const making = Number(product.makingCharges) || 0;

  const rateNow = rateFn(currentRates || {});
  const metalNow = weight * rateNow;
  const totalNow = metalNow + making;
  const gstNow = includeGst ? totalNow * (gstPercent / 100) : 0;

  let future = null;
  if (forecastPoints?.length && product.targetDate) {
    const f = forecastAtDate(forecastPoints, product.targetDate);
    if (f) {
      // scale metal component by forecast ratio of the same purity via current rate
      const ratio = rateNow > 0 ? f.value / rateNow : 1;
      const metalFuture = metalNow * ratio;
      const totalFuture = metalFuture + making;
      const gstFuture = includeGst ? totalFuture * (gstPercent / 100) : 0;
      future = {
        date: f.date,
        metalValue: +metalFuture.toFixed(2),
        total: +(totalFuture + gstFuture).toFixed(2),
        bandLow: null, bandHigh: null,
        ratePerGram: +f.value.toFixed(2)
      };
      if (f.lo && rateNow > 0) future.bandLow = +(metalNow * (f.lo / rateNow) + making * (1 + (includeGst ? gstPercent / 100 : 0))).toFixed(2);
      if (f.hi && rateNow > 0) future.bandHigh = +(metalNow * (f.hi / rateNow) + making * (1 + (includeGst ? gstPercent / 100 : 0))).toFixed(2);
    }
  }

  return {
    ratePerGramNow: +rateNow.toFixed(2),
    metalValueNow: +metalNow.toFixed(2),
    gstNow: +gstNow.toFixed(2),
    totalNow: +(totalNow + gstNow).toFixed(2),
    future
  };
}
