import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  BASE_CURRENCY,
  CURRENCIES,
  SUPPORTED_CURRENCIES,
  isSupportedCurrency,
} from '../config/currency.js'
import { readCurrencyPreference, writeCurrencyPreference } from '../utils/currencyPreference.js'
import { convertFromBase } from '../utils/currencyPricing.js'
import { formatMoney } from '../utils/formatMoney.js'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(readCurrencyPreference)

  const setCurrency = useCallback((nextCurrency) => {
    if (!isSupportedCurrency(nextCurrency)) return false
    writeCurrencyPreference(nextCurrency)
    setCurrencyState(nextCurrency)
    return true
  }, [])

  const convertAmount = useCallback((amount) => convertFromBase(amount, currency), [currency])
  const formatPrice = useCallback(
    (amount) => formatMoney(convertFromBase(amount, currency), { currency }),
    [currency],
  )
  const formatAmount = useCallback(
    (amount) => formatMoney(convertFromBase(amount, currency), { currency, freeForZero: false }),
    [currency],
  )
  const formatBaseAmount = useCallback(
    (amount) =>
      formatMoney(amount, {
        currency: BASE_CURRENCY,
        freeForZero: false,
      }),
    [],
  )

  const value = useMemo(
    () => ({
      currency,
      currencyInfo: CURRENCIES[currency],
      currencies: SUPPORTED_CURRENCIES,
      baseCurrency: BASE_CURRENCY,
      baseCurrencyInfo: CURRENCIES[BASE_CURRENCY],
      convertAmount,
      formatPrice,
      formatAmount,
      formatBaseAmount,
      setCurrency,
    }),
    [currency, convertAmount, formatPrice, formatAmount, formatBaseAmount, setCurrency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- The currency hook lives beside its provider.
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}
