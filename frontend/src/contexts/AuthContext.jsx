import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch(`/api/user`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (email, username, password) => {
    try {
      const response = await fetch(`/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user: { email, username, password } })
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch(`/api/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    checkUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
