import api from './axios.js'

export async function enrollFree(courseId) {
  const response = await api.post('/enrollments', { courseId })
  return response.data.data
}

export async function getMyEnrollments() {
  const response = await api.get('/enrollments/my')
  return response.data.data
}

export async function completeLesson(courseId, lessonId) {
  const response = await api.patch(`/enrollments/${courseId}/lessons/${lessonId}/complete`)
  return response.data.data
}
