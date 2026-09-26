import React, { useState, useMemo, useEffect } from 'react';
import { useLedger } from '../context/LedgerContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineController
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp, TrendingDown, Activity, CalendarRange, CalendarDays,
  ArrowUpRight, ArrowDownRight, Info, Zap, BarChart3
} from 'lucide-react';
import { buildSeries, computeStats, forecastSeries, MIN_REAL_POINTS } from '../utils/rateHistory';

ChartJS.register(LineElement, PointElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, LineController);

const METALS = [
  { id: '24K', label: 'Gold 24K', seriesKey: 'g24' },
  { id: '22K', label: 'Gold 22K', seriesKey: 'g22' },
  { id: '18K', label: 'Gold 18K', seriesKey: 'g18' },
  { id: 'SILVER', label: 'Silver 999', seriesKey: 's999' }
];

/**
 * Feature: "Live prices -> Current trends"
 * 90-day rate history chart (recorded daily snapshots) + 30-day forecast overlay
 * and 1d / 7d / 30d trend statistic cards.
 */
export function RateTrends() {
  const { bullionRates, selectedCity, ratesLastUpdated, darkMode } = useLedger();
  const { formatMoney, preferences } = usePreferences();
  const [metal, setMetal] = useState('22K');

  // Rebuild series whenever rates update (refreshRecords snapshot in LedgerContext)
  const analysis = useMemo(() => {
    const city = selectedCity || 'hyderabad';
    const { points, isEstimated, realCount } = buildSeries(city, bullionRates, metal);
    return {
      points,
      isEstimated,
      realCount,
      stats: computeStats(points),
      forecast: forecastSeries(points, preferences.forecastHorizonDays || 30)
    };
  }, [bullionRates, selectedCity, metal, ratesLastUpdated, preferences.forecastHorizonDays]);

  if (!analysis.stats || analysis.points.length < 3) {
    return null;
  }

  const stats = analysis.stats;
  const forecast = analysis.forecast;
  const isUp = stats.direction === 'UP';
  const gridColor = darkMode ? 'rgba(233,199,107,0.09)' : 'rgba(95,87,73,0.12)';
  const tickColor = darkMode ? '#a89f8c' : '#7e7565';

  // Show last 90 days history + forecast horizon
  const historyPoints = analysis.points.slice(-90);
  const labels = historyPoints.map(p => p.date.slice(5)); // MM-DD
  const values = historyPoints.map(p => p.value);

  // Forecast dataset (starts at last history point for visual continuity)
  const forecastLabels = forecast.points.map(p => p.date.slice(5));
  const forecastValues = [values[values.length - 1], ...forecast.points.map(p => p.value)];
  const forecastLo = [null, ...forecast.points.map(p => p.lo)];
  const forecastHi = [null, ...forecast.points.map(p => p.hi)];

  const chartData = {
    labels: [...labels, ...forecastLabels],
    datasets: [
      {
        label: `${METALS.find(m => m.id === metal)?.label} history`,
        data: [...values, ...forecastLabels.map(() => null)],
        borderColor: isUp ? '#f59e0b' : '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2.5
      },
      {
        label: 'AI forecast',
        data: [...Array(labels.length - 1).fill(null), ...forecastValues],
        borderColor: '#e9c76b',
        borderDash: [6, 5],
        backgroundColor: 'rgba(233,199,107,0.06)',
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Upper band',
        data: [...Array(labels.length - 1).fill(null), ...forecastHi],
        borderColor: 'rgba(233,199,107,0.22)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1',
        backgroundColor: 'rgba(233,199,107,0.12)',
        tension: 0.35
      },
      {
        label: 'Lower band',
        data: [...Array(labels.length - 1).fill(null), ...forecastLo],
        borderColor: 'rgba(233,199,107,0.22)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        backgroundColor: 'rgba(233,199,107,0.12)',
        tension: 0.35
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? '#1f1b15' : '#faf9f5',
        titleColor: darkMode ? '#f3f0e9' : '#1f1b15',
        bodyColor: darkMode ? '#d5ccba' : '#5f5749',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (item) => item.raw != null ? `${item.dataset.label}: ${formatMoney(item.raw, { decimals: 2 })}/g` : null
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, maxTicksLimit: 10, font: { size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { size: 10 },
          callback: (v) => formatMoney(v)
        }
      }
    }
  };

  const StatCard = ({ icon: Icon, label, value, sub, tone }) => (
    <div className="glass-card rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center space-x-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${tone || 'text-slate-400'}`} />
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className={`text-[11px] font-bold mt-0.5 ${sub.startsWith('-') ? 'text-rose-500' : sub.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Section header + metal pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl accent-bg-soft flex items-center justify-center">
            <BarChart3 className="w-4 h-4 accent-text" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Current Trends
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">90-day history • AI 30-day forecast</p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {METALS.map(m => (
            <button
              key={m.id}
              onClick={() => setMetal(m.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                metal === m.id ? 'accent-bg text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={isUp ? TrendingUp : TrendingDown}
          label="Today"
          value={`${formatMoney(stats.current, { decimals: 0 })}/g`}
          sub={`${stats.change1d.pct > 0 ? '+' : ''}${stats.change1d.pct}% (1d)`}
        />
        <StatCard
          icon={CalendarRange}
          label="7-Day Change"
          value={`${stats.change7d.pct > 0 ? '+' : ''}${stats.change7d.pct}%`}
          sub={`${stats.change7d.abs > 0 ? '+' : '−'}${formatMoney(Math.abs(stats.change7d.abs), { decimals: 0 })}/g`}
        />
        <StatCard
          icon={CalendarDays}
          label="30-Day Change"
          value={`${stats.change30d.pct > 0 ? '+' : ''}${stats.change30d.pct}%`}
          sub={`${stats.change30d.abs > 0 ? '+' : '−'}${formatMoney(Math.abs(stats.change30d.abs), { decimals: 0 })}/g`}
        />
        <StatCard
          icon={Activity}
          label="30d High / Low"
          value={formatMoney(stats.high, { decimals: 0 })}
          sub={`Low: ${formatMoney(stats.low, { decimals: 0 })}`}
        />
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center space-x-3 text-[11px] font-bold">
            <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-4 h-0.5 bg-amber-500 rounded inline-block"></span> History
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-4 h-0.5 bg-indigo-500 rounded inline-block" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#e9c76b 0 4px,transparent 4px 7px)' }}></span> AI Forecast
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-black ${
              forecast.summary?.direction === 'UP' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : forecast.summary?.direction === 'DOWN' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <Zap className="w-3 h-3" />
              30d outlook: {forecast.summary?.direction || '—'}
              {forecast.summary ? ` (${forecast.summary.next30d.pct > 0 ? '+' : ''}${forecast.summary.next30d.pct}%)` : ''}
            </span>
          </div>
        </div>

        <div className="h-56 sm:h-64">
          <Line data={chartData} options={chartOptions} />
        </div>

        {analysis.isEstimated && analysis.realCount < MIN_REAL_POINTS && (
          <div className="mt-3 flex items-start space-x-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
            <p>
              <span className="font-bold">Heads-up:</span> older points are smart estimates — the app just started recording real daily snapshots.
              Every day the app fetches live rates, the {METALS.find(m => m.id === metal)?.label} curve becomes more accurate ({analysis.realCount} real day{analysis.realCount === 1 ? '' : 's'} recorded so far).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
