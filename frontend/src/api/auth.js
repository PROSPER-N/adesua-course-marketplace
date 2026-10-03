import api from './axios.js'

export async function register(data) {
  const response = await api.post('/auth/register', data)
  return response.data.data
}

export async function login(data) {
  const response = await api.post('/auth/login', data)
  return response.data.data
}

export async function getMe() {
  const response = await api.get('/auth/me')
  return response.data.data
}
