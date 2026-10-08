import {
  BASE_CURRENCY,
  CURRENCIES,
  DISPLAY_UNITS_PER_USD,
  isSupportedCurrency,
} from '../config/currency.js'

export function convertFromBase(amount, targetCurrency, baseCurrency = BASE_CURRENCY) {
  const value = Number(amount)
  if (!Number.isFinite(value) || !isSupportedCurrency(targetCurrency)) return Number.NaN
  if (!isSupportedCurrency(baseCurrency)) return Number.NaN

  const raw = (value / DISPLAY_UNITS_PER_USD[baseCurrency]) * DISPLAY_UNITS_PER_USD[targetCurrency]
  const scale = 10 ** CURRENCIES[targetCurrency].fractionDigits
  return Math.round((raw + Number.EPSILON) * scale) / scale
}
