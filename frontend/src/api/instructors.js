import api from './axios.js'

// Active instructors with published courses, most reviewed first. params can hold limit.
export async function getInstructors(params) {
  const response = await api.get('/instructors', { params })
  return response.data.data
}
