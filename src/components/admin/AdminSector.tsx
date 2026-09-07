import React from 'react';
import {
  FarmerProduceListing,
  Order,
  Driver,
  TransportJob,
  BulkRequirement,
  Complaint,
  LanguageCode,
} from '../../types';
import { PRODUCT_CATALOG } from '../../data/mockData';
import {
  ShieldAlert,
  TrendingUp,
  Activity,
  Layers,
  Truck,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface AdminSectorProps {
  language: LanguageCode;
  listings: FarmerProduceListing[];
  orders: Order[];
  drivers: Driver[];
  transportJobs: TransportJob[];
  bulkRequirements: BulkRequirement[];
  complaints: Complaint[];
  onOpenPricingTable: () => void;
  onOpenCharts: () => void;
}

export const AdminSector: React.FC<AdminSectorProps> = ({
  listings,
  orders,
  drivers,
  transportJobs,
  bulkRequirements,
  complaints,
  onOpenPricingTable,
  onOpenCharts,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">KisanSetu AI Coordination Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                System Administrator &amp; Oversight
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live inspection of price guardrails, pooled route coordination, multi-farmer fulfillment &amp; accountability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCharts}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Demand-Supply Telemetry</span>
          </button>
          <button
            onClick={onOpenPricingTable}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-colors"
          >
            <span>Mandi Rates &amp; Guardrails</span>
          </button>
        </div>
      </div>

      {/* High-level system stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Listings</span>
          <div className="text-xl font-black text-gray-900 mt-1">{listings.length}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{listings.reduce((s, l) => s + l.availableQty, 0)} kg total stock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Consumer Orders</span>
          <div className="text-xl font-black text-blue-900 mt-1">{orders.length}</div>
          <span className="text-[10px] text-blue-700 font-semibold">100% Fulfilled or Active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transport Jobs</span>
          <div className="text-xl font-black text-amber-700 mt-1">{transportJobs.length}</div>
          <span className="text-[10px] text-gray-500">Per-job paid model</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bulk Pools</span>
          <div className="text-xl font-black text-purple-900 mt-1">{bulkRequirements.length}</div>
          <span className="text-[10px] text-purple-700 font-semibold">Multi-farmer aggregated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Shared Route Savings</span>
          <div className="text-xl font-black text-emerald-800 mt-1">₹140</div>
          <span className="text-[10px] text-emerald-700 font-semibold">Consumer savings via pooling</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Complaints &amp; Audits</span>
          <div className="text-xl font-black text-rose-700 mt-1">{complaints.length}</div>
          <span className="text-[10px] text-gray-500">Photo evidence logged</span>
        </div>
      </div>

      {/* AI Mechanics Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: AI Guardrail Enforcement */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Configured Price Guardrails</h3>
              <p className="text-xs text-gray-500">
                Farmers set selling prices freely, but AI flags and restricts deviations beyond regional limits
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {PRODUCT_CATALOG.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="font-bold text-gray-900">{p.name}</span>
                  <span className="text-[10px] text-gray-500 ml-2">Mandi Base: ₹{p.dailyRate}/kg</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-800 font-bold">Limit: ≤ ₹{p.aiMaxGuardrail}/kg</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: AI Multi-Farmer Aggregate Fulfillment Engine */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Multi-Farmer Supply Pooling</h3>
              <p className="text-xs text-gray-500">
                Institutional orders split into discrete allotments to prevent individual farmer over-burdening
              </p>
            </div>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950">Active Batch: BULK-2026-901</span>
              <span className="text-purple-800 font-bold">1,000 kg Tomato</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700">
              <div className="p-2 bg-white rounded-lg border border-purple-100">Ravi Kumar: <strong>300 kg</strong> (Confirmed)</div>
              <div className="p-2 bg-white rounded-lg border border-purple-100">Venkat Rao: <strong>250 kg</strong> (Confirmed)</div>
              <div className="p-2 bg-white rounded-lg border border-purple-100">Lakshmi Devi: <strong>200 kg</strong> (Confirmed)</div>
              <div className="p-2 bg-white rounded-lg border border-purple-100">Suresh Patel: <strong>250 kg</strong> (Pending)</div>
            </div>
            <span className="text-[10px] text-gray-500 block">
              Drivers assigned: 2 Tata Ace vehicles routed sequentially through Gollapudi ➔ Tadepalli ➔ Mangalagiri.
            </span>
          </div>
        </div>
      </div>

      {/* Complaints and AI Attribution Audit Logs */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">AI Dispute Resolution &amp; Pre-Packing Audit Log</h3>
            <p className="text-xs text-gray-500">
              Objective attribution comparing farmer pre-packing camera uploads against consumer received condition
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
            {complaints.length} Open Inquiries
          </span>
        </div>

        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{c.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Order: {c.orderId}
                  </span>
                  <span className="text-gray-500">Reported by: {c.complainantName}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/70 text-amber-900">
                  {c.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-700">
                <strong>Report:</strong> {c.description}
              </p>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                <strong>AI Attribution Analysis:</strong> {c.aiAttributionAnalysis}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
