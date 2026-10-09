import { BASE_CURRENCY, isSupportedCurrency } from '../config/currency.js'

export const CURRENCY_PREFERENCE_KEY = 'adesua:display-currency'

function getBrowserStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readCurrencyPreference(storage = getBrowserStorage()) {
  try {
    const saved = storage?.getItem(CURRENCY_PREFERENCE_KEY)
    return isSupportedCurrency(saved) ? saved : BASE_CURRENCY
  } catch {
    return BASE_CURRENCY
  }
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
