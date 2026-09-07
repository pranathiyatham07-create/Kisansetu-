import React from 'react';
import { LanguageCode } from '../../types';
import { t } from '../../data/translations';
import { CROP_RECOMMENDATIONS } from '../../data/mockData';
import {
  Sprout,
  AlertCircle,
  TrendingUp,
  Droplets,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

interface CropAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const CropAdvisoryModal: React.FC<CropAdvisoryModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-emerald-100">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t('crop_recommendation', language)}</h3>
              <p className="text-xs text-emerald-100">
                Region-based demand forecasting for upcoming sowing seasons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Mandatory Disclaimer as requested */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important Advisory Disclaimer: </span>
              {t('crop_rec_disclaimer', language)}
            </div>
          </div>

          <div className="space-y-4">
            {CROP_RECOMMENDATIONS.map((crop, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-emerald-300 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-gray-900 text-base">{crop.crop}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {crop.projectedDemand}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 block">{crop.region}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Estimated Realization</span>
                    <span className="text-base font-extrabold text-emerald-800">
                      ₹{crop.estimatedPriceRange.min} - ₹{crop.estimatedPriceRange.max} <span className="text-xs font-medium text-gray-500">/ kg</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                  {crop.rationale}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Season: <strong>{crop.suggestedSeason}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Water: <strong>{crop.waterRequirement}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>Trend: <strong>Demand Rising</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Close Advisory
          </button>
        </div>
      </div>
    </div>
  );
};
