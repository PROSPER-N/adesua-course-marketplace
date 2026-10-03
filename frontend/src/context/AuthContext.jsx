import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import * as authApi from '../api/auth.js'
import { TOKEN_KEY } from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only wait for getMe when there is a saved token to check.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  // On start: if a token is saved, ask the server who it belongs to.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return undefined

    let ignore = false
    authApi
      .getMe()
      .then((data) => {
        if (!ignore) setUser(data.user)
      })
      .catch((error) => {
        // The server answered but refused the token (expired, or the account was deactivated).
        // With no answer at all (offline) the token stays, so a refresh can try again.
        if (error.response) localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // axios.js sends this event when any request comes back 401.
  useEffect(() => {
    function handleSessionExpired() {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      // The id stops two requests that fail together from showing the toast twice.
      toast.error('Your session has expired. Please log in again.', { id: 'session-expired' })
    }

    window.addEventListener('adesua:session-expired', handleSessionExpired)
    return () => window.removeEventListener('adesua:session-expired', handleSessionExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- The auth hook lives beside its provider.
export function useAuth() {
  return useContext(AuthContext)
}
