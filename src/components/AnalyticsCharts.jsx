import React from 'react';
import { useLedger } from '../context/LedgerContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function AnalyticsCharts() {
  const { totalYouWillGet, totalYouWillGive, customers, darkMode } = useLedger();

  // Doughnut Chart Data
  const doughnutData = {
    labels: ["You'll Get", "You'll Give"],
    datasets: [
      {
        data: [totalYouWillGet, totalYouWillGive],
        backgroundColor: [
          'rgba(239, 68, 68, 0.85)', // Red
          'rgba(34, 197, 94, 0.85)', // Green
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Top 5 Customers by absolute balance
  const sortedCustomers = [...customers]
    .sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance))
    .slice(0, 5);

  const barData = {
    labels: sortedCustomers.map(c => c.name),
    datasets: [
      {
        label: 'Net Balance (₹)',
        data: sortedCustomers.map(c => c.netBalance),
        backgroundColor: sortedCustomers.map(c => 
          c.netBalance >= 0 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(34, 197, 94, 0.85)'
        ),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#cbd5e1' : '#475569',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: darkMode ? '#94a3b8' : '#64748b' },
        grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
      },
      y: {
        ticks: { 
          color: darkMode ? '#94a3b8' : '#64748b',
          callback: (val) => `₹ ${val}`
        },
        grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      
      {/* Doughnut Ratio Chart */}
      <div className="glass-card rounded-2xl p-5 flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Credit vs Payable Ratio
          </h4>
        </div>
        <div className="relative flex-1 min-h-[200px] flex items-center justify-center">
          {totalYouWillGet === 0 && totalYouWillGive === 0 ? (
            <p className="text-xs text-slate-400">No balance data to chart yet</p>
          ) : (
            <Doughnut 
              data={doughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: darkMode ? '#cbd5e1' : '#475569' }
                  }
                }
              }} 
            />
          )}
        </div>
      </div>

      {/* Top Balances Bar Chart */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Top 5 Customer Balances
          </h4>
        </div>
        <div className="relative flex-1 min-h-[200px]">
          {sortedCustomers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Add customers to see analytics chart
            </div>
          ) : (
            <Bar data={barData} options={chartOptions} />
          )}
        </div>
      </div>

    </div>
  );
}
