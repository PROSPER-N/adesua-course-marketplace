// 0 -> "Free", 180 -> "$180", and with { decimals: true } -> "$180.00".
export function formatMoney(amount, { decimals = false } = {}) {
  const value = Number(amount)

  if (value === 0) return 'Free'
  if (!Number.isFinite(value)) return ''

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return `$${formatted}`
}
