import { useId } from 'react'
import { useCurrency } from '../../context/CurrencyContext.jsx'

function CurrencySelector({ mobile = false }) {
  const id = useId()
  const { currency, currencies, setCurrency } = useCurrency()

  return (
    <div className={mobile ? 'grid w-full gap-1.5' : 'shrink-0'}>
      <label className={mobile ? 'text-sm font-semibold text-ink' : 'sr-only'} htmlFor={id}>
        Display currency
      </label>
      <select
        aria-label="Display currency"
        className={`rounded-lg border border-field bg-card text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${mobile ? 'w-full px-3 py-2.5' : 'max-w-24 px-2 py-2'}`}
        id={id}
        onChange={(event) => setCurrency(event.target.value)}
        value={currency}
      >
        {currencies.map(({ code, name, symbol }) => (
          <option aria-label={`${code}, ${name}`} key={code} value={code}>
            {symbol} {code}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CurrencySelector
