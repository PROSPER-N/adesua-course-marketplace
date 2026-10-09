import { useId } from 'react'
import { useCurrency } from '../../context/CurrencyContext.jsx'

function CurrencySelector({ compact = false, mobile = false }) {
  const id = useId()
  const { currency, currencyInfo, currencies, setCurrency } = useCurrency()
  const label = `Display currency: ${currencyInfo.name}`

  return (
    <div className={mobile ? 'grid w-full gap-1.5' : compact ? 'relative shrink-0' : 'shrink-0'}>
      <label className={mobile ? 'text-sm font-semibold text-ink' : 'sr-only'} htmlFor={id}>
        Display currency
      </label>
      <select
        aria-label={label}
        className={`rounded-lg border border-field bg-card text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${compact ? 'size-9 appearance-none rounded-full p-0 text-transparent' : mobile ? 'w-full px-3 py-2.5' : 'max-w-24 px-2 py-2'}`}
        id={id}
        onChange={(event) => setCurrency(event.target.value)}
        value={currency}
      >
        {currencies.map(({ code, name, symbol }) => (
          <option
            aria-label={`${symbol}, ${code}, ${name}`}
            className="text-ink"
            key={code}
            value={code}
          >
            {compact ? `${symbol} ${code}, ${name}` : `${symbol} ${code}`}
          </option>
        ))}
      </select>
      {compact && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink"
        >
          {currencyInfo.symbol}
        </span>
      )}
    </div>
  )
}

export default CurrencySelector
