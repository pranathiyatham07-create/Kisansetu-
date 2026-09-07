import React, { useState } from 'react';
import { Sector, LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { t } from '../../data/translations';
import { speakText, isVoiceEnabled, toggleVoice } from '../../utils/speech';
import {
  Sprout,
  ShoppingBag,
  Building2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Globe,
  Volume2,
  VolumeX,
  Shield,
  Layers,
  Sparkles,
  MapPin,
  TrendingUp,
  User,
  Phone,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface SectorSelectorProps {
  language: LanguageCode;
  onChangeLanguage?: (lang: LanguageCode) => void;
  onSelectLanguage?: (lang: LanguageCode) => void;
  onSelectSector: (sector: Sector) => void;
  onOpenPricingTable?: () => void;
  onOpenCharts?: () => void;
  onOpenVoice?: () => void;
  initialUserName?: string;
  initialLocation?: string;
  onUpdateUserProfile?: (profile: { name: string; phone: string; location: string; language: LanguageCode }) => void;
}

export const SectorSelector: React.FC<SectorSelectorProps> = ({
  language,
  onChangeLanguage,
  onSelectLanguage,
  onSelectSector,
  onOpenPricingTable,
  onOpenCharts,
  onOpenVoice,
  initialUserName = 'Ravi Kumar',
  initialLocation = 'Vijayawada Central Mandi, AP',
  onUpdateUserProfile,
}) => {
  // Step state: 'get_started' -> 'location' -> 'sectors'
  const [currentStep, setCurrentStep] = useState<'get_started' | 'location' | 'sectors'>('get_started');

  // Location form state
  const [userName, setUserName] = useState<string>(initialUserName);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98480 23451');
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [locationMode, setLocationMode] = useState<'preset' | 'custom'>('preset');
  const [isGpsDetecting, setIsGpsDetecting] = useState<boolean>(false);
  const [gpsConfirmed, setGpsConfirmed] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(isVoiceEnabled());

  const handleToggleVoice = () => {
    const next = toggleVoice();
    setIsVoiceActive(next);
  };

  const popularLocations = [
    { name: 'Vijayawada Central Mandi, AP', type: 'Central Terminal Mandi', icon: '🌾' },
    { name: 'Gollapudi Agricultural Market Yard, AP', type: 'Primary Produce Yard', icon: '🥬' },
    { name: 'Guntur Central Yard (Chilli & Cotton), AP', type: 'Major Commercial Mandi', icon: '🌶️' },
    { name: 'Tenali Krishna Valley Basin, AP', type: 'Fertile River Basin', icon: '🌾' },
    { name: 'Mangalagiri Agricultural Hub, AP', type: 'Regional Aggregation Center', icon: '📦' },
    { name: 'Amaravati Capital Agri Region, AP', type: 'FPO & Cooperative Zone', icon: '🏛️' },
    { name: 'Eluru & Godavari Basin, AP', type: 'Paddy & Horticulture Belt', icon: '🌴' },
    { name: 'Tirupati / Rayalaseema Mandi, AP', type: 'Fruit & Vegetable Yard', icon: '🥭' },
    { name: 'Bowenpally Agricultural Terminal, Hyderabad', type: 'Metro Wholesale Mandi', icon: '🏢' },
  ];

  const handleLangChange = (l: LanguageCode) => {
    onChangeLanguage?.(l);
    onSelectLanguage?.(l);
  };

  const handleDetectGpsLocation = () => {
    setIsGpsDetecting(true);
    setTimeout(() => {
      setSelectedLocation('Gollapudi Farm Gate, Vijayawada (16.541°N, 80.598°E)');
      setLocationMode('preset');
      setIsGpsDetecting(false);
      setGpsConfirmed(true);
      speakText('GPS location detected: Gollapudi Agricultural Zone, Krishna District', language);
    }, 600);
  };

  const handleProceedToSectors = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalLocation = locationMode === 'custom' && customLocation ? customLocation : selectedLocation;
    onUpdateUserProfile?.({
      name: userName || 'Ravi Kumar',
      phone: phoneNumber || '+91 98480 23451',
      location: finalLocation,
      language: language,
    });
    speakText(`Location confirmed as ${finalLocation}. Now select your sector.`, language);
    setCurrentStep('sectors');
  };

  const activeLocationDisplay = locationMode === 'custom' && customLocation ? customLocation : selectedLocation;

  const sectors = [
    {
      id: 'farmer' as Sector,
      icon: '👨‍🌾',
      title: t('farmer_sector', language),
      subtitle: 'Farmers & Farmer Producer Organizations (FPOs)',
      desc: 'List farm produce with AI Mandi price guardrails, dispatch independent transport on-demand, resolve customer complaints directly, and protect your marketplace rating.',
      features: [
        'Real-time Mandi AI Price Guardrails',
        'Direct Consumer & Bulk Orders',
        '🚚 On-Demand Independent Fleet Dispatch',
        '⚠️ Customer Complaints & Rating Protection',
      ],
      gradient: 'from-emerald-700 to-green-800',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      demoUser: `${userName} (Farmer)`,
      accentColor: 'emerald',
    },
    {
      id: 'consumer' as Sector,
      icon: '🛒',
      title: t('consumer_sector', language),
      subtitle: 'Household & Individual Consumers',
      desc: 'Location-first direct farm produce shopping. Pay via Cash on Delivery or Online with automated AI split to farmers and drivers.',
      features: [
        'Nearby Farm-Fresh Direct Listings',
        '💵 Cash on Delivery & Online Payments',
        '🤖 Automated AI Split (Crop to Farmer, Trip to Driver)',
        'Small-Order Pooled Transport Savings',
      ],
      gradient: 'from-blue-700 to-indigo-800',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      demoUser: 'Ananya Sharma (Consumer)',
      accentColor: 'blue',
    },
    {
      id: 'bulk_buyer' as Sector,
      icon: '🏢',
      title: t('bulk_buyer_sector', language),
      subtitle: 'Hotels, Supermarkets, Hostels & Food Processors',
      desc: 'Post institutional high-volume requirements with deadlines and target pricing. AI aggregates multi-farmer supply and manages failed-order recovery.',
      features: [
        'Post High-Volume Requirements',
        'Multi-Farmer Aggregate Fulfillment',
        'Direct Transparent Farm Sourcing',
        'AI Failed-Order Auto Re-allocation',
      ],
      gradient: 'from-purple-700 to-violet-900',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      demoUser: 'Hotel Grand Rayalaseema',
      accentColor: 'purple',
    },
    {
      id: 'driver' as Sector,
      icon: '🚚',
      title: t('driver_sector', language),
      subtitle: 'Independent On-Demand Transport Fleet',
      desc: 'Independent drivers (Tata Ace, Bolero Pickup, 3-Wheelers). Work freely (Part-Time or Full-Time). AI matches orders directly with farm collection details. Retain COD cash with automated AI settlement.',
      features: [
        'No Middleman Boss: Independent Fleet',
        'AI Smart Dispatch & Farm Gate Collection',
        'Part-Time / Full-Time Self Schedule',
        '💵 Direct COD Cash in Hand & Split Settlement',
      ],
      gradient: 'from-amber-700 to-orange-800',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      demoUser: 'Ravi Teja (Tata Ace 750kg)',
      accentColor: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white/95 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl shadow-xs">
            🌾
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-emerald-950 block leading-tight">
              KisanSetu
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 tracking-wide block uppercase">
              AI Agricultural &amp; Independent Logistics Network
            </span>
          </div>
        </div>

        {/* Top Controls: Language & Voice */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice On/Off Toggle (Off by default so it does not irritate educators) */}
          <button
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
            title={isVoiceActive ? 'Voice is ON (Click to Mute)' : 'Voice is Muted (Click to Turn On Voice)'}
          >
            {isVoiceActive ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span className="text-[11px] sm:text-xs">
              {isVoiceActive ? 'Voice: ON' : 'Voice: OFF'}
            </span>
          </button>

          <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={language}
              onChange={e => handleLangChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              <span className="text-xs">🎙️</span>
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>
          )}
        </div>
      </header>

      {/* 3-Step Navigation Breadcrumb / Stepper */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 sm:gap-4 text-xs font-bold">
          {/* Step 1: Get Started */}
          <button
            type="button"
            onClick={() => setCurrentStep('get_started')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 'get_started'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 'get_started' ? 'bg-white text-emerald-900 font-black' : 'bg-emerald-100 text-emerald-800'
            }`}>
              1
            </span>
            <span>Get Started</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

          {/* Step 2: Location */}
          <button
            type="button"
            onClick={() => setCurrentStep('location')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 'location'
                ? 'bg-emerald-700 text-white shadow-xs'
                : currentStep === 'sectors'
                ? 'text-emerald-800 hover:bg-emerald-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 'location'
                ? 'bg-white text-emerald-900 font-black'
                : currentStep === 'sectors'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {currentStep === 'sectors' ? '✓' : '2'}
            </span>
            <span>Set Location</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />

          {/* Step 3: Selecting a Sector */}
          <button
            type="button"
            onClick={() => {
              if (currentStep !== 'get_started') {
                setCurrentStep('sectors');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
              currentStep === 'sectors'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 'sectors' ? 'bg-white text-emerald-900 font-black' : 'bg-gray-100 text-gray-500'
            }`}>
              3
            </span>
            <span>Select Sector</span>
          </button>
        </div>
      </div>

      {/* STEP 1: GET STARTED */}
      {currentStep === 'get_started' && (
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col items-center justify-center text-center">
          {/* Kisan Setu Icon Hero */}
          <div className="relative mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-500 text-white flex items-center justify-center text-6xl shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-300">
              🌾
            </div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-md border border-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Unified Agro</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold mb-3">
            <span>Step 1: Welcome to KisanSetu</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-3">
            Kisan<span className="text-emerald-700">Setu</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl font-medium leading-relaxed mb-8">
            The direct national agricultural platform connecting farmers, consumers, bulk buyers, and independent transport drivers with real-time AI Mandi price guardrails and on-demand logistics.
          </p>

          {/* 4 Pillars Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full mb-8 text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-emerald-300 transition-colors">
              <span className="text-2xl mb-1 block">👨‍🌾</span>
              <div className="text-xs font-bold text-gray-900">Farmers &amp; FPOs</div>
              <p className="text-[11px] text-gray-500 mt-0.5">Mandi rates &amp; AI price protection</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-blue-300 transition-colors">
              <span className="text-2xl mb-1 block">🛒</span>
              <div className="text-xs font-bold text-gray-900">Consumers</div>
              <p className="text-[11px] text-gray-500 mt-0.5">Farm fresh, COD &amp; online split</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-purple-300 transition-colors">
              <span className="text-2xl mb-1 block">🏢</span>
              <div className="text-xs font-bold text-gray-900">Bulk Buyers</div>
              <p className="text-[11px] text-gray-500 mt-0.5">Multi-farmer aggregate supply</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-amber-300 transition-colors">
              <span className="text-2xl mb-1 block">🚚</span>
              <div className="text-xs font-bold text-gray-900">Independent Drivers</div>
              <p className="text-[11px] text-gray-500 mt-0.5">AI Smart Dispatch &amp; COD wallet</p>
            </div>
          </div>

          {/* Primary GET STARTED Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                speakText('Welcome to Kisan Setu. Step two: Please select your location and agricultural mandi region.', language);
                setCurrentStep('location');
              }}
              className="px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base shadow-lg shadow-emerald-700/25 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const intro = 'Kisan Setu connects farmers directly with consumers and institutional buyers, powered by an independent on-demand transport fleet.';
                speakText(intro, language);
              }}
              className="px-4 py-3.5 rounded-2xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Listen Overview</span>
            </button>
          </div>

          {/* Platform Capability Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] text-gray-500">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200">
              ⚡ Real-time Mandi AI Rates
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200">
              💵 COD &amp; Online Escrow
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200">
              📍 100% Location-First Matching
            </span>
          </div>
        </main>
      )}

      {/* STEP 2: LOCATION */}
      {currentStep === 'location' && (
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 sm:py-10 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-lg space-y-6">
            {/* Top header of Location Step */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('get_started')}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Back to Get Started"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase">
                      Step 2 of 3
                    </span>
                    <h2 className="text-xl font-extrabold text-gray-900">Set Your Location</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your location tailors local mandi benchmarks, farm listings, and fleet dispatch
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl font-bold">
                📍
              </div>
            </div>

            <form onSubmit={handleProceedToSectors} className="space-y-5">
              {/* GPS Auto-Detect Banner */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className={`w-4 h-4 ${isGpsDetecting ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-950">Auto-Detect GPS Coordinates</h4>
                    <p className="text-[11px] text-emerald-800">
                      Instantly lock onto your farm gate or current mandi yard location.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectGpsLocation}
                  disabled={isGpsDetecting}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className={`w-3.5 h-3.5 ${isGpsDetecting ? 'animate-spin' : ''}`} />
                  <span>{isGpsDetecting ? 'Detecting GPS...' : '📍 Auto-Detect GPS'}</span>
                </button>
              </div>

              {gpsConfirmed && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span><strong>Locked Location:</strong> {selectedLocation}</span>
                </div>
              )}

              {/* Location Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Primary Agricultural Mandi Hub</span>
                </label>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setLocationMode('preset')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      locationMode === 'preset'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🌾 Regional Agricultural Mandis
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      locationMode === 'custom'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ✍️ Enter Custom Village / Town
                  </button>
                </div>

                {locationMode === 'preset' ? (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {popularLocations.map((loc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc.name);
                          setGpsConfirmed(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedLocation === loc.name
                            ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-1 ring-emerald-500'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{loc.icon}</span>
                          <div>
                            <div className="text-xs font-bold">{loc.name}</div>
                            <div className="text-[10px] text-gray-500">{loc.type}</div>
                          </div>
                        </div>
                        {selectedLocation === loc.name && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={e => setCustomLocation(e.target.value)}
                      placeholder="e.g., Pedana Village, Krishna District, AP"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Type your specific village, FPO cluster, or municipality name.
                    </p>
                  </div>
                )}
              </div>

              {/* Name and Mobile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Your Name / Entity</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="e.g. Ravi Kumar, Ananya Sharma"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>Mobile (For SMS &amp; Dispatch)</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+91 98480 23451"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose App Language</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLangChange(lang.code)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        language === lang.code
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{lang.nativeName}</div>
                      <div className="text-[9px] text-gray-500">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button to go to Sector Selection */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Confirm Location &amp; Select Sector</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>
      )}

      {/* STEP 3: SELECTING A SECTOR */}
      {currentStep === 'sectors' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* User Profile Bar */}
          <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-lg font-bold">
                👤
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900">{userName || 'KisanSetu User'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Location Confirmed
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-700">📍 {activeLocationDisplay}</span>
                  <span>•</span>
                  <span>🌐 {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep('location')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Change Location</span>
              </button>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 mb-2 inline-block">
              Step 3 of 3: Selecting a Sector
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Select Your Operational Sector
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Choose the role you wish to enter. You can switch sectors at any time from the top navigation bar.
            </p>

            {/* Quick links to pricing table & demand analysis */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs">
              {onOpenPricingTable && (
                <button
                  onClick={onOpenPricingTable}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-semibold shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📊 Mandi Rates &amp; AI Guardrails</span>
                </button>
              )}
              {onOpenCharts && (
                <button
                  onClick={onOpenCharts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-900 font-semibold shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>📈 7-Day Demand vs Supply Analysis</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Main Sectors Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {sectors.map(sec => (
              <div
                key={sec.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                {/* Card top banner */}
                <div className={`p-5 bg-gradient-to-br ${sec.gradient} text-white flex flex-col gap-2 relative overflow-hidden`}>
                  <div className="text-4xl">{sec.icon}</div>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">{sec.title}</h3>
                    <p className="text-xs text-white/80 leading-snug">{sec.subtitle}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.desc}</p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Core Capabilities
                    </span>
                    {sec.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Role Profile:</span>
                    <span className="font-semibold text-gray-800">{sec.demoUser}</span>
                  </div>

                  <button
                    onClick={() => {
                      speakText(`Entering ${sec.title}. Loading localized dashboard.`, language);
                      onSelectSector(sec.id);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                      sec.id === 'farmer'
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : sec.id === 'consumer'
                        ? 'bg-blue-700 hover:bg-blue-800 text-white'
                        : sec.id === 'bulk_buyer'
                        ? 'bg-purple-700 hover:bg-purple-800 text-white'
                        : 'bg-amber-700 hover:bg-amber-800 text-white'
                    }`}
                  >
                    <span>Enter as {sec.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom admin hub entry */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onSelectSector('admin')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4 text-gray-700" />
              <span>Switch to Admin &amp; Ecosystem Oversight Dashboard</span>
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/70 py-4 px-4 text-center text-xs text-gray-500">
        <p>🌾 KisanSetu Agricultural Coordination System • Prototype for Smart India Agricultural Technology</p>
      </footer>
    </div>
  );
};
