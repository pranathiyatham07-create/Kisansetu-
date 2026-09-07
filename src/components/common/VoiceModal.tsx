import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, Sector } from '../../types';
import { parseVoiceInput, ParsedVoiceIntent, speakText, stopSpeaking } from '../../utils/speech';
import { Mic, MicOff, Volume2, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  activeSector: Sector;
  onConfirmIntent: (intent: ParsedVoiceIntent) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  language,
  activeSector,
  onConfirmIntent,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState<ParsedVoiceIntent | null>(null);
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          const parsed = parseVoiceInput(text);
          setParsedIntent(parsed);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setHasMicSupport(false);
      }
    }
  }, [language]);

  if (!isOpen) return null;

  const startListening = () => {
    setTranscript('');
    setParsedIntent(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Mic start err', err);
      }
    } else {
      setIsListening(true);
      // Simulate listening fallback
      setTimeout(() => {
        handleSamplePhrase(
          activeSector === 'farmer'
            ? 'Tomato 500 kilos hybrid variety price 40 rupees'
            : activeSector === 'driver'
            ? 'Produce collected from farmer'
            : 'Show tomatoes near me'
        );
        setIsListening(false);
      }, 1800);
    }
  };

  const stopListen = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSamplePhrase = (phrase: string) => {
    setTranscript(phrase);
    const parsed = parseVoiceInput(phrase);
    setParsedIntent(parsed);
    speakText(`Interpreted: ${parsed.summaryDescription}. Please confirm.`, language);
  };

  const handleConfirm = () => {
    if (parsedIntent) {
      onConfirmIntent(parsedIntent);
      onClose();
    }
  };

  // Sample phrases depending on sector
  const samplePrompts = {
    farmer: [
      'Tomato 500 kilos, hybrid variety, price 40 rupees',
      'I sold 100 kilos outside',
      'What orders do I have?',
      'How much tomato is available?',
    ],
    consumer: [
      'Show tomatoes near me',
      'I need 2 kilos of hybrid tomato',
      'Show basmati rice near me',
    ],
    driver: [
      'Show my transport jobs',
      'I have collected the produce',
      'Mark delivery completed',
    ],
    bulk_buyer: [
      'I need 1000 kilograms of Hybrid Tomatoes by tomorrow',
    ],
    admin: ['Show high surplus alerts'],
  }[activeSector] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-emerald-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Voice-First Assistant</h3>
              <p className="text-xs text-emerald-100">
                Speak naturally in your regional language
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center gap-5">
          {/* Big mic button */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            )}
            <button
              onClick={isListening ? stopListen : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white ring-8 ring-red-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-50'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-8 h-8" />
                  <span className="text-[10px] font-bold mt-1">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  <span className="text-[10px] font-bold mt-1">Tap &amp; Speak</span>
                </>
              )}
            </button>
          </div>

          <div className="w-full">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recognized Speech
            </div>
            <div className="min-h-[56px] w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 font-medium flex items-center justify-center italic">
              {transcript ? `“${transcript}”` : 'Press the microphone and speak your request...'}
            </div>
          </div>

          {/* AI Structured Interpretation */}
          {parsedIntent && (
            <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Structured Interpretation
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-800">
                  Ready for Confirmation
                </span>
              </div>

              <p className="text-sm font-bold text-gray-900">
                {parsedIntent.summaryDescription}
              </p>

              {parsedIntent.intentType === 'add_produce' && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-1 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                  <div>Crop: <span className="font-bold">{parsedIntent.product}</span></div>
                  <div>Variety: <span className="font-bold">{parsedIntent.variety}</span></div>
                  <div>Quantity: <span className="font-bold">{parsedIntent.quantity} kg</span></div>
                  <div>Price: <span className="font-bold text-emerald-700">₹{parsedIntent.price}/kg</span></div>
                </div>
              )}

              {parsedIntent.intentType === 'external_sale' && (
                <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                  ⚠️ Your available stock will be decremented by {parsedIntent.quantity} kg.
                </div>
              )}

              {/* Safety notice as mandated */}
              <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>KisanSetu Safety Rule: Voice commands require explicit user confirmation before execution.</span>
              </div>
            </div>
          )}

          {/* 1-Click Quick Prompts */}
          <div className="w-full text-left">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Or tap a sample regional phrase to test:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => handleSamplePhrase(phrase)}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 text-xs font-medium border border-gray-200 transition-colors text-left"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          {parsedIntent && (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Action</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
