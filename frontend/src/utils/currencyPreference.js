import { BASE_CURRENCY, isSupportedCurrency } from '../config/currency.js'

export const CURRENCY_PREFERENCE_KEY = 'adesua:display-currency'

const TIMEZONE_CURRENCY_MAP = {
  'Africa/Lagos': 'NGN',
  'Africa/Accra': 'GHS',
  'Europe/London': 'GBP',
  'Asia/Kolkata': 'INR',
  'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Luxembourg': 'EUR',
  'Europe/Prague': 'EUR',
  'Europe/Warsaw': 'EUR',
  'Europe/Budapest': 'EUR',
  'Europe/Malta': 'EUR',
  'Europe/Stockholm': 'EUR',
  'Europe/Athens': 'EUR',
  'Europe/Oslo': 'EUR',
  'Europe/Dublin': 'EUR',
  'Europe/Zurich': 'EUR',
  'Europe/Bucharest': 'EUR',
  'Europe/Helsinki': 'EUR',
  'Europe/Lisbon': 'EUR',
  'Europe/Copenhagen': 'EUR',
  'Europe/Belgrade': 'EUR',
  'Europe/Sofia': 'EUR',
  'Europe/Ljubljana': 'EUR',
  'Europe/Zagreb': 'EUR',
  'Europe/Andorra': 'EUR',
  'Europe/Monaco': 'EUR',
  'Europe/San_Marino': 'EUR',
  'Europe/Vatican': 'EUR',
  'Europe/Tallinn': 'EUR',
  'Europe/Riga': 'EUR',
  'Europe/Vilnius': 'EUR',
  'Europe/Bratislava': 'EUR',
}

const REGION_CURRENCY_MAP = {
  NG: 'NGN',
  GH: 'GHS',
  GB: 'GBP',
  IN: 'INR',
  ZA: 'ZAR',
  US: 'USD',
  IE: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  AT: 'EUR',
  LU: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  EE: 'EUR',
}

function getBrowserStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function detectCurrencyFromTimeZone(timeZone, languages = []) {
  const zone = typeof timeZone === 'string' ? timeZone : ''
  const zoneCurrency = TIMEZONE_CURRENCY_MAP[zone]
  if (zoneCurrency && isSupportedCurrency(zoneCurrency)) return zoneCurrency

  for (const locale of languages) {
    const region = typeof locale === 'string' ? locale.split('-')[1] : null
    const currency = region ? REGION_CURRENCY_MAP[region.toUpperCase()] : null
    if (currency && isSupportedCurrency(currency)) return currency
  }

  return BASE_CURRENCY
}

function detectNavigatorCurrency() {
  if (typeof window === 'undefined') return BASE_CURRENCY

  const languages =
    globalThis.navigator.languages ?? [globalThis.navigator.language].filter(Boolean)
  const timeZone = globalThis.Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone

  if (!languages.length && !timeZone) return BASE_CURRENCY
  return detectCurrencyFromTimeZone(timeZone, languages)
}

export function readCurrencyPreference(storage = getBrowserStorage()) {
  try {
    const saved = storage?.getItem(CURRENCY_PREFERENCE_KEY)
    if (isSupportedCurrency(saved)) return saved
  } catch {
    return detectNavigatorCurrency()
  }

  return detectNavigatorCurrency()
}

export function writeCurrencyPreference(currency, storage = getBrowserStorage()) {
  if (!isSupportedCurrency(currency)) return false
  try {
    storage?.setItem(CURRENCY_PREFERENCE_KEY, currency)
    return Boolean(storage)
  } catch {
    return false
  }
}
