// The payment methods the API accepts, in the order checkout shows them.
export const PAYMENT_METHODS = [
  { value: 'momo', label: 'Mobile money' },
  { value: 'card', label: 'Card' },
]

// 'momo' -> 'Mobile money'
export function paymentMethodLabel(value) {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label ?? value
}
