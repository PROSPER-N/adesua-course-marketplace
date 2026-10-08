import { BASE_CURRENCY, RATES_DATE } from '../../config/currency.js'
import { useCurrency } from '../../context/CurrencyContext.jsx'

// Converted prices use fixed rates, so they're estimates, and checkout always charges in
// US dollars. Prices already shown in US dollars need no note.
function CurrencyNote({ className = '' }) {
  const { currency } = useCurrency()
  if (currency === BASE_CURRENCY) return null

  return (
    <p className={`text-muted ${className}`}>
      Prices in other currencies are estimates, using fixed rates from {RATES_DATE}. You'll pay in
      US dollars.
    </p>
  )
}

export default CurrencyNote
