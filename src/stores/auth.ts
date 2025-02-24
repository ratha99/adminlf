import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', () => {
  // Explicitly define types for these refs
  const user = ref<any>(null) // You can replace `any` with a more specific type if you know the structure of the user object
  const token = ref<string | null>(null)  // Token can either be a string or null
  const refreshToken = ref<string | null>(null)  // RefreshToken can either be a string or null
  const isAuthenticated = ref<boolean>(false)

  // Define types for email and password parameters
  async function login(email: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password })
      const { token: authToken, refreshToken: authRefreshToken, user: userData, admin } = response.data
      if (admin !== 'admin') {
        return false
      }
      user.value = userData
      token.value = authToken
      refreshToken.value = authRefreshToken
      isAuthenticated.value = true

      // Store tokens in localStorage for persistence
      localStorage.setItem('token', authToken)
      localStorage.setItem('refreshToken', authRefreshToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return true
    } catch (error: unknown) {
      // Narrow the type of error to handle it safely
      if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data || error.message)
      } else {
        console.error('Unknown error:', error)
      }
      return false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    refreshToken.value = null
    isAuthenticated.value = false

    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  function loadStoredAuth() {
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedRefreshToken && storedUser) {
      token.value = storedToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
  }

  loadStoredAuth()

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    logout
  }
})
