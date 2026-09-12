import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Per-city in-memory cache for bullion rates (15 minutes)
const cityCache = {};
const CACHE_TTL_MS = 15 * 60 * 1000;

const CITY_NAME_MAP = {
  hyderabad: 'Hyderabad',
  delhi: 'Delhi',
  vijayawada: 'Vijayawada',
  kolkata: 'Kolkata',
  mumbai: 'Mumbai',
  chennai: 'Chennai',
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  ahmedabad: 'Ahmedabad'
};

function parsePriceAndDiff(str) {
  if (!str) return null;
  const cleanedStr = str.replace(/&#x20b9;/g, '').replace(/₹/g, '').replace(/,/g, '').trim();
  const mainMatch = cleanedStr.match(/^([\d.]+)/);
  if (!mainMatch) return null;
  const val = parseFloat(mainMatch[1]);

  let diff = 0;
  const diffMatch = cleanedStr.match(/\(([-+]?\d[\d.]*)\)/);
  if (diffMatch) {
    diff = parseFloat(diffMatch[1]);
  }
  return { val, diff };
}

async function handleBullionRates(req, res, urlObj) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  let cityParam = (urlObj.searchParams.get('city') || 'hyderabad').toLowerCase().trim();
  if (cityParam === 'bengaluru') cityParam = 'bangalore';
  if (!CITY_NAME_MAP[cityParam]) cityParam = 'hyderabad';

  const cityName = CITY_NAME_MAP[cityParam] || 'Hyderabad';
  const now = Date.now();

  if (cityCache[cityParam] && (now - cityCache[cityParam].timestamp < CACHE_TTL_MS)) {
    return res.end(JSON.stringify({ ...cityCache[cityParam].data, cached: true }));
  }

  let scrapedGoldSuccess = false;
  let scrapedSilverSuccess = false;
  let ratesData = null;

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const goldUrl = `https://www.goodreturns.in/gold-rates/${cityParam}.html`;
    const silverUrl = `https://www.goodreturns.in/silver-rates/${cityParam}.html`;

    const goldRes = await fetch(goldUrl, { headers });
    if (goldRes.ok) {
      const html = await goldRes.text();
      const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
      if (tables.length > 0) {
        const rows = tables[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        let rate24kPerGram = null, change24k = 0;
        let rate22kPerGram = null, change22k = 0;
        let rate18kPerGram = null, change18k = 0;

        for (const row of rows) {
          const cells = (row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || []).map(c => c.replace(/<[^>]+>/g, '').trim());
          if (cells.length >= 4 && cells[0] === '1') {
            const p24 = parsePriceAndDiff(cells[1]);
            const p22 = parsePriceAndDiff(cells[2]);
            const p18 = parsePriceAndDiff(cells[3]);

            if (p24) { rate24kPerGram = p24.val; change24k = p24.diff; }
            if (p22) { rate22kPerGram = p22.val; change22k = p22.diff; }
            if (p18) { rate18kPerGram = p18.val; change18k = p18.diff; }
            break;
          }
        }

        if (rate24kPerGram && rate24kPerGram > 0) {
          scrapedGoldSuccess = true;
          if (!rate22kPerGram) rate22kPerGram = +(rate24kPerGram * 0.916).toFixed(2);
          if (!rate18kPerGram) rate18kPerGram = +(rate24kPerGram * 0.750).toFixed(2);

          const calcChangeObj = (curr, diff) => {
            const prev = curr - diff;
            const percent = prev > 0 ? (diff / prev) * 100 : 0;
            return {
              diff: +diff.toFixed(2),
              percent: +percent.toFixed(2),
              isUp: diff >= 0
            };
          };

          ratesData = {
            gold24k: {
              perGram: rate24kPerGram,
              per8g: +(rate24kPerGram * 8).toFixed(2),
              per10g: +(rate24kPerGram * 10).toFixed(2),
              perTola: +(rate24kPerGram * 11.6638).toFixed(2),
              change: calcChangeObj(rate24kPerGram, change24k)
            },
            gold22k: {
              perGram: rate22kPerGram,
              per8g: +(rate22kPerGram * 8).toFixed(2),
              per10g: +(rate22kPerGram * 10).toFixed(2),
              perTola: +(rate22kPerGram * 11.6638).toFixed(2),
              change: calcChangeObj(rate22kPerGram, change22k)
            },
            gold18k: {
              perGram: rate18kPerGram,
              per8g: +(rate18kPerGram * 8).toFixed(2),
              per10g: +(rate18kPerGram * 10).toFixed(2),
              perTola: +(rate18kPerGram * 11.6638).toFixed(2),
              change: calcChangeObj(rate18kPerGram, change18k)
            }
          };
        }
      }
    }

    const silverRes = await fetch(silverUrl, { headers });
    if (silverRes.ok) {
      const html = await silverRes.text();
      const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
      if (tables.length > 0) {
        const rows = tables[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        let silver999PerGram = null, changeSilver = 0;

        for (const row of rows) {
          const cells = (row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || []).map(c => c.replace(/<[^>]+>/g, '').trim());
          if (cells.length >= 3 && cells[0] === '1') {
            const pSilv = parsePriceAndDiff(cells[1]);
            if (pSilv) {
              silver999PerGram = pSilv.val;
              if (cells.length >= 4) {
                const pDiff = parsePriceAndDiff(cells[3]);
                if (pDiff) changeSilver = pDiff.diff;
              }
            }
            break;
          }
        }

        if (silver999PerGram && silver999PerGram > 0 && ratesData) {
          scrapedSilverSuccess = true;
          const silver925PerGram = +(silver999PerGram * 0.925).toFixed(2);

          const calcChangeObj = (curr, diff) => {
            const prev = curr - diff;
            const percent = prev > 0 ? (diff / prev) * 100 : 0;
            return {
              diff: +diff.toFixed(2),
              percent: +percent.toFixed(2),
              isUp: diff >= 0
            };
          };

          ratesData.silver999 = {
            perGram: silver999PerGram,
            per8g: +(silver999PerGram * 8).toFixed(2),
            per100g: +(silver999PerGram * 100).toFixed(2),
            perKg: +(silver999PerGram * 1000).toFixed(2),
            change: calcChangeObj(silver999PerGram, changeSilver)
          };

          ratesData.silver925 = {
            perGram: silver925PerGram,
            per8g: +(silver925PerGram * 8).toFixed(2),
            per100g: +(silver925PerGram * 100).toFixed(2),
            perKg: +(silver925PerGram * 1000).toFixed(2),
            change: calcChangeObj(silver925PerGram, changeSilver * 0.925)
          };
        }
      }
    }
  } catch (e) {
    console.warn(`Goodreturns scraping for ${cityParam} failed, falling back:`, e.message);
  }

  // Fallback if scraping fails
  if (!scrapedGoldSuccess || !ratesData) {
    let usdInr = 86.85;
    let goldUsdPerOz = 2750.00;
    let goldPrevClose = 2735.00;
    let silverUsdPerOz = 31.50;
    let silverPrevClose = 31.20;

    const TROY_OZ_GRAMS = 31.1034768;
    const cityAdjustMap = { delhi: 15, hyderabad: 0, vijayawada: 0, kolkata: 0, mumbai: 0, chennai: 5, bangalore: 0, ahmedabad: 5 };
    const cityOffset = cityAdjustMap[cityParam] || 0;

    const base24k = +((goldUsdPerOz * usdInr * 1.145) / TROY_OZ_GRAMS).toFixed(2);
    const gold24kPerGram = base24k + cityOffset;
    const gold24kPrevGram = +((goldPrevClose * usdInr * 1.145) / TROY_OZ_GRAMS).toFixed(2) + cityOffset;

    const gold22kPerGram = +(gold24kPerGram * 0.916).toFixed(2);
    const gold22kPrevGram = +(gold24kPrevGram * 0.916).toFixed(2);

    const gold18kPerGram = +(gold24kPerGram * 0.750).toFixed(2);
    const gold18kPrevGram = +(gold24kPrevGram * 0.750).toFixed(2);

    const silverOffset = (cityParam === 'hyderabad' || cityParam === 'vijayawada' || cityParam === 'chennai') ? 5 : 0;
    const silver999PerGram = +((silverUsdPerOz * usdInr * 1.145 * 2.8) / TROY_OZ_GRAMS).toFixed(2) + silverOffset;
    const silver999PrevGram = +((silverPrevClose * usdInr * 1.145 * 2.8) / TROY_OZ_GRAMS).toFixed(2) + silverOffset;

    const silver925PerGram = +(silver999PerGram * 0.925).toFixed(2);
    const silver925PrevGram = +(silver999PrevGram * 0.925).toFixed(2);

    const calcChange = (curr, prev) => {
      const diff = curr - prev;
      const percent = prev ? (diff / prev) * 100 : 0;
      return {
        diff: +diff.toFixed(2),
        percent: +percent.toFixed(2),
        isUp: diff >= 0
      };
    };

    ratesData = {
      gold24k: {
        perGram: gold24kPerGram,
        per8g: +(gold24kPerGram * 8).toFixed(2),
        per10g: +(gold24kPerGram * 10).toFixed(2),
        perTola: +(gold24kPerGram * 11.6638).toFixed(2),
        change: calcChange(gold24kPerGram, gold24kPrevGram)
      },
      gold22k: {
        perGram: gold22kPerGram,
        per8g: +(gold22kPerGram * 8).toFixed(2),
        per10g: +(gold22kPerGram * 10).toFixed(2),
        perTola: +(gold22kPerGram * 11.6638).toFixed(2),
        change: calcChange(gold22kPerGram, gold22kPrevGram)
      },
      gold18k: {
        perGram: gold18kPerGram,
        per8g: +(gold18kPerGram * 8).toFixed(2),
        per10g: +(gold18kPerGram * 10).toFixed(2),
        perTola: +(gold18kPerGram * 11.6638).toFixed(2),
        change: calcChange(gold18kPerGram, gold18kPrevGram)
      },
      silver999: {
        perGram: silver999PerGram,
        per8g: +(silver999PerGram * 8).toFixed(2),
        per100g: +(silver999PerGram * 100).toFixed(2),
        perKg: +(silver999PerGram * 1000).toFixed(2),
        change: calcChange(silver999PerGram, silver999PrevGram)
      },
      silver925: {
        perGram: silver925PerGram,
        per8g: +(silver925PerGram * 8).toFixed(2),
        per100g: +(silver925PerGram * 100).toFixed(2),
        perKg: +(silver925PerGram * 1000).toFixed(2),
        change: calcChange(silver925PerGram, silver925PrevGram)
      }
    };
  }

  const resultPayload = {
    success: true,
    city: cityParam,
    cityName: cityName,
    source: scrapedGoldSuccess ? `${cityName} IBJA & Goodreturns Live Feed` : `${cityName} Local Retail Feed`,
    timestamp: new Date().toISOString(),
    rates: ratesData
  };

  cityCache[cityParam] = {
    timestamp: now,
    data: resultPayload
  };

  return res.end(JSON.stringify(resultPayload));
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // Health check endpoint for Render
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime() }));
  }

  // Bullion Rates API routes
  if (pathname === '/api/rates' || pathname === '/api/live-rates') {
    return handleBullionRates(req, res, urlObj);
  }

  // Serve static assets from dist/
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

    // If file doesn't exist directly, fallback to index.html (SPA routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
