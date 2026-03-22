import { createSlice } from '@reduxjs/toolkit'
import { connectSocket, disconnectSocket } from '../services/socket'

// Load initial state from localStorage
const savedUser = (() => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch { return null }
})()
const savedToken = localStorage.getItem('token') || null

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken,
    loading: false,
  },
  reducers: {
    setUser(state, action) {
      const { user, token } = action.payload
      state.user = user
      if (token) state.token = token
      // Persist
      localStorage.setItem('user', JSON.stringify(user))
      if (token) localStorage.setItem('token', token)
      // Connect socket
      const userId = user?.id || user?._id
      if (userId) connectSocket(userId)
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    clearUser(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      disconnectSocket()
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
  },
})

export const { setUser, updateUser, clearUser, setLoading } = authSlice.actions
export default authSlice.reducer
