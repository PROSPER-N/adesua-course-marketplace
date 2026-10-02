// STUB, Member C implements. user is null or { _id, name, email, role }.
export function AuthProvider({ children }) {
  return children
}

// oxlint-disable-next-line react/only-export-components -- This stub exports the required auth hook beside its provider.
export function useAuth() {
  return {
    user: null,
    loading: false,
    login() {
      throw new Error('Not built yet')
    },
    register() {
      throw new Error('Not built yet')
    },
    logout() {},
  }
}
