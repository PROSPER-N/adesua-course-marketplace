import { useCallback, useEffect, useState } from 'react'
import { getCartItems, subscribeToCart } from '../utils/cart.js'

export function useCart() {
  const [items, setItems] = useState(getCartItems)

  useEffect(() => subscribeToCart(() => setItems(getCartItems())), [])

  const refresh = useCallback(() => setItems(getCartItems()), [])
  return { items, refresh }
}
