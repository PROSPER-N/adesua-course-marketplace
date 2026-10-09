import { Check, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../hooks/useCart.js'
import { addCartItem, removeCartItem } from '../../utils/cart.js'
import Button from '../ui/Button.jsx'

// Below 1024px the course page's bar only has room for a square icon button; from 1024px the
// full button shows. Only one of the two is ever displayed, so screen readers meet one.
function AddToCartButton({ course }) {
  const { items } = useCart()
  const inCart = items.some((item) => item._id === course._id)
  const label = inCart ? 'Remove from cart' : 'Add to cart'
  const Icon = inCart ? Check : ShoppingCart

  function toggleCart() {
    if (inCart) {
      removeCartItem(course._id)
      toast.success('Removed from cart')
      return
    }

    const added = addCartItem(course)
    toast.success(added ? 'Added to cart' : 'This course is already in your cart')
  }

  return (
    <>
      <button
        aria-label={label}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
        onClick={toggleCart}
        type="button"
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
      <Button className="max-lg:hidden" fullWidth onClick={toggleCart} variant="outline">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </Button>
    </>
  )
}

export default AddToCartButton
