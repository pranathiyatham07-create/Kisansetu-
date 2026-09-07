import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { HISTORICAL_DEMAND_SUPPLY, PRODUCT_CATALOG } from '../../data/mockData';
import { LanguageCode } from '../../types';
import { speakText } from '../../utils/speech';
import { TrendingUp, BarChart3, Volume2, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DemandSupplyChartsProps {
  language: LanguageCode;
  initialProductId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const DemandSupplyCharts: React.FC<DemandSupplyChartsProps> = ({
  language,
  initialProductId = 'prod-tomato',
  onClose,
  isModal = false,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);

  const productInfo = PRODUCT_CATALOG.find(p => p.id === selectedProductId) || PRODUCT_CATALOG[0];
  const chartData = HISTORICAL_DEMAND_SUPPLY[selectedProductId] || HISTORICAL_DEMAND_SUPPLY['prod-tomato'];

  const latestDay = chartData[chartData.length - 1];
  const firstDay = chartData[0];
  const demandChangePct = (((latestDay.demandKg - firstDay.demandKg) / firstDay.demandKg) * 100).toFixed(1);
  const isDemandUp = parseFloat(demandChangePct) >= 0;

  const handleReadSummary = () => {
    const text = `1-week demand and supply analysis for ${productInfo.name}. Current daily demand is ${latestDay.demandKg.toLocaleString()} kilograms, compared to available supply of ${latestDay.supplyKg.toLocaleString()} kilograms. The average daily clearing rate is ₹${latestDay.marketRate} per kilogram. Overall 7-day demand is ${isDemandUp ? 'up' : 'down'} by ${Math.abs(parseFloat(demandChangePct))} percent.`;
    speakText(text, language);
  };

  const content = (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex flex-col gap-5">
      {/* Top Header & Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                7-Day Agricultural Demand &amp; Supply Analysis
              </h3>
              <p className="text-xs text-gray-500">
                Live mandi clearance trends, daily consumption patterns, and price correlations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition-colors"
            title="Read summary aloud"
          >
            <Volume2 className="w-4 h-4 text-emerald-700" />
            <span>Listen Analysis</span>
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Product tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100">
        {Object.keys(HISTORICAL_DEMAND_SUPPLY).map(pid => {
          const p = PRODUCT_CATALOG.find(item => item.id === pid);
          if (!p) return null;
          const isSelected = p.id === selectedProductId;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-5 h-5 rounded-full object-cover border border-white/50"
                referrerPolicy="no-referrer"
              />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Today's Demand</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-gray-900">{latestDay.demandKg.toLocaleString()}</span>
            <span className="text-xs text-gray-500">kg</span>
          </div>
          <div className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${isDemandUp ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isDemandUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{demandChangePct}% vs Mon</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Available Supply</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-gray-900">{latestDay.supplyKg.toLocaleString()}</span>
            <span className="text-xs text-gray-500">kg</span>
          </div>
          <span className="text-[11px] text-blue-700 font-semibold block mt-1">
            Gap: {(latestDay.demandKg - latestDay.supplyKg).toLocaleString()} kg deficit
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Daily Market Rate</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-gray-900">₹{latestDay.marketRate}</span>
            <span className="text-xs text-gray-500">/kg</span>
          </div>
          <span className="text-[11px] text-amber-800 font-semibold block mt-1">
            MSP Ref: ₹{productInfo.mspBenchmark}/kg
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">AI Price Guardrail</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-purple-900">₹{productInfo.aiMaxGuardrail}</span>
            <span className="text-xs text-purple-700">/kg max</span>
          </div>
          <span className="text-[11px] text-purple-700 font-medium block mt-1">
            Dynamic platform ceiling
          </span>
        </div>
      </div>

      {/* Chart 1: Demand vs Supply Volume (Kg) */}
      <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              1. 7-Day Demand vs Supply Volume (Kilograms)
            </h4>
            <p className="text-[11px] text-gray-500">Shows daily consumer + bulk demand compared against farm inventory</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span> Demand (kg)
            </span>
            <span className="flex items-center gap-1.5 text-blue-800 font-medium">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Supply (kg)
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={val => `${val / 1000}t`} />
              <Tooltip
                formatter={(val: number | undefined) => [
                  typeof val === 'number' ? `${val.toLocaleString()} kg` : '0 kg',
                  '',
                ]}
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="demandKg" name="Demand" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemand)" />
              <Area type="monotone" dataKey="supplyKg" name="Supply" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSupply)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Market Rate Trend (₹/kg) */}
      <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              2. 7-Day Market Clearing Price (₹ per kg)
            </h4>
            <p className="text-[11px] text-gray-500">Correlation with supply scarcity &amp; transportation costs</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Avg: ₹{productInfo.historicalAvg7Days}/kg</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={['dataMin - 4', 'dataMax + 4']} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={val => `₹${val}`} />
              <Tooltip
                formatter={(val: number | undefined) => [
                  typeof val === 'number' ? `₹${val}/kg` : '₹0/kg',
                  'Clearing Rate',
                ]}
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #fef3c7', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="marketRate" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Supply-Demand Synthesis Note */}
      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">AI Coordination Rule: </span>
          When regional demand exceeds supply by &gt;20%, KisanSetu AI alerts nearby transport workers to mobilize inter-village surplus, while maintaining price caps strictly under the configured guardrail limit of ₹{productInfo.aiMaxGuardrail}/kg.
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
