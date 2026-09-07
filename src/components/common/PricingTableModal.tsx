import React, { useState } from 'react';
import { ProductCatalogItem, LanguageCode } from '../../types';
import { PRODUCT_CATALOG } from '../../data/mockData';
import { t } from '../../data/translations';
import { speakText } from '../../utils/speech';
import { Table, Volume2, ShieldCheck, TrendingUp, Search, Info, X } from 'lucide-react';

interface PricingTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSelectProduct?: (productId: string) => void;
}

export const PricingTableModal: React.FC<PricingTableModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Vegetables', 'Cereals', 'Pulses', 'Fruits', 'Oilseeds'];

  const filtered = PRODUCT_CATALOG.filter(item => {
    const matchCat = selectedCat === 'All' || item.category === selectedCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.defaultVarieties.some(v => v.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleReadRow = (item: ProductCatalogItem) => {
    const text = `${item.name}: Today's daily rate is ₹${item.dailyRate} per kilo. 7-day historical average is ₹${item.historicalAvg7Days} per kilo. MSP benchmark reference is ₹${item.mspBenchmark} per kilo. AI maximum price limit is ₹${item.aiMaxGuardrail} per kilo.`;
    speakText(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Table className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {t('price_table', language)}
              </h2>
              <p className="text-xs text-emerald-100/90">
                Daily rates, 7-day historical data, MSP benchmark &amp; AI marketplace guardrails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-emerald-50/60 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-emerald-100/80 border border-emerald-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search crop or variety..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Informational banner */}
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t('price_guardrail_notice', language)}</span>
        </div>

        {/* Table container */}
        <div className="overflow-auto flex-1 p-6">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50/80">
                <th className="py-3 px-3">Product &amp; Varieties</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">MSP Benchmark</th>
                <th className="py-3 px-3 text-right">Today's Daily Rate</th>
                <th className="py-3 px-3 text-right">7-Day Avg Rate</th>
                <th className="py-3 px-3 text-right">AI Max Guardrail</th>
                <th className="py-3 px-3 text-center">Supply &amp; Demand</th>
                <th className="py-3 px-3 text-right">Est. Transport</th>
                <th className="py-3 px-3 text-center">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectProduct?.(item.id)}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {item.defaultVarieties.slice(0, 3).join(', ')}
                          {item.defaultVarieties.length > 3 ? '...' : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-gray-600">
                    ₹{item.mspBenchmark}/{item.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">
                    ₹{item.dailyRate}/{item.unit}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      ₹{item.historicalAvg7Days}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-700">
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      ₹{item.aiMaxGuardrail}/{item.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.demandStatus === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Dem: {item.demandStatus}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sup: {item.supplyStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600 text-xs">
                    ~₹{item.transportEstPerKg}/kg
                  </td>
                  <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleReadRow(item)}
                      className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="Listen to price details aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Prices auto-synchronized with regional APMC / Mandi feeds &amp; KisanSetu platform intelligence</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors"
          >
            Close Table
          </button>
        </div>
      </div>
    </div>
  );
};
