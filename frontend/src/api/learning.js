import api from './axios.js'

export async function getCourseLessons(courseId) {
  const response = await api.get(`/courses/${courseId}/lessons`)
  return response.data.data
}
