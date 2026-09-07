import React, { useState } from 'react';
import {
  TransportJob,
  Driver,
  LanguageCode,
} from '../../types';
import { t } from '../../data/translations';
import { speakText } from '../../utils/speech';
import {
  Truck,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Navigation,
  Phone,
  AlertCircle,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface DriverSectorProps {
  language: LanguageCode;
  driver: Driver;
  transportJobs: TransportJob[];
  onAcceptJob: (jobId: string) => void;
  onUpdateJobStage?: (jobId: string, stage: 'going_to_pickup' | 'produce_collected' | 'in_transit' | 'delivered') => void;
  onCompleteJob: (jobId: string) => void;
  onOpenVoice: () => void;
}

export const DriverSector: React.FC<DriverSectorProps> = ({
  language,
  driver,
  transportJobs,
  onAcceptJob,
  onUpdateJobStage,
  onCompleteJob,
  onOpenVoice,
}) => {
  const [activeTab, setActiveTab] = useState<
    'available_jobs' | 'my_trips' | 'cod_escrow' | 'earnings' | 'profile'
  >('available_jobs');

  // Independent driver availability controls (AI On-Demand model)
  const [isOnline, setIsOnline] = useState<boolean>(driver?.isOnline ?? true);
  const [workType, setWorkType] = useState<'part_time' | 'full_time'>(driver?.workType ?? 'part_time');
  const [availabilityHours, setAvailabilityHours] = useState<string>(
    driver?.availabilityHours ?? '6:00 AM - 2:00 PM'
  );

  // Cash on Delivery & Wallet Balances
  const [codCashInHand, setCodCashInHand] = useState<number>(driver?.codCashInHand ?? 1840);
  const [walletBalance, setWalletBalance] = useState<number>(driver?.walletBalance ?? 3450);
  const [reconcileSuccessMsg, setReconcileSuccessMsg] = useState<string | null>(null);

  const activeDriver = driver || {
    id: 'driver-ravi',
    name: 'Ravi Teja',
    phone: '+91 98480 11223',
    vehicleType: 'Tata Ace (Chhota Hathi)',
    vehicleName: 'Tata Ace',
    registrationNumber: 'AP 16 TE 4092',
    capacityKg: 750,
    isAvailable: isOnline,
    rating: 4.8,
    totalTrips: 142,
    location: 'Bhavanipuram, Vijayawada',
    currentLocation: 'Bhavanipuram, Vijayawada',
    preferredRadiusKm: 35,
    workType: workType,
    availabilityHours: availabilityHours,
    isOnline: isOnline,
    codCashInHand: codCashInHand,
    walletBalance: walletBalance,
  };

  const jobsList = Array.isArray(transportJobs) ? transportJobs : [];

  // Filter jobs for this driver or open
  const availableJobs = jobsList.filter(
    j => j && (j.status === 'open' || (j.assignedDriverId === activeDriver.id && j.status === 'assigned'))
  );
  const myActiveJobs = jobsList.filter(
    j => j && j.assignedDriverId === activeDriver.id && (j.status === 'assigned' || j.status === 'in_transit')
  );
  const completedJobs = jobsList.filter(
    j => j && j.assignedDriverId === activeDriver.id && j.status === 'completed'
  );

  // Calculate earnings
  const completedEarnings = completedJobs.reduce((sum, j) => sum + (j.transportEarnings || 0), 0);
  const totalTripEarnings = completedEarnings + walletBalance;

  const handleToggleDuty = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    speakText(
      nextState
        ? 'You are now online. KisanSetu AI will match and broadcast nearby delivery trips with farm pickup coordinates.'
        : 'You are now offline. No new trip requests will be routed to you.',
      language
    );
  };

  const handleReconcileCod = () => {
    if (codCashInHand <= 0) return;
    const amountSettled = codCashInHand;
    setCodCashInHand(0);
    setReconcileSuccessMsg(`Successfully settled ₹${amountSettled} through AI Escrow. Farmer accounts credited.`);
    speakText(
      `₹${amountSettled} cash on delivery settled through automated AI escrow. Farmer accounts have received the produce cost, and your delivery commission is secured.`,
      language
    );
    setTimeout(() => setReconcileSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Driver Info & Independent Duty Status */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            🚚
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{activeDriver.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {activeDriver.vehicleName} ({activeDriver.capacityKg} kg)
              </span>
              <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
                ★ {activeDriver.rating}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800 capitalize border border-gray-200">
                {workType.replace('_', '-')} • {availabilityHours}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reg: <span className="font-mono text-gray-700 font-semibold">{activeDriver.registrationNumber}</span> • Base: {activeDriver.location} • <strong className="text-emerald-700 font-bold">Independent Fleet Partner</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Duty Toggle */}
          <button
            onClick={handleToggleDuty}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black shadow-xs transition-all ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            <span>{isOnline ? 'ONLINE: Ready for AI Trips' : 'OFFLINE: Rest Mode'}</span>
          </button>

          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <span>🎙️ Voice Assist</span>
          </button>
        </div>
      </div>

      {reconcileSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reconcileSuccessMsg}</span>
        </div>
      )}

      {/* AI Smart Dispatch & Cash Splitting Policy Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 rounded-3xl space-y-1.5 text-xs text-gray-800">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-extrabold text-amber-950 text-sm">
            Decoupled Driver Sector • AI Smart Dispatch &amp; Cash Splitting
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed">
          You are an <strong>independent driver</strong> and do not work under any single farmer. KisanSetu AI matches delivery jobs dynamically based on proximity and vehicle tonnage. When customers pay via <strong>Cash on Delivery (COD)</strong>, the cash collected is securely logged in your app custody. The <strong>AI splitting algorithm automatically routes delivery charges directly to your earnings wallet</strong>, while the produce amount is reconciled to the farmer.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Today's Jobs</span>
          <div className="text-xl font-black text-gray-900 mt-1">{myActiveJobs.length + completedJobs.length}</div>
          <span className="text-[10px] text-amber-700 font-semibold">{myActiveJobs.length} In Transit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">COD Cash in Hand</span>
          <div className="text-xl font-black text-amber-800 mt-1">₹{codCashInHand.toLocaleString()}</div>
          <span className="text-[10px] text-gray-500">Collected from buyers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Driver Wallet</span>
          <div className="text-xl font-black text-emerald-800 mt-1">₹{totalTripEarnings.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Net trip fees credited</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duty Model</span>
          <div className="text-sm font-black text-blue-900 mt-1 capitalize">{workType.replace('_', ' ')}</div>
          <span className="text-[10px] text-gray-500">{availabilityHours}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('available_jobs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'available_jobs'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Available AI Jobs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
            {availableJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my_trips')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my_trips'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Active Trips &amp; Routes</span>
          {myActiveJobs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
              {myActiveJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cod_escrow')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cod_escrow'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>COD &amp; AI Split Settlement</span>
          {codCashInHand > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              ₹{codCashInHand}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'earnings'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Trip Earnings Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Availability &amp; Work Model</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE JOBS */}
      {activeTab === 'available_jobs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Nearby AI-Matched Delivery Trips</h3>
              <p className="text-xs text-gray-500">
                Independent trip allocations matched to your {activeDriver.vehicleName} payload capacity ({activeDriver.capacityKg} kg)
              </p>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
              isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isOnline ? '🟢 Broadcasting Live AI Matches' : '⚪ Duty Paused (Go Online to Accept)'}
            </span>
          </div>

          {!isOnline && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <span>You are currently <strong>Offline</strong>. Turn your duty status Online to receive and accept trip broadcasts.</span>
              <button
                onClick={handleToggleDuty}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
              >
                Go Online
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableJobs.map(job => {
              const codAmount = job.paymentAmountToCollect || (job.transportEarnings + 540);
              const farmerShare = codAmount - job.transportEarnings;
              const farmerPhone = job.farmerPhone || '+91 98480 23451';
              const farmerVillage = job.farmerVillage || 'Gollapudi Village, Krishna Basin';

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-400 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">{job.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            {job.product}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            job.paymentMethod === 'cod'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {job.paymentMethod === 'cod' ? '💵 COD Order' : '💳 Online Paid'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          AI Matched to: <span className="font-bold text-gray-800">{activeDriver.name}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Your Trip Fee</span>
                        <span className="text-lg font-black text-emerald-800">
                          ₹{job.transportEarnings}
                        </span>
                      </div>
                    </div>

                    {/* AI Payment Splitting Preview */}
                    <div className="mt-3 p-2.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] space-y-1">
                      <div className="flex justify-between text-blue-950 font-bold">
                        <span>AI Split Algorithm:</span>
                        <span>{job.paymentMethod === 'cod' ? `Collect ₹${codAmount} Cash` : 'Escrow Direct'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>• Your Driver Payout:</span>
                        <span className="font-bold text-emerald-800">+₹{job.transportEarnings}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>• Farmer Crop Value:</span>
                        <span className="font-semibold text-gray-800">₹{farmerShare}</span>
                      </div>
                    </div>

                    {/* Farmer Collection & Pickup Details Panel */}
                    <div className="mt-3 p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                          👨‍🌾 Farmer Pickup Details
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                          Village Collection
                        </span>
                      </div>

                      <div className="space-y-1 text-gray-700">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Farmer:</span>
                          <span className="font-bold text-gray-900">{job.farmerName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Phone:</span>
                          <a
                            href={`tel:${farmerPhone}`}
                            className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-700" />
                            <span>{farmerPhone}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Call</span>
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Village:</span>
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            <span>{farmerVillage}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pickup Gate:</span>
                          <span className="font-semibold text-gray-800 text-right">{job.farmerPickupLocation}</span>
                        </div>
                        {job.farmerPickupInstructions && (
                          <div className="text-[11px] text-emerald-950 bg-white/80 p-2 rounded-xl border border-emerald-100 mt-1">
                            <strong>Note:</strong> {job.farmerPickupInstructions}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>Delivery Drop:</strong> {job.destination}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between text-gray-600">
                        <span>Payload: <strong>{job.quantityKg} kg {job.product}</strong></span>
                        <span>Distance: <strong>{job.distanceKm} km</strong></span>
                        <span>Window: <strong>{job.deliveryWindow}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      Payload: {Math.round((job.quantityKg / (activeDriver.capacityKg || 1)) * 100)}% load
                    </span>

                    {job.status === 'open' ? (
                      <button
                        onClick={() => {
                          onAcceptJob(job.id);
                          onUpdateJobStage?.(job.id, 'going_to_pickup');
                          speakText(`Accepted trip ${job.id}. Routing to farmer's village ${farmerVillage}.`, language);
                        }}
                        disabled={!isOnline}
                        className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                          isOnline
                            ? 'bg-amber-700 hover:bg-amber-800 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Accept Assigned Trip (₹{job.transportEarnings})
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onCompleteJob(job.id);
                          setWalletBalance(prev => prev + job.transportEarnings);
                          if (job.paymentMethod === 'cod') {
                            setCodCashInHand(prev => prev + codAmount);
                          }
                          speakText(`Delivery finished! ₹${job.transportEarnings} credited to wallet.`, language);
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Mark Delivery Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY TRIPS & ROUTES */}
      {activeTab === 'my_trips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Active Navigation &amp; Delivery Progress</h3>
              <p className="text-xs text-gray-500">
                Live delivery tasks and cash collection tracking
              </p>
            </div>
          </div>

          {myActiveJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-2xs space-y-2">
              <span className="text-4xl">🚚</span>
              <h4 className="font-bold text-gray-900 text-sm">No Active Trips In Transit</h4>
              <p className="text-xs text-gray-500">
                Head over to the "Available AI Jobs" tab to accept a trip.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveJobs.map(job => {
                const codAmount = job.paymentAmountToCollect || (job.transportEarnings + 540);

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900">{job.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          job.driverStage === 'going_to_pickup' || job.driverStage === 'assigned'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {job.driverStage === 'going_to_pickup' || job.driverStage === 'assigned'
                            ? '🚙 Heading to Farmer to Collect'
                            : '📦 Produce Collected • In Transit'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          job.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {job.paymentMethod === 'cod' ? `💵 COD: Collect ₹${codAmount}` : '💳 Online Escrow'}
                        </span>
                      </div>
                      <span className="text-base font-black text-emerald-800">
                        ₹{job.transportEarnings} Payout
                      </span>
                    </div>

                    {/* Step Tracker for Driver */}
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-700">1. Trip Assigned</span>
                        <span className={job.driverStage === 'produce_collected' || job.status === 'in_transit' ? 'text-emerald-700' : 'text-amber-700 animate-pulse'}>
                          2. Collect at {job.farmerVillage || 'Farm Village'}
                        </span>
                        <span className={job.status === 'completed' ? 'text-emerald-700' : 'text-gray-400'}>
                          3. Deliver to Buyer
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Farmer Pickup Card */}
                      <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Pickup: Farmer's Village</span>
                          </span>
                          <a
                            href={`tel:${job.farmerPhone || '+91 98480 23451'}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call Farmer</span>
                          </a>
                        </div>
                        <div className="text-gray-700 text-[11px] space-y-1">
                          <p><strong>Farmer:</strong> {job.farmerName} ({job.farmerPhone || '+91 98480 23451'})</p>
                          <p><strong>Village:</strong> {job.farmerVillage || 'Gollapudi Village, Krishna Basin'}</p>
                          <p><strong>Gate Location:</strong> {job.farmerPickupLocation}</p>
                          {job.farmerPickupInstructions && (
                            <p className="p-1.5 bg-white/80 rounded-lg text-emerald-900 border border-emerald-100">
                              <strong>Instructions:</strong> {job.farmerPickupInstructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Drop-off Consumer Card */}
                      <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-950 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-blue-700" />
                            <span>Delivery: Buyer Drop-off</span>
                          </span>
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                            {job.deliveryWindow}
                          </span>
                        </div>
                        <div className="text-gray-700 text-[11px] space-y-1">
                          <p><strong>Address:</strong> {job.destination}</p>
                          <p><strong>Distance:</strong> {job.distanceKm} km</p>
                          <p><strong>Produce:</strong> {job.quantityKg} kg of {job.product}</p>
                        </div>
                      </div>
                    </div>

                    {job.paymentMethod === 'cod' && (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                        <div>
                          <strong className="block font-bold">Doorstep Cash Collection Required:</strong>
                          <span>Collect exactly <strong>₹{codAmount}</strong> in cash from the customer upon handover.</span>
                        </div>
                        <span className="text-lg font-black text-amber-900">₹{codAmount}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-xs text-gray-500">
                        Payload: {job.quantityKg} kg of {job.product}
                      </span>

                      {/* Stage Action Buttons */}
                      <div className="flex items-center gap-2">
                        {job.driverStage !== 'produce_collected' && (
                          <button
                            onClick={() => {
                              onUpdateJobStage?.(job.id, 'produce_collected');
                              speakText(`Produce collected from farmer gate. Starting route to customer delivery point.`, language);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>✓ Arrived at Farm &amp; Collected Produce</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onCompleteJob(job.id);
                            setWalletBalance(prev => prev + job.transportEarnings);
                            if (job.paymentMethod === 'cod') {
                              setCodCashInHand(prev => prev + codAmount);
                            }
                            speakText(
                              job.paymentMethod === 'cod'
                                ? `Delivery completed. Cash of ₹${codAmount} logged in custody. ₹${job.transportEarnings} credited to your driver wallet.`
                                : `Delivery completed. ₹${job.transportEarnings} credited to your wallet.`,
                              language
                            );
                          }}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {job.paymentMethod === 'cod'
                              ? `Confirm Cash (₹${codAmount}) & Delivery Done`
                              : 'Confirm Delivery Complete'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CASH ON DELIVERY & AI SPLIT SETTLEMENT */}
      {activeTab === 'cod_escrow' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Cash on Delivery (COD) Custody &amp; AI Settlement</h3>
              <p className="text-xs text-gray-500">
                Transparent splitting algorithm dividing doorstep cash between farmer crop value and driver trip commission
              </p>
            </div>
            {codCashInHand > 0 && (
              <button
                onClick={handleReconcileCod}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-all"
              >
                <span>⚡ Settle ₹{codCashInHand} to Farmers via AI Escrow</span>
              </button>
            )}
          </div>

          {/* Educational Explainer of AI Splitting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
                1️⃣
              </div>
              <h4 className="font-extrabold text-sm text-gray-900">Doorstep Cash Collection</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                When consumer selects COD, driver receives 100% of order value in cash upon handing over fresh produce.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-800 font-bold">
                Logged in App: ₹{codCashInHand} In Hand
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
                2️⃣
              </div>
              <h4 className="font-extrabold text-sm text-gray-900">Driver Delivery Charge Split</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                KisanSetu AI splits out the delivery and trip fee immediately and credits it to your non-withdrawable Driver Wallet.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-800 font-bold">
                Driver Wallet: ₹{walletBalance}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold">
                3️⃣
              </div>
              <h4 className="font-extrabold text-sm text-gray-900">Farmer Produce Remittance</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                The produce cost portion is automatically cleared from your balance and settled directly into the respective farmer's bank account.
              </p>
              <div className="pt-2 text-xs font-mono text-blue-800 font-bold">
                Zero Salary Uncertainty
              </div>
            </div>
          </div>

          {/* Current Custody Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
                  Current Cash in App Custody
                </span>
                <span className="text-3xl font-black text-amber-900">
                  ₹{codCashInHand.toLocaleString()}
                </span>
              </div>
              {codCashInHand > 0 ? (
                <button
                  onClick={handleReconcileCod}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Deposit / Remit Crop Share to Farmers
                </button>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✅ All Farmer COD Remittances Up To Date
                </span>
              )}
            </div>

            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Recent AI COD Reconciliation Log
            </h5>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-gray-900">Order KS-ORD-9281 (Guntur Chillies 40kg)</span>
                  <span className="text-gray-500 block text-[11px]">Collected: ₹960 • Customer: Vijayawada Retail</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold block">+₹120 Driver Fee</span>
                  <span className="text-blue-700 font-semibold text-[11px]">₹840 Remitted to Farmer Ramesh</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-gray-900">Order KS-ORD-9104 (Banganapalle Mangoes 150kg)</span>
                  <span className="text-gray-500 block text-[11px]">Collected: ₹1,500 • Customer: FarmFresh Store</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold block">+₹250 Driver Fee</span>
                  <span className="text-blue-700 font-semibold text-[11px]">₹1,250 Remitted to Farmer Sitaram</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EARNINGS LEDGER */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Per-Trip Earnings Ledger</h3>
              <p className="text-xs text-gray-500">
                Transparent compensation record per trip completed — zero salary ambiguity
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Trip Reference</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Payload</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4 text-right">Trip Compensation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">JOB-KS-9021</td>
                  <td className="py-3 px-4 text-gray-600">Gollapudi ➔ Benz Circle, Vijayawada</td>
                  <td className="py-3 px-4">500 kg Tomato</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">COD Split</span></td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-800">₹450</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">JOB-KS-8812</td>
                  <td className="py-3 px-4 text-gray-600">Tadepalli ➔ Governorpet</td>
                  <td className="py-3 px-4">300 kg Onion</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">Online Escrow</span></td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-800">₹320</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">JOB-KS-8750</td>
                  <td className="py-3 px-4 text-gray-600">Ibrahimpatnam ➔ Mangalagiri</td>
                  <td className="py-3 px-4">650 kg Potato</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">COD Split</span></td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-800">₹580</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AVAILABILITY & WORK PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Driver Work Model &amp; Availability</h3>
            <p className="text-xs text-gray-500">
              Configure your schedule so the KisanSetu AI Smart Dispatch matching algorithm knows when to route trips to you
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Work Type Model:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setWorkType('part_time');
                    speakText('Switched to Part-Time mode. Flexible trip matching enabled.', language);
                  }}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                    workType === 'part_time'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="block text-sm">🛵 Part-Time</span>
                  <span className="text-[11px] font-normal opacity-85">Flexible shifts / After-hours</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorkType('full_time');
                    speakText('Switched to Full-Time mode. Full day priority dispatch active.', language);
                  }}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all ${
                    workType === 'full_time'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="block text-sm">🚚 Full-Time</span>
                  <span className="text-[11px] font-normal opacity-85">All-day logistics partner</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Availability Hours Window:</label>
              <select
                value={availabilityHours}
                onChange={e => setAvailabilityHours(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="6:00 AM - 2:00 PM">Morning Slot (6:00 AM - 2:00 PM)</option>
                <option value="2:00 PM - 10:00 PM">Evening Slot (2:00 PM - 10:00 PM)</option>
                <option value="Flexible (On-Demand)">Flexible / On-Demand Whenever Online</option>
                <option value="All Day (6:00 AM - 9:00 PM)">All Day (6:00 AM - 9:00 PM)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Full Name:</span>
                <span className="font-bold text-gray-900">{activeDriver.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Mobile Number:</span>
                <span className="font-bold text-gray-900">{activeDriver.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Vehicle Model:</span>
                <span className="font-bold text-gray-900">{activeDriver.vehicleName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Registration Number:</span>
                <span className="font-mono font-bold text-gray-900">{activeDriver.registrationNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Payload Capacity:</span>
                <span className="font-bold text-emerald-800">{activeDriver.capacityKg} kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Service Base:</span>
                <span className="font-bold text-gray-900">{activeDriver.location}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                speakText(`Profile preferences saved. Duty set to ${workType.replace('_', ' ')} for ${availabilityHours}.`, language);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Save Schedule &amp; Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
