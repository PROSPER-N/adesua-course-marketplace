import api from './axios.js'

export async function createLesson(courseId, data) {
  const response = await api.post(`/courses/${courseId}/lessons`, data)
  return response.data.data
}

export async function updateLesson(id, data) {
  const response = await api.patch(`/lessons/${id}`, data)
  return response.data.data
}

export async function deleteLesson(id) {
  const response = await api.delete(`/lessons/${id}`)
  return response.data.data
}
