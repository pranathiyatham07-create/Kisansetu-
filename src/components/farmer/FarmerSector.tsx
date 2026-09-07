import React, { useState } from 'react';
import {
  FarmerProduceListing,
  Order,
  TransportJob,
  Driver,
  BulkRequirement,
  ExternalSaleRecord,
  LanguageCode,
  ProductCategory,
  Complaint,
} from '../../types';
import { PRODUCT_CATALOG } from '../../data/mockData';
import { t } from '../../data/translations';
import { speakText } from '../../utils/speech';
import {
  Package,
  PlusCircle,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Camera,
  Layers,
  MapPin,
  FileText,
  Volume2,
  Edit3,
  Sparkles,
  Phone,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';

interface FarmerSectorProps {
  language: LanguageCode;
  listings: FarmerProduceListing[];
  onAddListing: (listing: FarmerProduceListing) => void;
  onUpdateListingPrice: (listingId: string, newPrice: number) => void;
  onUpdateExternalSale: (listingId: string, soldQty: number, channel: string) => void;
  orders: Order[];
  onAcceptOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  drivers: Driver[];
  transportJobs: TransportJob[];
  onAssignDriverToJob: (jobId: string, driverId: string) => void;
  onRequestTransportation: (job: Omit<TransportJob, 'id' | 'createdAt' | 'status'>) => void;
  bulkRequirements: BulkRequirement[];
  onAcceptBulkAllocation: (bulkId: string, farmerId: string) => void;
  onRejectBulkAllocation: (bulkId: string, farmerId: string) => void;
  onOpenVoice: () => void;
  onOpenPricingTable: () => void;
  onOpenCharts: () => void;
  complaints?: Complaint[];
  onResolveComplaint?: (complaintId: string, responseNote: string, resolutionAction: string) => void;
}

export const FarmerSector: React.FC<FarmerSectorProps> = ({
  language,
  listings,
  onAddListing,
  onUpdateListingPrice,
  onUpdateExternalSale,
  orders,
  onAcceptOrder,
  onRejectOrder,
  drivers,
  transportJobs,
  onAssignDriverToJob,
  onRequestTransportation,
  bulkRequirements,
  onAcceptBulkAllocation,
  onRejectBulkAllocation,
  onOpenVoice,
  onOpenPricingTable,
  onOpenCharts,
  complaints = [],
  onResolveComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'produce'
    | 'add'
    | 'orders'
    | 'complaints'
    | 'ai_fleet'
    | 'request_transport'
    | 'bulk'
    | 'inventory_sales'
  >('produce');

  // Complaint resolution state
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [farmerResponseNote, setFarmerResponseNote] = useState<string>('');
  const [resolutionAction, setResolutionAction] = useState<string>('replacement');

  // Price Edit Modal State
  const [editingListing, setEditingListing] = useState<FarmerProduceListing | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(0);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);

  // External Sale Modal State
  const [externalSaleListing, setExternalSaleListing] = useState<FarmerProduceListing | null>(null);
  const [externalSaleQty, setExternalSaleQty] = useState<number>(50);
  const [externalSaleChannel, setExternalSaleChannel] = useState<string>('Local Village Market');

  // Add Produce Form State
  const [addCategory, setAddCategory] = useState<ProductCategory>('Vegetables');
  const [addProductId, setAddProductId] = useState<string>('prod-tomato');
  const [addVariety, setAddVariety] = useState<string>('Hybrid');
  const [addQuantity, setAddQuantity] = useState<number>(500);
  const [addPrice, setAddPrice] = useState<number>(40);
  const [addQuality, setAddQuality] = useState<'Good' | 'Fair' | 'Premium'>('Good');
  const [addLocation, setAddLocation] = useState<string>('Gollapudi Farm Gate');

  // Request Transport Form State
  const [reqProduct, setReqProduct] = useState<string>('Tomato');
  const [reqQty, setReqQty] = useState<number>(500);
  const [reqPickup, setReqPickup] = useState<string>('Gollapudi Collection Point');
  const [reqDest, setReqDest] = useState<string>('Vijayawada Central Yard');
  const [reqDeliveryTime, setReqDeliveryTime] = useState<string>('Today by 4:00 PM');
  const [reqCapacity, setReqCapacity] = useState<number>(750);

  // Selected catalog item
  const selectedProductItem = PRODUCT_CATALOG.find(p => p.id === addProductId) || PRODUCT_CATALOG[0];

  const safeListings = Array.isArray(listings) ? listings : [];
  const safeDrivers = Array.isArray(drivers) ? drivers : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeJobs = Array.isArray(transportJobs) ? transportJobs : [];
  const safeBulk = Array.isArray(bulkRequirements) ? bulkRequirements : [];

  // Current Farmer ID
  const currentFarmerId = 'farmer-1';
  const farmerListings = safeListings.filter(l => l && l.farmerId === currentFarmerId);

  // Complaints directed to this farmer
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const farmerComplaints = safeComplaints.filter(
    c => c && (c.farmerId === currentFarmerId || c.targetType === 'farmer' || !c.farmerId)
  );
  const unresolvedComplaints = farmerComplaints.filter(c => c.status !== 'resolved');
  // Rating decreases if there are unresolved complaints
  const baseRating = 4.8;
  const ratingPenalty = unresolvedComplaints.length * 0.4;
  const currentRating = Math.max(1.0, baseRating - ratingPenalty).toFixed(1);

  // All independent platform drivers (AI Smart Dispatch model - no driver is bound to any single farmer)
  const availableIndependentDrivers = safeDrivers;

  // Driver re-assignment state
  const [reassigningJobId, setReassigningJobId] = useState<string | null>(null);

  // Orders for this farmer
  const farmerOrders = safeOrders.filter(o => o && Array.isArray(o.items) && o.items.some(item => item.farmerId === currentFarmerId));

  // Total earnings & stats
  const totalStockKg = farmerListings.reduce((sum, l) => sum + (l.availableQty || 0), 0);
  const totalEarningsEst = farmerOrders
    .filter(o => o && (o.status === 'delivered' || o.status === 'transport_confirmed' || o.status === 'farmer_confirmed'))
    .reduce((sum, o) => sum + (o.totalProduceCost || 0), 0) + 14500;

  // Handle price edit click
  const openEditPriceModal = (listing: FarmerProduceListing) => {
    setEditingListing(listing);
    setNewPriceInput(listing.farmerPrice);
    setPriceWarning(null);
  };

  const handlePriceInputChange = (val: number) => {
    setNewPriceInput(val);
    const catItem = PRODUCT_CATALOG.find(p => p.name.toLowerCase() === editingListing?.product.toLowerCase());
    const limit = catItem ? catItem.aiMaxGuardrail : 60;
    if (val > limit) {
      setPriceWarning(
        `⚠️ Price Above Current Marketplace Guardrail: Current configured maximum is ₹${limit}/kg. Please revise your price to stay within marketplace limits.`
      );
    } else {
      setPriceWarning(null);
    }
  };

  const savePriceEdit = () => {
    if (!editingListing) return;
    onUpdateListingPrice(editingListing.id, newPriceInput);
    speakText(`Updated selling price of ${editingListing.variety} ${editingListing.product} to ₹${newPriceInput} per kilo.`, language);
    setEditingListing(null);
  };

  // Handle external sale save
  const saveExternalSale = () => {
    if (!externalSaleListing) return;
    onUpdateExternalSale(externalSaleListing.id, externalSaleQty, externalSaleChannel);
    speakText(`Recorded external sale of ${externalSaleQty} kg. Remaining inventory updated.`, language);
    setExternalSaleListing(null);
  };

  // Handle Add Produce Submission
  const handleAddProduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: FarmerProduceListing = {
      id: `list-${Date.now()}`,
      batchId: `BATCH-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      farmerId: currentFarmerId,
      farmerName: 'Ravi Kumar',
      village: 'Gollapudi',
      region: 'Krishna District',
      distanceKm: 4.2,
      category: addCategory,
      product: selectedProductItem.name,
      variety: addVariety,
      availableQty: addQuantity,
      originalQty: addQuantity,
      quality: addQuality,
      farmerPrice: addPrice,
      location: addLocation,
      imageUrl: selectedProductItem.image,
      agingStatus: 'normal',
      daysInStock: 0,
      aiPriceStatus: addPrice <= selectedProductItem.aiMaxGuardrail ? 'within_guardrail' : 'above_guardrail',
      hasQualityCheck: true,
      qualityCheckResult: 'acceptable',
      qualityCheckNotes: 'Pre-packing check passed: fresh harvest color and firm structure.',
    };

    onAddListing(newListing);
    speakText(`Added ${addQuantity} kg of ${addVariety} ${selectedProductItem.name} at ₹${addPrice} per kilo.`, language);
    setActiveTab('produce');
  };

  // Handle Request Transportation
  const handleRequestTransportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestTransportation({
      sourceType: 'farmer_request',
      referenceId: `REQ-${Date.now()}`,
      farmerId: currentFarmerId,
      farmerName: 'Ravi Kumar',
      farmerPickupLocation: reqPickup,
      destination: reqDest,
      distanceKm: 18,
      product: reqProduct,
      variety: 'Hybrid',
      quantityKg: reqQty,
      requiredCapacityKg: reqCapacity,
      deliveryWindow: reqDeliveryTime,
      transportEarnings: 450,
    });
    speakText(`Transportation request created for ${reqQty} kg ${reqProduct}. AI is matching nearby transport providers.`, language);
    setActiveTab('drivers');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Farmer Profile & Voice Button */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Ravi Kumar</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Farmer / FPO Member
              </span>
              <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                ★ 4.8
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gollapudi, Krishna District, Andhra Pradesh</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <span>🎙️ Speak / Voice Assist</span>
          </button>
          <button
            onClick={onOpenPricingTable}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Mandi Rates &amp; Guardrails</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Available Stock</span>
          <div className="text-lg font-black text-gray-900 mt-1">{totalStockKg.toLocaleString()} <span className="text-xs font-medium text-gray-500">kg</span></div>
          <span className="text-[10px] text-emerald-700 font-semibold">{farmerListings.length} Active Listings</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">New Orders</span>
          <div className="text-lg font-black text-emerald-700 mt-1">{farmerOrders.length}</div>
          <span className="text-[10px] text-gray-500">Pending &amp; active</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Earnings</span>
          <div className="text-lg font-black text-gray-900 mt-1">₹{totalEarningsEst.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-700 font-medium">+₹3,400 this week</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">AI Fleet Near You</span>
          <div className="text-lg font-black text-gray-900 mt-1">{availableIndependentDrivers.length} <span className="text-xs font-normal text-gray-500">Drivers</span></div>
          <span className="text-[10px] text-blue-700 font-medium">AI Smart Dispatch</span>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-2xs ${
          unresolvedComplaints.length > 0
            ? 'bg-red-50/60 border-red-300 ring-1 ring-red-400/30'
            : 'bg-white border-gray-200/80'
        }`}>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Farmer Rating</span>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-lg font-black ${
              unresolvedComplaints.length > 0 ? 'text-red-700' : 'text-amber-600'
            }`}>
              {currentRating}
            </span>
            <span className="text-xs text-amber-500">★</span>
            {unresolvedComplaints.length > 0 && (
              <span className="text-[9px] font-bold bg-red-200 text-red-900 px-1.5 py-0.5 rounded-full">
                -{(unresolvedComplaints.length * 0.4).toFixed(1)} penalty
              </span>
            )}
          </div>
          <span className={`text-[10px] font-medium block ${
            unresolvedComplaints.length > 0 ? 'text-red-700 font-bold' : 'text-gray-500'
          }`}>
            {unresolvedComplaints.length > 0 ? '⚠️ Unresolved complaints!' : '99.2% Positive Trust'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Surplus Alerts</span>
          <div className="text-lg font-black text-amber-800 mt-1">1 Batch</div>
          <span className="text-[10px] text-amber-700">600 kg Onion aging</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bulk Requests</span>
          <div className="text-lg font-black text-purple-800 mt-1">1 Pending</div>
          <span className="text-[10px] text-purple-700">300 kg Tomato</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {[
          { id: 'produce', label: '🌾 My Produce', count: farmerListings.length },
          { id: 'add', label: '➕ Add Available Produce' },
          { id: 'orders', label: '🔔 Orders', count: farmerOrders.length },
          {
            id: 'complaints',
            label: '⚠️ Customer Complaints Box',
            count: unresolvedComplaints.length,
            isAlert: unresolvedComplaints.length > 0,
          },
          { id: 'ai_fleet', label: '🚚 AI Fleet & Dispatch Tracking', count: availableIndependentDrivers.length },
          { id: 'request_transport', label: '📦 Request Transportation' },
          { id: 'bulk', label: '🏢 Bulk Supply Requests', count: 1 },
          { id: 'inventory_sales', label: '⚖️ Inventory & External Sales' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : tab.isAlert
                ? 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-300'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : tab.isAlert
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: MY PRODUCE */}
      {activeTab === 'produce' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Current Produce Listings</h3>
              <p className="text-xs text-gray-500">
                Active crops available for AI matching with consumers and bulk buyers
              </p>
            </div>
            <button
              onClick={() => setActiveTab('add')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Produce</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerListings.map(listing => {
              const catItem = PRODUCT_CATALOG.find(p => p.name.toLowerCase() === listing.product.toLowerCase());
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={listing.imageUrl}
                        alt={listing.product}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-gray-900 shadow-xs">
                          {listing.variety}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-700 text-white shadow-xs">
                          {listing.quality}
                        </span>
                      </div>

                      {/* Aging Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs ${
                          listing.agingStatus === 'normal'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : listing.agingStatus === 'aging'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                        }`}>
                          {listing.agingStatus === 'normal' ? '🟢 Fresh' : listing.agingStatus === 'aging' ? '🟡 Aging' : '🔴 Urgent Clearance'}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px]">
                        Batch: {listing.batchId}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 leading-tight">
                            {listing.product}
                          </h4>
                          <span className="text-xs text-gray-500">{listing.location}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">Selling Price</span>
                          <span className="text-lg font-extrabold text-emerald-800">
                            ₹{listing.farmerPrice}/kg
                          </span>
                        </div>
                      </div>

                      {/* Quantity bar */}
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Available Inventory:</span>
                        <span className="font-bold text-gray-900">
                          {listing.availableQty} kg <span className="text-gray-400 text-[10px]">/ {listing.originalQty} kg</span>
                        </span>
                      </div>

                      {/* AI Guardrail Check */}
                      <div className="text-[11px] p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                        <span className="text-emerald-900 font-medium">Market Limit: ₹{catItem?.aiMaxGuardrail || 58}/kg</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Within Limit
                        </span>
                      </div>

                      {/* Quality verification notes */}
                      {listing.qualityCheckNotes && (
                        <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 flex items-start gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{listing.qualityCheckNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 border-t border-gray-100 grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => openEditPriceModal(listing)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Price</span>
                    </button>

                    <button
                      onClick={() => {
                        setExternalSaleListing(listing);
                        setExternalSaleQty(Math.min(50, listing.availableQty));
                      }}
                      className="py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-gray-200 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>External Sale</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ADD PRODUCE */}
      {activeTab === 'add' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('add_produce', language)}</h3>
              <p className="text-xs text-gray-500">
                List new harvest produce with variety, photo verification, and farmer-controlled pricing
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200"
            >
              🎙️ Speak to Add Produce
            </button>
          </div>

          <form onSubmit={handleAddProduceSubmit} className="space-y-5">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                1. Product Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['Vegetables', 'Cereals', 'Pulses', 'Fruits', 'Oilseeds', 'Other'] as ProductCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAddCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      addCategory === cat
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  2. Select Crop / Product
                </label>
                <select
                  value={addProductId}
                  onChange={e => {
                    const id = e.target.value;
                    setAddProductId(id);
                    const prod = PRODUCT_CATALOG.find(p => p.id === id);
                    if (prod) {
                      setAddVariety(prod.defaultVarieties[0] || 'Common');
                      setAddPrice(prod.dailyRate);
                    }
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {PRODUCT_CATALOG.filter(p => p.category === addCategory).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Today's Mandi: ₹{p.dailyRate}/kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  3. Product Variety
                </label>
                <select
                  value={addVariety}
                  onChange={e => setAddVariety(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {selectedProductItem.defaultVarieties.map(v => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  4. Available Quantity (Kilograms)
                </label>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={addQuantity}
                  onChange={e => setAddQuantity(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  5. Quality Assessment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fair', 'Good', 'Premium'] as const).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAddQuality(q)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        addQuality === q
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing with AI Guardrail */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    6. Your Selling Price (₹ per kg)
                  </label>
                  <p className="text-[11px] text-gray-500">Farmers decide their selling price freely</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Configured Platform Limit</span>
                  <span className="text-xs font-bold text-amber-800">
                    Max: ₹{selectedProductItem.aiMaxGuardrail}/kg
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-sm text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={addPrice}
                    onChange={e => setAddPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  Daily Mandi: <span className="font-bold">₹{selectedProductItem.dailyRate}/kg</span>
                </div>
              </div>

              {/* Guardrail feedback */}
              {addPrice > selectedProductItem.aiMaxGuardrail ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">⚠️ Price Above Current Marketplace Guardrail: </span>
                    Current configured maximum is ₹{selectedProductItem.aiMaxGuardrail}/kg based on regional demand and supply data. Please adjust your price.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('within_guardrail', language)} (Demand: {selectedProductItem.demandStatus}, Supply: {selectedProductItem.supplyStatus})</span>
                </div>
              )}
            </div>

            {/* Farm pickup location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                7. Farm / Collection Location
              </label>
              <input
                type="text"
                value={addLocation}
                onChange={e => setAddLocation(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Pre-Packing Quality Evidence Upload */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center space-y-2">
              <Camera className="w-6 h-6 text-emerald-700 mx-auto" />
              <div className="text-xs font-bold text-gray-800">
                Pre-Packing Quality Evidence (Farmer Photo &amp; Video)
              </div>
              <p className="text-[11px] text-gray-500">
                Uploaded photos are inspected by AI for surface mold, bruising, and grade consistency to establish accountability before driver pickup.
              </p>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                <Check className="w-3 h-3" /> Camera sample auto-attached for demo listing
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('produce')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addPrice > selectedProductItem.aiMaxGuardrail}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Publish Available Produce Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Incoming Consumer Orders &amp; Dispatch Status</h3>
              <p className="text-xs text-gray-500">
                Track whether produce has been assigned to a driver, is en route for village collection, or in transit to the buyer.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {farmerOrders.map(order => {
              const myItem = order.items.find(i => i.farmerId === currentFarmerId) || order.items[0];
              const transportJob = safeTransportJobs.find(j => j.referenceId === order.id || j.id === order.id);
              const assignedDriver = transportJob?.assignedDriverId
                ? safeDrivers.find(d => d.id === transportJob.assignedDriverId)
                : null;
              const driverName = transportJob?.assignedDriverName || order.driverName || assignedDriver?.name;
              const driverPhone = transportJob?.assignedDriverPhone || assignedDriver?.mobile || '+91 94401 88920';
              const driverVehicle = transportJob?.assignedDriverVehicle || order.driverVehicle || (assignedDriver ? `${assignedDriver.vehicleName} (${assignedDriver.registrationNumber})` : 'Tata Ace Commercial');
              const driverRating = transportJob?.assignedDriverRating || assignedDriver?.rating || 4.8;
              const driverStage = transportJob?.driverStage || (order.status === 'delivered' ? 'delivered' : order.status === 'in_transit' ? 'in_transit' : 'assigned');
              const isOrderGoing = Boolean(driverName && order.status !== 'cancelled');

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={myItem.imageUrl}
                        alt={myItem.product}
                        className="w-14 h-14 rounded-2xl object-cover border border-emerald-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                          <span className="text-[10px] text-gray-400">Batch: {order.batchId}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'in_transit'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'farmer_confirmed' || order.status === 'transport_confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {order.status === 'transport_confirmed' ? 'Driver Dispatched' : order.status.replace('_', ' ')}
                          </span>

                          {/* "Whether order is going or not" Indicator */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                            isOrderGoing
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isOrderGoing ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
                            <span>{isOrderGoing ? 'Order Is Going 🟢' : 'Awaiting Driver 🟡'}</span>
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-gray-800 mt-1">
                          {myItem.quantity} kg of {myItem.variety} {myItem.product} • ₹{myItem.unitPrice}/kg
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Buyer Location: {order.consumerLocation} ({order.fulfillmentType === 'pickup' ? 'Self Pickup' : 'Transportation Required'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Total Produce Value</span>
                        <span className="text-base font-extrabold text-emerald-800">
                          ₹{myItem.totalPrice}
                        </span>
                      </div>

                      {order.status === 'placed' || order.status === 'ai_matching' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onAcceptOrder(order.id);
                              speakText(`Order ${order.id} accepted. Packing produce now.`, language);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              onRejectOrder(order.id);
                              speakText(`Order rejected. AI is rematching to alternative nearby farmer.`, language);
                            }}
                            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-red-700 text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Order Confirmed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI DRIVER DISPATCH & TRANSIT DETAILS FOR FARMER */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-blue-50/60 rounded-2xl border border-emerald-200/90 text-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-700" />
                        <span className="font-extrabold text-gray-900">
                          AI Driver Assignment &amp; Live Tracking
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {driverStage === 'going_to_pickup'
                          ? '🚙 Driver heading to your village'
                          : driverStage === 'produce_collected'
                          ? '📦 Produce collected from farm gate'
                          : driverStage === 'delivered'
                          ? '✅ Delivered & payment settled'
                          : '🚚 Assigned & preparing route'}
                      </span>
                    </div>

                    {driverName ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/80 p-3 rounded-xl border border-emerald-100 text-gray-700">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Assigned Driver</span>
                          <div className="font-bold text-gray-900 flex items-center gap-1">
                            <span>{driverName}</span>
                            <span className="text-amber-500 font-normal text-[11px]">★{driverRating}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Driver Phone</span>
                          <a
                            href={`tel:${driverPhone}`}
                            className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                            title="Call driver to guide him to your village farm gate"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{driverPhone}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Call</span>
                          </a>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Vehicle</span>
                          <span className="font-semibold text-gray-800">{driverVehicle}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Your Village Pickup</span>
                          <span className="font-semibold text-emerald-900">
                            {transportJob?.farmerVillage || 'Gollapudi Village'} (Gate: {transportJob?.farmerPickupLocation || 'North Farm Gate'})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center justify-between">
                        <span>AI algorithm is matching the nearest vehicle with available capacity for this order.</span>
                      </div>
                    )}

                    {/* Step-by-Step Progress Pipeline */}
                    <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-bold">
                      <div className={`p-2 rounded-xl border ${
                        order.status !== 'placed' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}>
                        1. Order Confirmed
                      </div>
                      <div className={`p-2 rounded-xl border ${
                        driverName ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}>
                        2. Driver Assigned
                      </div>
                      <div className={`p-2 rounded-xl border ${
                        driverStage === 'produce_collected' || order.status === 'in_transit' || order.status === 'delivered'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : driverStage === 'going_to_pickup'
                          ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}>
                        3. Village Pickup
                      </div>
                      <div className={`p-2 rounded-xl border ${
                        order.status === 'delivered' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}>
                        4. Final Delivery
                      </div>
                    </div>

                    {/* Dynamic Driver Rematch / Change Option */}
                    {transportJob && order.status !== 'delivered' && (
                      <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-600">
                          Need a different vehicle or driver? You can re-assign to another driver in the fleet:
                        </span>

                        {reassigningJobId === transportJob.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  onAssignDriverToJob(transportJob.id, e.target.value);
                                  const newD = safeDrivers.find(d => d.id === e.target.value);
                                  setReassigningJobId(null);
                                  speakText(`Driver reassigned to ${newD?.name || 'new driver'}. They will receive your village pickup location.`, language);
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl border border-gray-300 bg-white text-xs font-medium"
                              defaultValue=""
                            >
                              <option value="" disabled>Select alternative driver...</option>
                              {availableIndependentDrivers.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name} — {d.vehicleName} ({d.capacityKg} kg) ★{d.rating}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setReassigningJobId(null)}
                              className="px-2 py-1 rounded-xl text-xs text-gray-500 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReassigningJobId(transportJob.id)}
                            className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300 shadow-2xs transition-colors"
                          >
                            🔄 Change Driver
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: CUSTOMER COMPLAINTS BOX */}
      {activeTab === 'complaints' && (
        <div className="space-y-5">
          {/* Rating Warning Banner */}
          <div className={`p-4 rounded-3xl border transition-all ${
            unresolvedComplaints.length > 0
              ? 'bg-red-50 border-red-300 text-red-950 ring-2 ring-red-400/20'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg font-bold ${
                unresolvedComplaints.length > 0 ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
              }`}>
                {unresolvedComplaints.length > 0 ? '⚠️' : '🛡️'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    {unresolvedComplaints.length > 0
                      ? 'Action Required: Resolve Buyer Complaints'
                      : 'Complaints Resolution Healthy'}
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                    Current Rating: ★ {currentRating}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-700">
                  {unresolvedComplaints.length > 0 ? (
                    <span>
                      <strong className="text-red-900 font-bold">CRITICAL POLICY:</strong> When consumers report issues with produce quality or damaged packages, the complaint routes directly to this dashboard box. <strong className="text-red-900 underline">If you do not respond and resolve complaints within 24 hours, your Farmer Rating will automatically decrease</strong>, causing AI algorithms to reduce your future order allocations and customer visibility.
                    </span>
                  ) : (
                    <span>
                      All consumer complaints have been addressed. Prompt resolutions protect your ★ 4.8 Farmer Trust score and keep your produce ranked at the top of the buyer marketplace.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Complaints Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Direct Buyer Complaints Box</h3>
              <p className="text-xs text-gray-500">
                Issues reported on your produce batches by consumers and retail buyers
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold">
                {unresolvedComplaints.length} Pending Resolution
              </span>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                {farmerComplaints.length - unresolvedComplaints.length} Resolved
              </span>
            </div>
          </div>

          {/* Complaints List */}
          {farmerComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-2xs space-y-2">
              <span className="text-4xl">🎉</span>
              <h4 className="font-bold text-gray-900 text-sm">No Complaints on Record</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Your produce quality and packing have zero pending dispute tickets. Keep maintaining rigorous pre-dispatch grading!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmerComplaints.map(cmp => {
                const isUnresolved = cmp.status !== 'resolved';
                const isCurrentlyResolving = resolvingComplaintId === cmp.id;

                return (
                  <div
                    key={cmp.id}
                    className={`bg-white rounded-3xl p-5 border transition-all ${
                      isUnresolved
                        ? 'border-red-200 shadow-xs ring-1 ring-red-100'
                        : 'border-gray-200/80 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">{cmp.id}</span>
                          <span className="text-[10px] text-gray-400">Order: {cmp.orderId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUnresolved
                              ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {isUnresolved ? '⚠️ Action Required • Rating At Risk' : '✅ Resolved by Farmer'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Filed by: <strong className="text-gray-900">{cmp.complainantName}</strong> ({cmp.complainantRole})
                        </p>
                      </div>

                      <div className="text-left sm:text-right text-xs">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold capitalize">
                          Issue: {cmp.subjectType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Complaint description */}
                    <div className="py-3 text-xs space-y-2">
                      <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100/80">
                        <span className="text-[10px] uppercase font-bold text-red-800 block">Buyer Reported:</span>
                        <p className="text-gray-800 font-medium mt-0.5">{cmp.description}</p>
                      </div>

                      {cmp.aiAttributionAnalysis && (
                        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/80 text-[11px] text-blue-900 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">KisanSetu AI Dispatch Audit: </strong>
                            <span>{cmp.aiAttributionAnalysis}</span>
                          </div>
                        </div>
                      )}

                      {/* Display farmer response if already resolved */}
                      {cmp.farmerResponse && (
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950">
                          <strong className="font-bold block text-emerald-900">Farmer Resolution Recorded:</strong>
                          <p className="mt-0.5">{cmp.farmerResponse}</p>
                          <span className="text-[10px] text-emerald-700 mt-1 block">
                            Resolved at: {cmp.resolvedAt || 'Today'} • Farmer Rating Protected (★ {currentRating})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action form if unresolved */}
                    {isUnresolved && (
                      <div className="pt-3 border-t border-gray-100">
                        {!isCurrentlyResolving ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-red-700 font-medium">
                              ⏳ Respond before timer expires to avoid automatic 0.4 rating deduction.
                            </span>
                            <button
                              onClick={() => {
                                setResolvingComplaintId(cmp.id);
                                setFarmerResponseNote('We apologize for the issue. A fresh replacement will be prioritized, and quality grading has been re-verified.');
                              }}
                              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-colors shadow-xs"
                            >
                              Resolve &amp; Protect Rating
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <h5 className="font-bold text-xs text-gray-900">
                              Submit Farmer Resolution &amp; Explanation
                            </h5>

                            <div className="space-y-2">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  Action Chosen:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {[
                                    { id: 'replacement', label: '🌾 Free Replacement Batch' },
                                    { id: 'refund', label: '💰 Authorize Escrow Refund' },
                                    { id: 'clarification', label: '📝 Packaging Clarification' },
                                  ].map(opt => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => setResolutionAction(opt.id)}
                                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-left ${
                                        resolutionAction === opt.id
                                          ? 'bg-emerald-700 text-white border-emerald-700'
                                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  Your Note to the Buyer:
                                </label>
                                <textarea
                                  value={farmerResponseNote}
                                  onChange={e => setFarmerResponseNote(e.target.value)}
                                  rows={2}
                                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  placeholder="Explain resolution, e.g., Fresh produce sent in next slot..."
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setResolvingComplaintId(null)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onResolveComplaint) {
                                      onResolveComplaint(cmp.id, farmerResponseNote, resolutionAction);
                                    } else {
                                      cmp.status = 'resolved';
                                      cmp.farmerResponse = farmerResponseNote;
                                      cmp.resolvedAt = 'Just now';
                                    }
                                    setResolvingComplaintId(null);
                                    speakText(
                                      `Complaint resolved successfully. Your farmer rating is protected and remains at four point eight stars.`,
                                      language
                                    );
                                  }}
                                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                                >
                                  Confirm Resolution &amp; Restore Rating
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: AI ON-DEMAND FLEET (RAPIDO-STYLE MATCHING) */}
      {activeTab === 'ai_fleet' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">AI On-Demand Fleet (Rapido-Style)</h3>
              <p className="text-xs text-gray-500">
                Independent drivers matched dynamically by AI based on proximity, capacity, and live availability
              </p>
            </div>
            <button
              onClick={() => setActiveTab('request_transport')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Create Dispatch Request</span>
            </button>
          </div>

          {/* Model Clarification Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛵</span>
              <h4 className="font-extrabold text-sm text-emerald-950">
                Decoupled Logistics Network — Rapido Matching Model
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                No Dedicated Ties
              </span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              In KisanSetu, <strong>no driver works under any single farmer</strong>. Drivers operate as an independent commercial sector, setting their own schedules (<strong>Part-Time or Full-Time</strong>) and toggle their live duty status. When you or a consumer place an order, KisanSetu AI automatically broadcasts and matches the job to the closest available driver with suitable vehicle capacity.
            </p>
          </div>

          {/* Available Independent Drivers cards */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Nearby Active Independent Transporters ({availableIndependentDrivers.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIndependentDrivers.map(drv => (
                <div
                  key={drv.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-bold">
                          🚚
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{drv.name}</h4>
                          <span className="text-xs text-gray-500">{drv.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          drv.isOnline && drv.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {drv.isOnline && drv.status === 'available' ? '● Online & Ready' : '● Offline / Busy'}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-1 capitalize font-medium">
                          {drv.workType.replace('_', '-')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Vehicle:</span>
                        <span className="font-bold">{drv.vehicleName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="font-bold text-emerald-700">{drv.capacityKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Availability:</span>
                        <span className="font-medium text-gray-700">{drv.availabilityHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">COD Cash In Hand:</span>
                        <span className="font-mono text-amber-800 font-bold">₹{drv.codCashInHand || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-amber-500 font-bold">★ {drv.rating} Rating</span>
                    <a
                      href={`tel:${drv.mobile}`}
                      className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{drv.mobile}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Transport Jobs ready to be assigned by AI */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Active Dispatch &amp; Transit Jobs</h4>
            <div className="space-y-3">
              {transportJobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{job.id}</span>
                      <span className="text-xs text-emerald-700 font-semibold">• {job.quantityKg} kg {job.product}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                        {job.status}
                      </span>
                      {job.paymentMethod && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {job.paymentMethod === 'cod' ? '💵 COD (Collect Cash)' : '💳 Online Escrow'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.farmerPickupLocation} ➔ {job.destination} ({job.distanceKm} km)
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-700">
                      <span>Driver Trip Fee: <strong className="text-blue-800">₹{job.transportEarnings}</strong></span>
                      {job.paymentAmountToCollect && job.paymentAmountToCollect > 0 && (
                        <span className="text-amber-800 font-bold">
                          • Cash to Collect at Doorstep: ₹{job.paymentAmountToCollect}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.assignedDriverId ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Matched: {job.assignedDriverName}</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const availableDriver = availableIndependentDrivers.find(d => d.isOnline) || availableIndependentDrivers[0];
                            if (availableDriver) {
                              onAssignDriverToJob(job.id, availableDriver.id);
                              speakText(`AI Rapido-style match successful! Dispatched trip to ${availableDriver.name}.`, language);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                          <span>AI Instant Match (Rapido)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REQUEST TRANSPORTATION */}
      {activeTab === 'request_transport' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
          <div className="pb-4 border-b border-gray-100 mb-5">
            <h3 className="text-lg font-bold text-gray-900">{t('request_transport', language)}</h3>
            <p className="text-xs text-gray-500">
              Create an ad-hoc transportation requirement. KisanSetu AI matches nearby drivers based on vehicle capacity, service area, and distance.
            </p>
          </div>

          <form onSubmit={handleRequestTransportSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Product
                </label>
                <input
                  type="text"
                  value={reqProduct}
                  onChange={e => setReqProduct(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  value={reqQty}
                  onChange={e => setReqQty(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Pickup Location
              </label>
              <input
                type="text"
                value={reqPickup}
                onChange={e => setReqPickup(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Destination
              </label>
              <input
                type="text"
                value={reqDest}
                onChange={e => setReqDest(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Delivery Time Window
                </label>
                <input
                  type="text"
                  value={reqDeliveryTime}
                  onChange={e => setReqDeliveryTime(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Vehicle Capacity Needed
                </label>
                <select
                  value={reqCapacity}
                  onChange={e => setReqCapacity(parseInt(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={500}>500 kg (3-Wheeler / Ape)</option>
                  <option value={750}>750 kg (Tata Ace)</option>
                  <option value={1200}>1,200 kg (Bolero Pickup)</option>
                  <option value={2000}>2,000 kg (Mini Truck)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('drivers')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
              >
                Submit Transport Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: BULK SUPPLY REQUESTS */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">{t('bulk_supply_requests', language)}</h3>
              <p className="text-xs text-gray-500">
                Institutional procurement requests routed to you by AI as part of multi-farmer fulfillment
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Bulk Privacy Architecture: </span>
              A bulk buyer placing an order does not broadcast raw notifications to every farmer. You only receive the specific allocation assigned to your available inventory (e.g. 300 kg at ₹40/kg) without unnecessary exposure of buyer private data.
            </div>
          </div>

          <div className="space-y-3">
            {bulkRequirements.map(bulk => {
              const myAlloc = bulk.fulfillmentPlan.find(f => f.farmerId === currentFarmerId);
              if (!myAlloc) return null;
              return (
                <div
                  key={bulk.id}
                  className="bg-white rounded-3xl p-5 border border-purple-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-bold shrink-0">
                      🏢
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">Bulk Request #{bulk.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          Institutional Pool
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-800 mt-1">
                        Requested: {myAlloc.allocatedQty} kg of {bulk.variety} {bulk.product} @ ₹{myAlloc.pricePerKg}/kg
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Destination: {bulk.destination} • Required by: {bulk.deliveryDeadline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Total Allocated Payout</span>
                      <span className="text-base font-extrabold text-purple-900">
                        ₹{(myAlloc.allocatedQty * myAlloc.pricePerKg).toLocaleString()}
                      </span>
                    </div>

                    {myAlloc.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onAcceptBulkAllocation(bulk.id, currentFarmerId);
                            speakText(`Accepted bulk supply allocation of ${myAlloc.allocatedQty} kg.`, language);
                          }}
                          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold"
                        >
                          Accept Allocation
                        </button>
                        <button
                          onClick={() => onRejectBulkAllocation(bulk.id, currentFarmerId)}
                          className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-red-50 hover:text-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span>Allocation Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: INVENTORY & EXTERNAL SALES */}
      {activeTab === 'inventory_sales' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">{t('inventory', language)}</h3>
              <p className="text-xs text-gray-500">
                Track live quantities and sync sales conducted outside the KisanSetu platform
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important Mandatory Warning: </span>
              {t('external_sale_warning', language)}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Crop &amp; Variety</th>
                  <th className="py-3 px-4">Initial Stock</th>
                  <th className="py-3 px-4">Current Available</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farmerListings.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={l.imageUrl}
                          alt={l.product}
                          className="w-9 h-9 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{l.product}</div>
                          <span className="text-[11px] text-gray-500">{l.variety}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">{l.originalQty} kg</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-extrabold text-emerald-800">{l.availableQty} kg</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">₹{l.farmerPrice}/kg</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.agingStatus === 'normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.agingStatus === 'aging'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {l.agingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditPriceModal(l)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200"
                      >
                        Edit Price
                      </button>
                      <button
                        onClick={() => {
                          setExternalSaleListing(l);
                          setExternalSaleQty(Math.min(100, l.availableQty));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200"
                      >
                        Update External Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PRICE MODAL WITH AI GUARDRAIL */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-emerald-100">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{t('edit_price', language)}</h3>
                <p className="text-xs text-emerald-200">
                  {editingListing.variety} {editingListing.product}
                </p>
              </div>
              <button
                onClick={() => setEditingListing(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-500">Current Selling Price:</span>
                <span className="font-bold text-gray-900">₹{editingListing.farmerPrice}/kg</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  New Selling Price (₹ per kg)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-base font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newPriceInput}
                    onChange={e => handlePriceInputChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Guardrail feedback */}
              {priceWarning ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Price Above Guardrail</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{priceWarning}</p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Price is within the active AI marketplace limit.</span>
                </div>
              )}

              <p className="text-[11px] text-gray-400">
                {t('price_guardrail_notice', language)}
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingListing(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={savePriceEdit}
                disabled={!!priceWarning}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Confirm &amp; Update Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE EXTERNAL SALE MODAL */}
      {externalSaleListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-amber-100">
            <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{t('update_external_sale', language)}</h3>
                <p className="text-xs text-amber-100">
                  {externalSaleListing.variety} {externalSaleListing.product}
                </p>
              </div>
              <button
                onClick={() => setExternalSaleListing(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t('external_sale_warning', language)}</span>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl text-xs">
                <span className="text-gray-500">Current Stock:</span>
                <span className="font-bold text-gray-900">{externalSaleListing.availableQty} kg</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Quantity Sold Outside Platform (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  max={externalSaleListing.availableQty}
                  value={externalSaleQty}
                  onChange={e => setExternalSaleQty(Math.min(externalSaleListing.availableQty, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Sale Channel / Buyer Type
                </label>
                <input
                  type="text"
                  value={externalSaleChannel}
                  onChange={e => setExternalSaleChannel(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="p-3 bg-gray-100 rounded-xl text-xs flex justify-between font-bold">
                <span className="text-gray-600">Remaining Platform Stock:</span>
                <span className="text-emerald-800">
                  {externalSaleListing.availableQty - externalSaleQty} kg
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setExternalSaleListing(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveExternalSale}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Confirm External Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
