import React, { useState } from 'react';
import {
  BulkRequirement,
  LanguageCode,
  ProductCategory,
  FarmerProduceListing,
} from '../../types';
import { PRODUCT_CATALOG } from '../../data/mockData';
import { t } from '../../data/translations';
import { speakText } from '../../utils/speech';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Truck,
  Users,
  Check,
  X,
  Layers,
  Info,
  DollarSign,
} from 'lucide-react';

interface BulkBuyerSectorProps {
  language: LanguageCode;
  bulkRequirements: BulkRequirement[];
  onAddBulkRequirement: (req: BulkRequirement) => void;
  onCancelBulkOrder: (bulkId: string) => void;
  onTriggerRecovery: (bulkId: string) => void;
  listings: FarmerProduceListing[];
  onOpenVoice: () => void;
  onOpenPricingTable: () => void;
  onOpenCharts: () => void;
}

export const BulkBuyerSector: React.FC<BulkBuyerSectorProps> = ({
  language,
  bulkRequirements,
  onAddBulkRequirement,
  onCancelBulkOrder,
  onTriggerRecovery,
  listings,
  onOpenVoice,
  onOpenPricingTable,
  onOpenCharts,
}) => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'post_new'>('requirements');

  // New Bulk Requirement Form
  const [buyerOrg, setBuyerOrg] = useState<string>('Hotel Grand Rayalaseema');
  const [buyerType, setBuyerType] = useState<any>('Hotel');
  const [productName, setProductName] = useState<string>('Tomato');
  const [variety, setVariety] = useState<string>('Hybrid');
  const [quantity, setQuantity] = useState<number>(1000);
  const [quality, setQuality] = useState<string>('Good');
  const [destination, setDestination] = useState<string>('MG Road, Vijayawada');
  const [deliveryDeadline, setDeliveryDeadline] = useState<string>('Tomorrow, 7:00 AM');
  const [maxPrice, setMaxPrice] = useState<number>(45);

  const handlePostRequirement = (e: React.FormEvent) => {
    e.preventDefault();

    // AI Multi-farmer Fulfillment Algorithm simulation:
    // Partition requirement across multiple available farmers
    const plan = [
      { farmerId: 'farmer-1', farmerName: 'Ravi Kumar', village: 'Gollapudi', allocatedQty: Math.round(quantity * 0.3), pricePerKg: 40, status: 'accepted' as const },
      { farmerId: 'farmer-2', farmerName: 'Venkat Rao', village: 'Tadepalli', allocatedQty: Math.round(quantity * 0.25), pricePerKg: 40, status: 'accepted' as const },
      { farmerId: 'farmer-3', farmerName: 'Lakshmi Devi', village: 'Mangalagiri', allocatedQty: Math.round(quantity * 0.2), pricePerKg: 38, status: 'accepted' as const },
      { farmerId: 'farmer-5', farmerName: 'Suresh Patel', village: 'Ibrahimpatnam', allocatedQty: quantity - (Math.round(quantity * 0.3) + Math.round(quantity * 0.25) + Math.round(quantity * 0.2)), pricePerKg: 41, status: 'pending' as const },
    ];

    const confirmed = plan.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.allocatedQty, 0);

    const newReq: BulkRequirement = {
      id: `BULK-2026-${Math.floor(100 + Math.random() * 900)}`,
      buyerId: 'bulk-inst-1',
      buyerName: 'Procurement Manager',
      buyerOrg: buyerOrg,
      buyerType: buyerType,
      product: productName,
      variety: variety,
      quantity: quantity,
      quality: quality,
      destination: destination,
      deliveryDeadline: deliveryDeadline,
      maxAcceptablePrice: maxPrice,
      status: 'matched',
      fulfillmentPlan: plan,
      confirmedQty: confirmed,
      totalEstimatedAmount: plan.reduce((sum, p) => sum + p.allocatedQty * p.pricePerKg, 0),
      isCancelled: false,
    };

    onAddBulkRequirement(newReq);
    speakText(`Bulk requirement of ${quantity} kg ${productName} posted. AI generated multi-farmer fulfillment plan across 4 farmers.`, language);
    setActiveTab('requirements');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Buyer Profile */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-purple-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{buyerOrg}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                Institutional Bulk Buyer
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Multi-farmer aggregate fulfillment for restaurants, hotels, supermarkets &amp; processors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('post_new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Bulk Requirement</span>
          </button>
          <button
            onClick={onOpenVoice}
            className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 text-xs font-semibold"
          >
            🎙️ Voice Request
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('requirements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requirements'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          My Bulk Requirements &amp; AI Fulfillment Plans
        </button>

        <button
          onClick={() => setActiveTab('post_new')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'post_new'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
          }`}
        >
          ➕ Post New Requirement
        </button>
      </div>

      {/* TAB 1: REQUIREMENTS & MULTI-FARMER FULFILLMENT */}
      {activeTab === 'requirements' && (
        <div className="space-y-5">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
            <Sparkles className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">AI Multi-Farmer Coordination Engine: </span>
              Individual smallholder farmers rarely have 1,000+ kg of identical variety on short notice. KisanSetu AI pools output across nearby vetted farms, coordinates unified quality grading, and arranges synchronous collection routes.
            </div>
          </div>

          <div className="space-y-6">
            {bulkRequirements.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-base">{req.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
                        {req.variety} {req.product}
                      </span>
                      {req.isCancelled && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Target: <span className="font-bold text-gray-800">{req.quantity} kg</span> @ Max ₹{req.maxAcceptablePrice}/kg • Destination: {req.destination} • Deadline: {req.deliveryDeadline}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Estimated Outlay</span>
                    <span className="text-lg font-black text-purple-900">
                      ₹{req.totalEstimatedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status KPI Overview as explicitly requested */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Requirement</span>
                    <span className="text-sm font-extrabold text-gray-900">{req.quantity} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">AI Matched</span>
                    <span className="text-sm font-extrabold text-purple-800">{req.quantity} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Participating Farmers</span>
                    <span className="text-sm font-extrabold text-blue-800">{req.fulfillmentPlan.length} Farmers</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Confirmed Stock</span>
                    <span className="text-sm font-extrabold text-emerald-800">{req.confirmedQty} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Transportation</span>
                    <span className="text-sm font-extrabold text-amber-800">AI Coordinating</span>
                  </div>
                </div>

                {/* Multi-Farmer Fulfillment Plan Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-700" />
                      <span>AI Multi-Farmer Allocation Plan:</span>
                    </span>
                    <span className="text-gray-500 font-normal">
                      Total Allocated: {req.fulfillmentPlan.reduce((sum, p) => sum + p.allocatedQty, 0)} kg
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {req.fulfillmentPlan.map((alloc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">Farmer {String.fromCharCode(65 + idx)}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            alloc.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {alloc.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700">
                          {alloc.farmerName} ({alloc.village})
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t border-gray-100 text-[11px]">
                          <span className="text-purple-900">{alloc.allocatedQty} kg</span>
                          <span className="text-gray-600">@ ₹{alloc.pricePerKg}/kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failed Bulk Order Recovery Notice if Cancelled */}
                {req.isCancelled ? (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950">
                    <div className="font-bold flex items-center gap-2 text-amber-900">
                      <RotateCcw className="w-4 h-4 text-amber-700" />
                      <span>Failed Bulk Order Recovery Engine Active</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Buyer cancelled after preparation. KisanSetu AI immediately redirected {req.confirmedQty} kg of prepared produce to nearby verified demand:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-[11px] font-semibold text-gray-800">
                        🏨 350 kg ➔ Annapurna Mess &amp; Hostels
                      </span>
                      <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-[11px] font-semibold text-gray-800">
                        🏪 400 kg ➔ More Supermarket Hub
                      </span>
                      <span className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-[11px] font-semibold text-gray-800">
                        🥫 250 kg ➔ Tenali Agro Food Processors
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold block pt-1">
                      ✅ 100% of prepared harvest recovered before freshness loss occurred.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Synchronized pickup scheduled with 2 Tata Ace vehicles
                    </span>
                    <button
                      onClick={() => onCancelBulkOrder(req.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                      title="Simulate cancellation to demonstrate recovery algorithm"
                    >
                      Simulate Cancellation &amp; AI Recovery
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: POST NEW REQUIREMENT */}
      {activeTab === 'post_new' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
          <div className="pb-4 border-b border-gray-100 mb-5">
            <h3 className="text-lg font-bold text-gray-900">Post Bulk Agricultural Requirement</h3>
            <p className="text-xs text-gray-500">
              Submit your volume requirements. KisanSetu AI aggregates supply across multiple smallholder farmers seamlessly.
            </p>
          </div>

          <form onSubmit={handlePostRequirement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Buyer Organization Name
                </label>
                <input
                  type="text"
                  value={buyerOrg}
                  onChange={e => setBuyerOrg(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Institutional Sector Type
                </label>
                <select
                  value={buyerType}
                  onChange={e => setBuyerType(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Restaurant">Restaurant Chain</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Hostel">Hostel / Educational Institution</option>
                  <option value="Processor">Food Processing Unit</option>
                  <option value="Retailer">Retailer Aggregator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Product
                </label>
                <select
                  value={productName}
                  onChange={e => {
                    setProductName(e.target.value);
                    const p = PRODUCT_CATALOG.find(item => item.name === e.target.value);
                    if (p) setVariety(p.defaultVarieties[0] || 'Standard');
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                >
                  {PRODUCT_CATALOG.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Variety
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Required Quantity (kg)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 100)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-purple-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Required Delivery Time
                </label>
                <input
                  type="text"
                  value={deliveryDeadline}
                  onChange={e => setDeliveryDeadline(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Max Acceptable Price (₹/kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxPrice}
                  onChange={e => setMaxPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('requirements')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Publish &amp; Run AI Multi-Farmer Matching
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
