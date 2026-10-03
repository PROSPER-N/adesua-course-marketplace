import api from './axios.js'

export async function createOrder({ courseId, paymentMethod }) {
  const response = await api.post('/orders', { courseId, paymentMethod })
  return response.data.data
}

export async function payOrder(id) {
  const response = await api.post(`/orders/${id}/pay`)
  return response.data.data
}

export async function getMyOrders() {
  const response = await api.get('/orders/my')
  return response.data.data
}
