import api from './axios.js'

// params can hold search, category, level, price, sort, page and limit.
export async function getCourses(params) {
  const response = await api.get('/courses', { params })
  return response.data.data
}

export async function getCourse(id) {
  const response = await api.get(`/courses/${id}`)
  return response.data.data
}

export async function createCourse(data) {
  const response = await api.post('/courses', data)
  return response.data.data
}

export async function updateCourse(id, data) {
  const response = await api.patch(`/courses/${id}`, data)
  return response.data.data
}

export async function updateCourseStatus(id, status) {
  const response = await api.patch(`/courses/${id}/status`, { status })
  return response.data.data
}

export async function deleteCourse(id) {
  const response = await api.delete(`/courses/${id}`)
  return response.data.data
}
