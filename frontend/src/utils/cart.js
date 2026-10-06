const CART_KEY = 'adesua_cart'
const CART_EVENT = 'adesua:cart-updated'

function isCartItem(item) {
  return (
    item &&
    typeof item._id === 'string' &&
    typeof item.title === 'string' &&
    Number.isFinite(item.price) &&
    item.price >= 0
  )
}

export function getCartItems() {
  const saved = localStorage.getItem(CART_KEY)
  if (!saved) return []

  let items
  try {
    items = JSON.parse(saved)
  } catch (error) {
    console.error('Could not read the saved cart.', error)
    return []
  }

  if (!Array.isArray(items)) {
    console.error('The saved cart has an invalid format.')
    return []
  }

  return items.filter(isCartItem)
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CART_EVENT))
}

export function addCartItem(course) {
  const item = {
    _id: course._id,
    title: course.title,
    price: course.price,
    thumbnailUrl: course.thumbnailUrl ?? '',
    category: course.category ?? null,
    instructor: course.instructor ?? null,
    lessonCount: course.lessonCount ?? course.lessons?.length ?? 0,
    firstLessonId: course.lessons?.[0]?._id ?? '',
  }
  if (!isCartItem(item)) throw new Error('This course cannot be added to the cart.')

  const items = getCartItems()
  if (items.some((saved) => saved._id === item._id)) return false

  saveCart([...items, item])
  return true
}

export function removeCartItem(courseId) {
  const items = getCartItems()
  const next = items.filter((item) => item._id !== courseId)
  if (next.length !== items.length) saveCart(next)
}

export function subscribeToCart(callback) {
  window.addEventListener(CART_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CART_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
