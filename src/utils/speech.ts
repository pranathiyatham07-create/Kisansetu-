import { LanguageCode } from '../types';

export function getLangBCP47(lang: LanguageCode): string {
  switch (lang) {
    case 'te': return 'te-IN';
    case 'hi': return 'hi-IN';
    case 'ta': return 'ta-IN';
    case 'kn': return 'kn-IN';
    case 'ml': return 'ml-IN';
    case 'mr': return 'mr-IN';
    case 'bn': return 'bn-IN';
    case 'gu': return 'gu-IN';
    case 'pa': return 'pa-IN';
    case 'or': return 'or-IN';
    case 'ur': return 'ur-IN';
    default: return 'en-IN';
  }
}

// Voice is OFF by default to avoid irritating users, educators, and reviewers.
// Only speaks when explicitly turned ON by the user or when directly clicking audio buttons.
let voiceEnabled = false;

// Initialize from localStorage if explicitly set by user, otherwise defaults to false (OFF)
export function isVoiceEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('kisansetu_voice_enabled');
    if (stored !== null) {
      return stored === 'true';
    }
  }
  return voiceEnabled;
}

export function setVoiceEnabled(enabled: boolean): void {
  voiceEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('kisansetu_voice_enabled', String(enabled));
    window.dispatchEvent(new CustomEvent('kisansetu-voice-change', { detail: { enabled } }));
  }
  if (!enabled) {
    stopSpeaking();
  }
}

export function toggleVoice(): boolean {
  const next = !isVoiceEnabled();
  setVoiceEnabled(next);
  return next;
}

export function speakText(text: string, lang: LanguageCode = 'en', force: boolean = false): void {
  // Respect user preference: do not speak if voice is OFF unless explicitly forced (e.g. clicking audio preview)
  if (!force && !isVoiceEnabled()) {
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // cancel any active utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getLangBCP47(lang);
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;

  // Try to find a voice matching the language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export interface ParsedVoiceIntent {
  raw: string;
  intentType:
    | 'add_produce'
    | 'external_sale'
    | 'check_orders'
    | 'check_stock'
    | 'search_product'
    | 'set_quantity'
    | 'driver_action'
    | 'bulk_order'
    | 'general';
  product?: string;
  variety?: string;
  quantity?: number;
  price?: number;
  driverAction?: 'accept' | 'collected' | 'delivered';
  summaryDescription: string;
}

export function parseVoiceInput(transcript: string): ParsedVoiceIntent {
  const lower = transcript.toLowerCase();

  // Pattern 1: External sale e.g. "I sold 100 kilos outside" / "sold 150 kg"
  const soldMatch = lower.match(/(?:sold|sell|baahar becha|ammamu|bayata ammesanu)\s+(\d+)\s*(?:kilos?|kg|kilo|quintals?)?/i);
  if (soldMatch) {
    const qty = parseInt(soldMatch[1], 10);
    return {
      raw: transcript,
      intentType: 'external_sale',
      quantity: qty,
      summaryDescription: `Update external sale of ${qty} kg outside the platform`,
    };
  }

  // Pattern 2: Check orders e.g. "What orders do I have?" / "orders"
  if (lower.includes('order') && (lower.includes('what') || lower.includes('show') || lower.includes('ennunayi') || lower.includes('kitne'))) {
    return {
      raw: transcript,
      intentType: 'check_orders',
      summaryDescription: 'Check current pending orders and notifications',
    };
  }

  // Pattern 3: Check stock e.g. "How much tomato is available?" / "available stock"
  if (lower.includes('available') || lower.includes('stock') || lower.includes('entha undi') || lower.includes('kitna bacha')) {
    let prod = 'produce';
    if (lower.includes('tomato')) prod = 'Tomato';
    if (lower.includes('rice')) prod = 'Rice';
    if (lower.includes('wheat')) prod = 'Wheat';
    if (lower.includes('onion')) prod = 'Onion';
    return {
      raw: transcript,
      intentType: 'check_stock',
      product: prod,
      summaryDescription: `Check available stock for ${prod}`,
    };
  }

  // Pattern 4: Driver actions
  if (lower.includes('collected') || lower.includes('produce collected') || lower.includes('load chesanu')) {
    return {
      raw: transcript,
      intentType: 'driver_action',
      driverAction: 'collected',
      summaryDescription: 'Update transport job: Mark produce collected from farmer',
    };
  }
  if (lower.includes('deliver') || lower.includes('completed') || lower.includes('delivered')) {
    return {
      raw: transcript,
      intentType: 'driver_action',
      driverAction: 'delivered',
      summaryDescription: 'Update transport job: Mark delivery successfully completed',
    };
  }
  if (lower.includes('accept') && lower.includes('job')) {
    return {
      raw: transcript,
      intentType: 'driver_action',
      driverAction: 'accept',
      summaryDescription: 'Accept available transportation job',
    };
  }

  // Pattern 5: Consumer search / quantity
  if (lower.includes('near me') || lower.includes('show') || lower.includes('chupinchu')) {
    let prod = 'Tomato';
    if (lower.includes('rice')) prod = 'Rice';
    if (lower.includes('wheat')) prod = 'Wheat';
    if (lower.includes('mango')) prod = 'Mango';
    if (lower.includes('onion')) prod = 'Onion';
    return {
      raw: transcript,
      intentType: 'search_product',
      product: prod,
      summaryDescription: `Search nearby listings for ${prod}`,
    };
  }

  // Pattern 6: Add produce e.g. "Tomato 500 kilos, hybrid variety, price 40 rupees" or "I have 300 kilos of Basmati rice. My price is 60 rupees per kilo."
  let prodName = 'Tomato';
  if (lower.includes('rice')) prodName = 'Rice';
  else if (lower.includes('wheat')) prodName = 'Wheat';
  else if (lower.includes('mango')) prodName = 'Mango';
  else if (lower.includes('onion')) prodName = 'Onion';
  else if (lower.includes('potato')) prodName = 'Potato';
  else if (lower.includes('chilli')) prodName = 'Green Chilli';
  else if (lower.includes('jowar')) prodName = 'Jowar';

  let variety = 'Hybrid';
  if (lower.includes('basmati')) variety = 'Basmati';
  else if (lower.includes('sona')) variety = 'Sona Masuri';
  else if (lower.includes('sharbati')) variety = 'Sharbati';
  else if (lower.includes('desi')) variety = 'Desi';
  else if (lower.includes('cherry')) variety = 'Cherry';
  else if (lower.includes('banganapalli')) variety = 'Banganapalli';
  else if (lower.includes('alphonso')) variety = 'Alphonso';

  const numMatches = transcript.match(/\d+(\.\d+)?/g);
  let qty = 200;
  let price = 40;

  if (numMatches && numMatches.length >= 2) {
    qty = parseFloat(numMatches[0]);
    price = parseFloat(numMatches[1]);
  } else if (numMatches && numMatches.length === 1) {
    const val = parseFloat(numMatches[0]);
    if (val > 80) qty = val;
    else price = val;
  }

  return {
    raw: transcript,
    intentType: 'add_produce',
    product: prodName,
    variety: variety,
    quantity: qty,
    price: price,
    summaryDescription: `Add ${qty} kg of ${variety} ${prodName} at ₹${price}/kg`,
  };
}
