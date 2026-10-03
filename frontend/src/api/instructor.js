import api from './axios.js'

export async function getMyCourses() {
  const response = await api.get('/instructor/courses')
  return response.data.data
}

export async function getMyCourse(id) {
  const response = await api.get(`/instructor/courses/${id}`)
  return response.data.data
}

export async function getInstructorStats() {
  const response = await api.get('/instructor/stats')
  return response.data.data
}
