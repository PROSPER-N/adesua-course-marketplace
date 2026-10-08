import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BASE_CURRENCY,
  CURRENCIES,
  SUPPORTED_CURRENCIES,
  isSupportedCurrency,
} from '../src/config/currency.js'
import { convertFromBase } from '../src/utils/currencyPricing.js'
import { formatMoney } from '../src/utils/formatMoney.js'
import {
  CURRENCY_PREFERENCE_KEY,
  readCurrencyPreference,
  writeCurrencyPreference,
} from '../src/utils/currencyPreference.js'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return data.get(key) ?? null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
  }
}

test('exposes exactly the supported V1 currencies', () => {
  assert.deepEqual(
    SUPPORTED_CURRENCIES.map(({ code }) => code),
    ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'ZAR', 'INR'],
  )
  assert.equal(isSupportedCurrency('USD'), true)
  assert.equal(isSupportedCurrency('CAD'), false)
})

test('defaults to the configured base currency when no preference exists', () => {
  assert.equal(BASE_CURRENCY, 'USD')
  assert.equal(readCurrencyPreference(memoryStorage()), BASE_CURRENCY)
})

test('uses a saved manual currency and safely falls back for invalid values', () => {
  const storage = memoryStorage({ [CURRENCY_PREFERENCE_KEY]: 'USD' })
  assert.equal(readCurrencyPreference(storage), 'USD')
  storage.setItem(CURRENCY_PREFERENCE_KEY, 'not-a-currency')
  assert.equal(readCurrencyPreference(storage), BASE_CURRENCY)
})

test('persists only supported manual currencies', () => {
  const storage = memoryStorage()
  assert.equal(writeCurrencyPreference('GBP', storage), true)
  assert.equal(readCurrencyPreference(storage), 'GBP')
  assert.equal(writeCurrencyPreference('BTC', storage), false)
  assert.equal(readCurrencyPreference(storage), 'GBP')
})

test('formats free course prices and monetary zero differently', () => {
  assert.equal(formatMoney(0, { currency: 'NGN' }), 'Free')
  assert.equal(
    formatMoney(0, { currency: 'NGN', freeForZero: false }),
    new Intl.NumberFormat(CURRENCIES.NGN.locale, {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: CURRENCIES.NGN.fractionDigits,
    }).format(0),
  )
  assert.equal(formatMoney(Number.NaN, { currency: 'USD' }), '')
})

test('uses the selected currency locale and fraction digits', () => {
  const expected = new Intl.NumberFormat(CURRENCIES.INR.locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: CURRENCIES.INR.fractionDigits,
  }).format(1234.5)
  assert.equal(formatMoney(1234.5, { currency: 'INR' }), expected)
})

test('preserves the legacy USD formatting for an unqualified course price', () => {
  assert.equal(formatMoney(120), '$120')
})

test('converts from base without mutating its raw amount and preserves ordering', () => {
  const rawPrice = 1200
  const converted = convertFromBase(rawPrice, 'USD')
  assert.equal(rawPrice, 1200)
  assert.ok(converted > 0)
  assert.ok(convertFromBase(1000, 'GBP') <= convertFromBase(2000, 'GBP'))
  assert.equal(convertFromBase(1200, BASE_CURRENCY), 1200)
})
