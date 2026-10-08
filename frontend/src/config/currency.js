export const BASE_CURRENCY = 'USD'

export const CURRENCIES = {
NGN: {
code: 'NGN',
name: 'Nigerian Naira',
symbol: '₦',
locale: 'en-NG',
fractionDigits: 2,
},
USD: {
code: 'USD',
name: 'US Dollar',
symbol: '$',
locale: 'en-US',
fractionDigits: 2,
},
GBP: {
code: 'GBP',
name: 'British Pound',
symbol: '£',
locale: 'en-GB',
fractionDigits: 2,
},
EUR: {
code: 'EUR',
name: 'Euro',
symbol: '€',
locale: 'en-IE',
fractionDigits: 2,
},
GHS: {
code: 'GHS',
name: 'Ghanaian Cedi',
symbol: 'GH₵',
locale: 'en-GH',
fractionDigits: 2,
},
ZAR: {
code: 'ZAR',
name: 'South African Rand',
symbol: 'R',
locale: 'en-ZA',
fractionDigits: 2,
},
INR: {
code: 'INR',
name: 'Indian Rupee',
symbol: '₹',
locale: 'en-IN',
fractionDigits: 2,
},
}

// Fixed display-only units per USD, based on reference rates observed 7 October 2026.
// These are not payment rates and are intentionally isolated here for product review/adjustment.
// NGN, GBP, EUR and ZAR use the existing CBN NGN mid-rates; GHS uses Bank of Ghana's
// September USD/GHS close. INR per USD is the ECB EUR/INR reference divided by EUR/USD.
export const DISPLAY_UNITS_PER_USD = {
USD: 1,
NGN: 1331.2679,
GBP: 1331.2679 / 1757.2736,
EUR: 1331.2679 / 1488.4906,
GHS: 11.55,
ZAR: 1331.2679 / 79.6461,
INR: (108.1165 / 1488.4906) * 1331.2679,
}

// The date of the rates above. The site shows it next to converted prices, so change both together.
export const RATES_DATE = '7 October 2026'

export const SUPPORTED_CURRENCIES = Object.values(CURRENCIES)

export function isSupportedCurrency(code) {
return Object.prototype.hasOwnProperty.call(CURRENCIES, code)
}
