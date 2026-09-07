import React, { useState } from 'react';
import {
  FarmerProduceListing,
  Order,
  Complaint,
  LanguageCode,
  ProductCategory,
} from '../../types';
import { PRODUCT_CATALOG } from '../../data/mockData';
import { t } from '../../data/translations';
import { speakText } from '../../utils/speech';
import {
  Search,
  MapPin,
  Truck,
  Package,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Volume2,
  Table,
  BarChart2,
  Navigation,
  MessageSquareWarning,
  Camera,
  Check,
  ArrowRight,
  Info,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ConsumerSectorProps {
  language: LanguageCode;
  listings: FarmerProduceListing[];
  orders: Order[];
  onPlaceOrder: (order: Order) => void;
  onSubmitComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt'>) => void;
  onOpenVoice: () => void;
  onOpenPricingTable: () => void;
  onOpenCharts: () => void;
}

export const ConsumerSector: React.FC<ConsumerSectorProps> = ({
  language,
  listings,
  orders,
  onPlaceOrder,
  onSubmitComplaint,
  onOpenVoice,
  onOpenPricingTable,
  onOpenCharts,
}) => {
  // Location First state
  const [consumerLocation, setConsumerLocation] = useState<string>('Benz Circle, Vijayawada');
  const [pinCode, setPinCode] = useState<string>('520010');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVariety, setSelectedVariety] = useState<string>('All');

  // Active View
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my_orders' | 'complaints'>('marketplace');

  // Checkout modal
  const [orderingListing, setOrderingListing] = useState<FarmerProduceListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'transport' | 'pickup'>('transport');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Flat 402, Sai Residency, Benz Circle, Vijayawada');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  // Complaint modal
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  const [complaintOrderId, setComplaintOrderId] = useState<string>('');
  const [complaintType, setComplaintType] = useState<any>('damaged_product');
  const [complaintDesc, setComplaintDesc] = useState<string>('');

  // Filter and AI-rank products based on: Distance, Availability, Variety, Quality, Price, Delivery feasibility
  const filteredListings = listings
    .filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.village.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVariety = selectedVariety === 'All' || item.variety === selectedVariety;
      return matchCat && matchSearch && matchVariety && item.availableQty > 0;
    })
    .sort((a, b) => {
      // AI ranking score based on distance + price + quality
      const scoreA = (a.quality === 'Premium' ? 2 : 1) / (a.distanceKm * a.farmerPrice);
      const scoreB = (b.quality === 'Premium' ? 2 : 1) / (b.distanceKm * b.farmerPrice);
      return scoreB - scoreA;
    });

  // Small order pooling calculations
  const isSmallOrder = orderQuantity <= 3;
  const initialEstimatedDelivery = isSmallOrder ? 50 : 35;
  const pooledOptimizedDelivery = isSmallOrder ? 40 : 30; // ₹10 savings via shared route
  const poolSavings = initialEstimatedDelivery - pooledOptimizedDelivery;

  const handleOpenOrder = (listing: FarmerProduceListing) => {
    setOrderingListing(listing);
    setOrderQuantity(1);
    setFulfillmentMethod('transport');
    setPaymentMethod('cod');
  };

  const handleConfirmOrder = () => {
    if (!orderingListing) return;

    const produceTotal = orderQuantity * orderingListing.farmerPrice;
    const finalDelivery = fulfillmentMethod === 'pickup' ? 0 : pooledOptimizedDelivery;

    const newOrder: Order = {
      id: `ORD-KS-${Math.floor(1000 + Math.random() * 9000)}`,
      batchId: orderingListing.batchId,
      consumerId: 'cons-1',
      consumerName: 'Ananya Sharma',
      consumerLocation: consumerLocation,
      items: [
        {
          listingId: orderingListing.id,
          product: orderingListing.product,
          variety: orderingListing.variety,
          quantity: orderQuantity,
          unitPrice: orderingListing.farmerPrice,
          totalPrice: produceTotal,
          farmerId: orderingListing.farmerId,
          farmerName: orderingListing.farmerName,
          farmerVillage: orderingListing.village,
          imageUrl: orderingListing.imageUrl,
          quality: orderingListing.quality,
        },
      ],
      fulfillmentType: fulfillmentMethod,
      deliveryAddress: fulfillmentMethod === 'transport' ? deliveryAddress : undefined,
      pickupPoint: fulfillmentMethod === 'pickup' ? `KisanSetu Collection Point - ${consumerLocation.split(',')[0]}` : undefined,
      pickupCode: fulfillmentMethod === 'pickup' ? `KS${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      status: 'ai_matching',
      totalProduceCost: produceTotal,
      originalDeliveryCharge: fulfillmentMethod === 'pickup' ? 0 : initialEstimatedDelivery,
      finalDeliveryCharge: finalDelivery,
      isPooled: fulfillmentMethod === 'transport' && isSmallOrder,
      poolSavings: fulfillmentMethod === 'transport' && isSmallOrder ? poolSavings : 0,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending_cod',
      produceAmount: produceTotal,
      deliveryAmount: finalDelivery,
      createdAt: 'Just now',
    };

    onPlaceOrder(newOrder);
    speakText(
      `Order placed successfully for ${orderQuantity} kg ${orderingListing.variety} ${orderingListing.product}. Payment method: ${
        paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
      }. AI escrow will split delivery charges to driver and produce cost to farmer.`,
      language
    );
    setOrderingListing(null);
    setActiveTab('my_orders');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintOrderId) return;

    const targetOrder = orders.find(o => o.id === complaintOrderId);
    const targetFarmerId = targetOrder?.items[0]?.farmerId || 'farmer-1';
    const targetFarmerName = targetOrder?.items[0]?.farmerName || 'Ravi Kumar';

    onSubmitComplaint({
      orderId: complaintOrderId,
      batchId: targetOrder?.batchId || 'BATCH-2026-TM88',
      complainantRole: 'consumer',
      complainantName: 'Ananya Sharma',
      subjectType: complaintType,
      description: complaintDesc,
      status: 'under_review',
      targetType: complaintType === 'driver_issue' || complaintType === 'damaged_product' ? 'driver' : 'farmer',
      farmerId: targetFarmerId,
      farmerName: targetFarmerName,
      aiAttributionAnalysis: `Dispatched directly to Farmer ${targetFarmerName}'s dashboard complaint box. Farmer must respond within 24 hours to prevent rating penalty. Pre-packing records verified.`,
    });

    speakText(`Complaint filed directly to Farmer ${targetFarmerName}'s dashboard. If the farmer fails to respond, their rating will decrease.`, language);
    setShowComplaintModal(false);
    setComplaintDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Location First Header Bar as mandated */}
      <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-xl shadow-md">
            📍
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              {t('location_first', language)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">{consumerLocation}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                PIN: {pinCode}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              AI prioritizes nearby farm clusters to minimize transport distance &amp; freshness loss
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Change Location</span>
          </button>
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold shadow-xs transition-colors"
          >
            <span>🎙️ Voice Search</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Best Nearby Produce</span>
          </button>

          <button
            onClick={() => setActiveTab('my_orders')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my_orders'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders &amp; Tracking</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'complaints'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>Complaints Box</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenPricingTable}
            className="flex items-center gap-1 text-xs text-blue-900 font-semibold hover:underline"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Compare Mandi Rates</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search crop or variety e.g. Hybrid Tomato, Basmati rice, Mango..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
                {['All', 'Vegetables', 'Cereals', 'Fruits', 'Pulses'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ranked by AI: Distance • Variety • Quality • Price • Feasibility</span>
              </div>
              <span>Showing {filteredListings.length} verified farm listings</span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Privacy Protection Notice */}
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.product}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-900 shadow-xs">
                        {listing.variety}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-700 text-white shadow-xs">
                        {listing.quality}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{listing.distanceKm} km away</span>
                    </div>
                  </div>

                  {/* Card Content - Strictly complying with Privacy Rule 18 & 19 */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-black text-gray-900">{listing.product}</h4>
                        {/* Only Farmer Name and Village as mandated */}
                        <div className="text-xs text-gray-600 font-medium">
                          Farmer: <span className="font-bold text-gray-800">{listing.farmerName}</span> • Village: <span className="font-bold text-gray-800">{listing.village}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-blue-900">₹{listing.farmerPrice}</span>
                        <span className="text-xs text-gray-500 block">/ kg</span>
                      </div>
                    </div>

                    {/* Stock & Delivery feasibility */}
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Available Fresh Stock:</span>
                        <span className="font-bold text-emerald-800">{listing.availableQty} kg</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Pickup &amp; Transport:</span>
                        <span className="text-blue-700 font-semibold">Ready Today (~₹35-₹45 est.)</span>
                      </div>
                    </div>

                    {/* Quality verification shield */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>AI Pre-packing inspection verified: Grade A produce</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenOrder(listing)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Order Fresh Produce</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS & TRACKING */}
      {activeTab === 'my_orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Your Orders &amp; Delivery Tracking</h3>
              <p className="text-xs text-gray-500">
                Transparent traceability without exposing sensitive farmer contact details
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map(order => {
              const item = order.items[0];
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-sm">{order.id}</span>
                        <span className="text-[10px] text-gray-400">Batch: {order.batchId}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {order.fulfillmentType === 'pickup' ? '📍 Self Pickup' : '🚚 Transportation'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentMethod === 'online'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {order.paymentMethod === 'online' ? '💳 Paid Online' : '💵 Cash on Delivery'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mt-0.5 block">Placed on {order.createdAt}</span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-400 block">Total Amount</span>
                      <span className="text-base font-black text-emerald-800">
                        ₹{order.totalProduceCost + order.finalDeliveryCharge}
                      </span>
                      <div className="text-[10px] text-gray-500 flex items-center sm:justify-end gap-1.5 mt-0.5">
                        <span className="text-emerald-700 font-semibold">Farmer: ₹{order.totalProduceCost}</span>
                        <span>•</span>
                        <span className="text-blue-700 font-semibold">Driver: ₹{order.finalDeliveryCharge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Item details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.product}
                      className="w-16 h-16 rounded-2xl object-cover border border-emerald-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 text-xs space-y-0.5">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {item.quantity} kg of {item.variety} {item.product}
                      </h4>
                      <p className="text-gray-600">
                        Farmer: <span className="font-semibold">{item.farmerName}</span> • Village: {item.farmerVillage}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        Produce: ₹{item.totalPrice} • Transport Charge: ₹{order.finalDeliveryCharge}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Optimization Banner if Pooled */}
                  {order.isPooled && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-800">
                          {t('delivery_optimized_title', language)}
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          Original estimate was ₹{order.originalDeliveryCharge}. Reduced to <span className="font-bold">₹{order.finalDeliveryCharge}</span> because your order was combined with compatible nearby deliveries along the same route!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Self Pickup Code if Pickup */}
                  {order.fulfillmentType === 'pickup' && (
                    <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs text-purple-900">
                      <div>
                        <span className="font-bold block">📍 {order.pickupPoint}</span>
                        <span className="text-[11px] text-purple-700">Ready for collection today by 5:00 PM</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-purple-500 block uppercase font-bold">Pickup Code</span>
                        <span className="text-sm font-mono font-black text-purple-900 bg-white px-2.5 py-1 rounded-lg border border-purple-300">
                          {order.pickupCode || 'KS7392'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Driver Assignment details if transported */}
                  {order.driverName && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-700" />
                        <div>
                          <span className="font-bold">Assigned Transporter: </span>
                          <span>{order.driverName} ({order.driverVehicle})</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/70 text-amber-900">
                        In Route
                      </span>
                    </div>
                  )}

                  {/* Order Lifecycle Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-2">
                      <span className={order.status ? 'text-emerald-700 font-bold' : ''}>1. Placed</span>
                      <span className="text-emerald-700 font-bold">2. AI Matched</span>
                      <span className="text-emerald-700 font-bold">3. Packed</span>
                      <span className={order.status === 'transport_confirmed' || order.status === 'in_transit' || order.status === 'delivered' ? 'text-emerald-700 font-bold' : ''}>
                        4. Transport
                      </span>
                      <span className={order.status === 'delivered' ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                        5. Delivered
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full w-4/5"></div>
                    </div>
                  </div>

                  {/* Actions: Report Complaint or Rate */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setComplaintOrderId(order.id);
                        setShowComplaintModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                    >
                      Report Issue / Complaint
                    </button>
                    <button
                      onClick={() => speakText(`Order status: In transit to ${order.deliveryAddress}. Estimated delivery by 3:30 PM.`, language)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-800 hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Update</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">KisanSetu Dispute &amp; Complaint Box</h3>
            <p className="text-xs text-gray-500">
              Submit issues regarding quality, transit damage, or quantity with transparent photo verification
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Objective AI Accountability: </span>
              {t('ai_attribution_note', language)} AI compares pre-packing evidence photos against post-delivery reports to establish whether damage occurred during transportation or prior to packing.
            </div>
          </div>

          <form onSubmit={handleComplaintSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Select Order ID
              </label>
              <select
                value={complaintOrderId}
                onChange={e => setComplaintOrderId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                required
              >
                <option value="">-- Choose an Order --</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.items[0]?.product} ({o.items[0]?.quantity} kg)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nature of Complaint
              </label>
              <select
                value={complaintType}
                onChange={e => setComplaintType(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value="damaged_product">Damaged Product (Crushed / Bruised during Transit)</option>
                <option value="poor_quality">Poor Produce Quality (Rot / Wilted)</option>
                <option value="missing_quantity">Missing Quantity / Underweight</option>
                <option value="driver_issue">Driver Behavior / Delay Issue</option>
                <option value="wrong_product">Wrong Product or Variety</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Description of the Issue
              </label>
              <textarea
                rows={3}
                value={complaintDesc}
                onChange={e => setComplaintDesc(e.target.value)}
                placeholder="Explain the problem clearly..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
              <Camera className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <span>Attach photo evidence of received produce</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Submit Complaint for Review
            </button>
          </form>
        </div>
      )}

      {/* CHECKOUT MODAL WITH SMALL ORDER WARNING & POOLING NOTICE */}
      {orderingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-blue-100 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-800 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Order Produce</h3>
                <p className="text-xs text-blue-200">
                  {orderingListing.variety} {orderingListing.product} • Farmer: {orderingListing.farmerName} ({orderingListing.village})
                </p>
              </div>
              <button onClick={() => setOrderingListing(null)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Product summary */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <img
                  src={orderingListing.imageUrl}
                  alt={orderingListing.product}
                  className="w-14 h-14 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-gray-900">{orderingListing.variety} {orderingListing.product}</span>
                  <p className="text-gray-500">Quality: <span className="font-semibold text-emerald-800">{orderingListing.quality}</span></p>
                  <p className="font-black text-blue-900">₹{orderingListing.farmerPrice} per kg</p>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Quantity (kg)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={orderingListing.availableQty}
                    value={orderQuantity}
                    onChange={e => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 p-2 bg-gray-50 border border-gray-300 rounded-xl text-base font-bold text-gray-900 text-center"
                  />
                  <div className="flex gap-1.5">
                    {[1, 2, 5, 10].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setOrderQuantity(qty)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          orderQuantity === qty ? 'bg-blue-800 text-white' : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {qty} kg
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fulfillment choice */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  How would you like to receive your order?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('transport')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      fulfillmentMethod === 'transport'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Truck className="w-4 h-4 text-blue-700" />
                      <span>{t('transport_required', language)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Have your order transported to your location.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('pickup')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      fulfillmentMethod === 'pickup'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/20'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <MapPin className="w-4 h-4 text-purple-700" />
                      <span>{t('self_pickup', language)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Collect with secure code from local hub (₹0 charge).
                    </p>
                  </button>
                </div>
              </div>

              {/* Small order pooling notice */}
              {fulfillmentMethod === 'transport' && isSmallOrder && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>⚠️ Small Order Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {t('small_order_notice', language)}
                  </p>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-bold">
                    <span>Estimated Transport:</span>
                    <span className="text-amber-900">₹30 – ₹50 (Optimized to ~₹40 upon pooling)</span>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {fulfillmentMethod === 'transport' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
              )}

              {/* Payment Method Selection: COD vs Online */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5">
                        <span>💵</span>
                        <span>Cash on Delivery</span>
                      </span>
                      {paymentMethod === 'cod' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Pay cash to driver at delivery. AI splits amount between driver &amp; farmer.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'online'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5">
                        <span>💳</span>
                        <span>Online Payment</span>
                      </span>
                      {paymentMethod === 'online' && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      UPI, Cards &amp; NetBanking. Instant AI escrow split directly to bank accounts.
                    </p>
                  </button>
                </div>
              </div>

              {/* AI Smart Payment Split Breakdown */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-gray-900">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Automated Payment Splitting</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono font-bold">
                    Escrow Engine
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/90 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">To Farmer Account</span>
                    <span className="font-black text-emerald-800 text-sm">
                      ₹{orderQuantity * orderingListing.farmerPrice}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Product Price (100%)</span>
                  </div>

                  <div className="bg-white/90 p-2 rounded-xl border border-blue-200">
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">To Driver Account</span>
                    <span className="font-black text-blue-800 text-sm">
                      ₹{fulfillmentMethod === 'pickup' ? 0 : pooledOptimizedDelivery}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Delivery Charges</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-600 leading-tight">
                  {paymentMethod === 'cod'
                    ? '💵 Cash is collected by the driver on delivery. KisanSetu AI ledger records cash in hand and automatically routes delivery fees to driver while reconciling produce dues with the farmer.'
                    : '💳 Paid by user online: AI algorithm splits payment instantaneously — produce cost reaches farmer bank account, delivery fee reaches driver wallet.'}
                </p>
              </div>

              {/* Pricing breakdown */}
              <div className="p-3 bg-gray-100 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Produce Cost ({orderQuantity} kg @ ₹{orderingListing.farmerPrice}):</span>
                  <span className="font-bold">₹{orderQuantity * orderingListing.farmerPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transportation / Delivery:</span>
                  <span className="font-bold">
                    {fulfillmentMethod === 'pickup' ? '₹0 (Self Pickup)' : `₹${pooledOptimizedDelivery}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between font-extrabold text-sm text-gray-900">
                  <span>Total Payable:</span>
                  <span className="text-emerald-800">
                    ₹{orderQuantity * orderingListing.farmerPrice + (fulfillmentMethod === 'pickup' ? 0 : pooledOptimizedDelivery)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setOrderingListing(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Confirm &amp; Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION SELECTION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-blue-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{t('location_first', language)}</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setConsumerLocation('Benz Circle, Vijayawada');
                  setPinCode('520010');
                  setShowLocationModal(false);
                }}
                className="w-full p-3 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs flex items-center gap-2 hover:bg-blue-100 text-left"
              >
                <Navigation className="w-4 h-4 text-blue-700" />
                <span>Use Current Location (Benz Circle, Vijayawada)</span>
              </button>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Or select regional city hub:</span>
                {['Vijayawada Outer Ring', 'Gollapudi Mandi', 'Tadepalli, Guntur', 'Bhavanipuram, Vijayawada'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => {
                      setConsumerLocation(loc);
                      setPinCode('520012');
                      setShowLocationModal(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-800 flex items-center justify-between"
                  >
                    <span>{loc}</span>
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
