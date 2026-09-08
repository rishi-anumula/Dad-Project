/**
 * Bullion Rates Service Client
 * Fetches real-time Gold & Silver spot prices from server endpoint (/api/rates?city=slug)
 * with robust multi-city domestic retail fallback.
 */

const CITY_BENCHMARKS = {
  hyderabad: { name: 'Hyderabad', g24: 16298, g22: 14940, g18: 12224, s999: 265 },
  delhi: { name: 'Delhi', g24: 16313, g22: 14955, g18: 12239, s999: 260 },
  vijayawada: { name: 'Vijayawada', g24: 16298, g22: 14940, g18: 12224, s999: 265 },
  kolkata: { name: 'Kolkata', g24: 16298, g22: 14940, g18: 12224, s999: 260 },
  mumbai: { name: 'Mumbai', g24: 16298, g22: 14940, g18: 12224, s999: 260 },
  chennai: { name: 'Chennai', g24: 16298, g22: 14940, g18: 12710, s999: 265 },
  bangalore: { name: 'Bengaluru', g24: 16298, g22: 14940, g18: 12224, s999: 260 },
  ahmedabad: { name: 'Ahmedabad', g24: 16303, g22: 14945, g18: 12229, s999: 260 }
};

export async function fetchLiveBullionRates(citySlug = 'hyderabad') {
  const city = (citySlug || 'hyderabad').toLowerCase();
  const CACHE_STORAGE_KEY = `khatabook_cached_rates_${city}`;

  // 1. Try to fetch live rates if browser has network connection
  if (navigator.onLine !== false) {
    try {
      // Primary: Call server domestic rate scraper endpoint with city query
      let res = await fetch(`/api/rates?city=${city}`, { cache: 'no-store' });
      if (!res.ok) {
        res = await fetch(`/api/live-rates?city=${city}`, { cache: 'no-store' });
      }
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const livePayload = {
            timestamp: data.timestamp || new Date().toISOString(),
            city: data.city || city,
            cityName: data.cityName || CITY_BENCHMARKS[city]?.name || city,
            rates: data.rates,
            isLiveConnected: true,
            isOffline: false,
            source: data.source || `${CITY_BENCHMARKS[city]?.name || city} Retail Benchmark`
          };

          // Save to localStorage for offline readiness
          try {
            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(livePayload));
            localStorage.setItem('khatabook_last_known_rates', JSON.stringify(livePayload));
          } catch (storageErr) {
            console.warn('Unable to persist rates in localStorage', storageErr);
          }

          return livePayload;
        }
      }
    } catch (err) {
      console.warn(`Server endpoint unavailable for city ${city}, falling back to cached/domestic benchmark...`, err);
    }
  }

  // 2. Offline / Network error fallback: Try loading last cached rates from localStorage
  try {
    const saved = localStorage.getItem(CACHE_STORAGE_KEY) || localStorage.getItem('khatabook_last_known_rates');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rates) {
        return {
          ...parsed,
          isLiveConnected: false,
          isOffline: true,
          source: `Using cached rates (${parsed.cityName || city})`
        };
      }
    }
  } catch (err) {
    console.warn('Failed reading cached rates from localStorage', err);
  }

  // 3. Built-in domestic retail benchmark fallback (works 100% offline with zero network)
  const bench = CITY_BENCHMARKS[city] || CITY_BENCHMARKS.hyderabad;
  const gold24kPerGram = bench.g24;
  const gold22kPerGram = bench.g22;
  const gold18kPerGram = bench.g18;
  const silver999PerGram = bench.s999;
  const silver925PerGram = +(silver999PerGram * 0.925).toFixed(2);

  return {
    timestamp: new Date().toISOString(),
    city: city,
    cityName: bench.name,
    isLiveConnected: false,
    isOffline: true,
    source: `Using cached rates (${bench.name} Benchmark)`,
    rates: {
      gold24k: {
        perGram: gold24kPerGram,
        per8g: +(gold24kPerGram * 8).toFixed(2),
        per10g: +(gold24kPerGram * 10).toFixed(2),
        perTola: +(gold24kPerGram * 11.6638).toFixed(2),
        change: { diff: 0, percent: 0, isUp: true }
      },
      gold22k: {
        perGram: gold22kPerGram,
        per8g: +(gold22kPerGram * 8).toFixed(2),
        per10g: +(gold22kPerGram * 10).toFixed(2),
        perTola: +(gold22kPerGram * 11.6638).toFixed(2),
        change: { diff: 0, percent: 0, isUp: true }
      },
      gold18k: {
        perGram: gold18kPerGram,
        per8g: +(gold18kPerGram * 8).toFixed(2),
        per10g: +(gold18kPerGram * 10).toFixed(2),
        perTola: +(gold18kPerGram * 11.6638).toFixed(2),
        change: { diff: 0, percent: 0, isUp: true }
      },
      silver999: {
        perGram: silver999PerGram,
        per8g: +(silver999PerGram * 8).toFixed(2),
        per100g: +(silver999PerGram * 100).toFixed(2),
        perKg: +(silver999PerGram * 1000).toFixed(2),
        change: { diff: 0, percent: 0, isUp: true }
      },
      silver925: {
        perGram: silver925PerGram,
        per8g: +(silver925PerGram * 8).toFixed(2),
        per100g: +(silver925PerGram * 100).toFixed(2),
        perKg: +(silver925PerGram * 1000).toFixed(2),
        change: { diff: 0, percent: 0, isUp: true }
      }
    }
  };
}

/**
 * Calculate metal item valuation based on purity & weight:
 * Item Total = (Net Weight in grams * Selected Purity Rate) + Making Charges/Wastage
 */
export function calculateMetalValuation(purity, weightGrams, makingCharges = 0, currentRates) {
  if (!weightGrams || weightGrams <= 0 || !currentRates) return 0;
  
  let ratePerGram = 0;
  switch (purity) {
    case '24K': 
      ratePerGram = currentRates.gold24k?.perGram || 0; 
      break;
    case '22K': 
      ratePerGram = currentRates.gold22k?.perGram || 0; 
      break;
    case '18K': 
      ratePerGram = currentRates.gold18k?.perGram || 0; 
      break;
    case '999 Silver': 
    case 'Silver 999':
      ratePerGram = currentRates.silver999?.perGram || 0; 
      break;
    case '925 Silver': 
    case 'Silver 925':
      ratePerGram = currentRates.silver925?.perGram || 0; 
      break;
    default: 
      ratePerGram = currentRates.gold22k?.perGram || 0; 
      break;
  }

  const metalValue = weightGrams * ratePerGram;
  const totalValue = metalValue + (Number(makingCharges) || 0);
  return +totalValue.toFixed(2);
}


