import {
  BASE_CURRENCY,
  CURRENCIES,
  DISPLAY_UNITS_PER_USD,
  isSupportedCurrency,
} from '../config/currency.js'

export function convertFromBase(amount, targetCurrency, baseCurrency = BASE_CURRENCY) {
  const value = Number(amount)

  if (!Number.isFinite(value) || !isSupportedCurrency(targetCurrency)) {
    return Number.NaN
  }

  if (!isSupportedCurrency(baseCurrency)) {
    return Number.NaN
  }

  const raw =
    (value / DISPLAY_UNITS_PER_USD[baseCurrency]) *
    DISPLAY_UNITS_PER_USD[targetCurrency]

  const scale = 10 ** CURRENCIES[targetCurrency].fractionDigits

  return Math.round((raw + Number.EPSILON) * scale) / scale
}

// A total in another currency is the sum of the converted prices, so a cart's lines always add
// up to its total. Converting the US dollar total instead can be a cent out.
export function convertTotal(amounts, targetCurrency) {
  if (!isSupportedCurrency(targetCurrency)) {
    return Number.NaN
  }

  const scale = 10 ** CURRENCIES[targetCurrency].fractionDigits
  const total = amounts.reduce(
    (sum, amount) => sum + convertFromBase(amount, targetCurrency),
    0,
  )

  return Math.round(total * scale) / scale
}