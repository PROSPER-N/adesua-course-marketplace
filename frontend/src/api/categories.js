import api from './axios.js'

export async function getCategories() {
  const response = await api.get('/categories')
  return response.data.data
}

export async function createCategory(data) {
  const response = await api.post('/categories', data)
  return response.data.data
}

export async function updateCategory(id, data) {
  const response = await api.patch(`/categories/${id}`, data)
  return response.data.data
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`)
  return response.data.data
}
