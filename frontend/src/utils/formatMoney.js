import { BASE_CURRENCY, CURRENCIES, isSupportedCurrency } from '../config/currency.js'

// Course prices default to "Free" at zero. Totals can opt out with freeForZero: false.
export function formatMoney(
  amount,
  { currency = BASE_CURRENCY, decimals = false, freeForZero = true } = {},
) {
  const value = Number(amount)

  if (!Number.isFinite(value)) return ''
  if (!isSupportedCurrency(currency)) currency = BASE_CURRENCY
  if (value === 0 && freeForZero) return 'Free'

  const { locale, fractionDigits } = CURRENCIES[currency]
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    // An amount with cents shows both digits, so ₦252,940.90 never appears as ₦252,940.9.
    minimumFractionDigits: decimals || !Number.isInteger(value) ? fractionDigits : 0,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
