import api from './axios.js'

// Reads return the data, like the other api files. Writes return the whole body
// ({ message, data }), so a page can show the server's own message in a toast.

// params can hold page and limit.
export async function getCourseReviews(courseId, params) {
  const response = await api.get(`/courses/${courseId}/reviews`, { params })
  return response.data.data
}

// My review of the course, or null.
export async function getMyCourseReview(courseId) {
  const response = await api.get(`/courses/${courseId}/reviews/mine`)
  return response.data.data
}

// data is { courseRating, instructorRating, comment }.
export async function saveMyCourseReview(courseId, data) {
  const response = await api.put(`/courses/${courseId}/reviews/mine`, data)
  return response.data
}

export async function deleteMyCourseReview(courseId) {
  const response = await api.delete(`/courses/${courseId}/reviews/mine`)
  return response.data
}

// params can hold page and limit.
export async function getSiteReviews(params) {
  const response = await api.get('/reviews', { params })
  return response.data.data
}

// My review of Adesua, or null.
export async function getMySiteReview() {
  const response = await api.get('/reviews/mine')
  return response.data.data
}

// data is { rating, comment }.
export async function saveMySiteReview(data) {
  const response = await api.put('/reviews/mine', data)
  return response.data
}

export async function deleteMySiteReview() {
  const response = await api.delete('/reviews/mine')
  return response.data
}

// params can hold type (course or site), page and limit.
export async function getAdminReviews(params) {
  const response = await api.get('/admin/reviews', { params })
  return response.data.data
}

// type is course or site.
export async function updateReviewVisibility(type, id, isHidden) {
  const response = await api.patch(`/admin/reviews/${type}/${id}/visibility`, { isHidden })
  return response.data
}
