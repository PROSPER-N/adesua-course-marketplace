import axios from 'axios'

export const TOKEN_KEY = 'adesua_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// A wrong password on these two also returns 401, but that is not an expired session.
const LOGIN_PATHS = ['/auth/login', '/auth/register']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const isLoginRequest = LOGIN_PATHS.some((path) => url.endsWith(path))

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('adesua:session-expired'))
    }

    return Promise.reject(error)
  },
)

export default api
