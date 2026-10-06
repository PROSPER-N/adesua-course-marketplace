import { Check, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../hooks/useCart.js'
import { addCartItem, removeCartItem } from '../../utils/cart.js'
import Button from '../ui/Button.jsx'

function AddToCartButton({ course }) {
  const { items } = useCart()
  const inCart = items.some((item) => item._id === course._id)

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
    <Button
      className="mt-2"
      fullWidth
      onClick={toggleCart}
      variant="outline"
    >
      {inCart ? (
        <>
          <Check aria-hidden="true" className="size-4" />
          Remove from cart
        </>
      ) : (
        <>
          <ShoppingCart aria-hidden="true" className="size-4" />
          Add to cart
        </>
      )}
    </Button>
  )
}

export default AddToCartButton
