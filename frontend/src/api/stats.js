import api from './axios.js'

export async function getPublicStats() {
  const response = await api.get('/stats')
  return response.data.data
}
