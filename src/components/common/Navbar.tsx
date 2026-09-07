import React, { useState, useEffect } from 'react';
import { Sector, LanguageCode, NotificationItem } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { t } from '../../data/translations';
import { speakText, isVoiceEnabled, toggleVoice } from '../../utils/speech';
import {
  Globe,
  Mic,
  Table,
  BarChart2,
  Bell,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronDown,
  ArrowRightLeft,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeSector: Sector;
  onChangeSector?: (sector: Sector) => void;
  onSelectSector?: (sector: Sector) => void;
  language: LanguageCode;
  onChangeLanguage?: (lang: LanguageCode) => void;
  onSelectLanguage?: (lang: LanguageCode) => void;
  onOpenVoice?: () => void;
  onOpenPricingTable?: () => void;
  onOpenCharts?: () => void;
  onOpenCropAdvisory?: () => void;
  notifications?: NotificationItem[];
  userName?: string;
  userLocation?: string;
  onReturnToStart?: () => void;
  onExitSector?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSector,
  onChangeSector,
  onSelectSector,
  language,
  onChangeLanguage,
  onSelectLanguage,
  onOpenVoice,
  onOpenPricingTable,
  onOpenCharts,
  onOpenCropAdvisory,
  notifications = [],
  userName = 'User',
  userLocation = 'Vijayawada Region',
  onReturnToStart,
  onExitSector,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSectorMenu, setShowSectorMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(isVoiceEnabled());

  useEffect(() => {
    const handler = (e: any) => {
      setIsVoiceActive(e.detail?.enabled ?? isVoiceEnabled());
    };
    window.addEventListener('kisansetu-voice-change', handler);
    return () => window.removeEventListener('kisansetu-voice-change', handler);
  }, []);

  const handleToggleVoice = () => {
    const next = toggleVoice();
    setIsVoiceActive(next);
  };

  const handleSectorChange = (s: Sector) => {
    onChangeSector?.(s);
    onSelectSector?.(s);
  };

  const handleLangChange = (l: LanguageCode) => {
    onChangeLanguage?.(l);
    onSelectLanguage?.(l);
  };

  const handleReturn = () => {
    onReturnToStart?.();
    onExitSector?.();
  };

  const sectorLabels: Record<Sector, { label: string; icon: string; color: string }> = {
    farmer: { label: t('farmer_sector', language), icon: '👨‍🌾', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    consumer: { label: t('consumer_sector', language), icon: '🛒', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    bulk_buyer: { label: t('bulk_buyer_sector', language), icon: '🏢', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    driver: { label: t('driver_sector', language), icon: '🚚', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    admin: { label: t('admin_sector', language), icon: '⚙️', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  };

  const activeSectorInfo = sectorLabels[activeSector] || sectorLabels.farmer;
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const unreadNotifs = safeNotifs.filter(n => n && !n.read && (n.recipientRole === activeSector || n.recipientRole === 'admin'));

  const handleReadNotif = (notif: NotificationItem) => {
    speakText(notif.rawMessage, language);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              title="Return to Sector Selection / Login"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white text-xl shadow-md group-hover:scale-105 transition-transform">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-emerald-900 tracking-tight">
                    KisanSetu
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    AI Agro
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 hidden sm:block">
                  Connecting Farms, Demand &amp; Transport with AI
                </p>
              </div>
            </button>
          </div>

          {/* Center Quick Access: Pricing Table & Demand Trends */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onOpenPricingTable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              <Table className="w-4 h-4 text-emerald-700" />
              <span>{t('price_table', language)}</span>
            </button>

            {/* Hide demand-supply trends graph for the driver section */}
            {activeSector !== 'driver' && (
              <button
                onClick={onOpenCharts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
                title="View 7-day Demand vs Supply Analysis"
              >
                <BarChart2 className="w-4 h-4 text-blue-700" />
                <span>{t('demand_supply_trends', language)}</span>
              </button>
            )}

            {onOpenCropAdvisory && (
              <button
                onClick={onOpenCropAdvisory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition-colors"
                title="AI Crop Recommendation Advisory"
              >
                <span>🌱 {t('crop_advisory', language)}</span>
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Voice Toggle Button (Off by default so it does not irritate educators) */}
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
              <span className="hidden sm:inline">
                {isVoiceActive ? 'Voice: ON' : 'Voice: OFF'}
              </span>
            </button>

            {/* Voice Mode Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white hover:from-emerald-800 hover:to-teal-800 text-xs font-bold shadow-xs transition-all transform active:scale-95"
              title="Voice-first assistant in your language"
            >
              <Mic className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">🎙️ Voice Assist</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors"
                title="Change regional language"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="hidden md:inline">
                  {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'Language'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    {t('select_language', language)}
                  </div>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLangChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        language === lang.code ? 'font-bold text-emerald-800 bg-emerald-50/60' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-gray-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 p-3 z-50 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-900">Notifications</span>
                    <button onClick={() => setShowNotifMenu(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 transition-colors text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{n.title}</span>
                            <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                          </div>
                          <p className="text-gray-600 text-[11px]">{n.rawMessage}</p>
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleReadNotif(n)}
                              className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold hover:underline"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Sector Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowSectorMenu(!showSectorMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs transition-all ${activeSectorInfo.color}`}
              >
                <span>{activeSectorInfo.icon}</span>
                <span className="hidden sm:inline">{activeSectorInfo.label}</span>
                <ArrowRightLeft className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showSectorMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-gray-100 p-2 z-50 flex flex-col gap-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {t('switch_role', language)}
                  </div>
                  {(['farmer', 'consumer', 'bulk_buyer', 'driver', 'admin'] as Sector[]).map(sectorKey => {
                    const info = sectorLabels[sectorKey];
                    const isActive = activeSector === sectorKey;
                    return (
                      <button
                        key={sectorKey}
                        onClick={() => {
                          handleSectorChange(sectorKey);
                          setShowSectorMenu(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{info.icon}</span>
                        <span className="flex-1 text-left">{info.label}</span>
                        {isActive && <UserCheck className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowSectorMenu(false);
                        handleReturn();
                      }}
                      className="w-full text-center py-1.5 text-xs text-gray-500 hover:text-emerald-700 font-medium"
                    >
                      ← Start / Login Screen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
