import api from './axios.js'

export async function getAdminStats() {
  const response = await api.get('/admin/stats')
  return response.data.data
}

// params can hold search, role, page and limit.
export async function getUsers(params) {
  const response = await api.get('/admin/users', { params })
  return response.data.data
}

export async function updateUserStatus(id, isActive) {
  const response = await api.patch(`/admin/users/${id}/status`, { isActive })
  return response.data.data
}

// params can hold search, status, page and limit.
export async function getAdminCourses(params) {
  const response = await api.get('/admin/courses', { params })
  return response.data.data
}
