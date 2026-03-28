import { createSlice } from '@reduxjs/toolkit'

const savedPage = localStorage.getItem('currentPage') || 'dashboard'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    page: savedPage,
  },
  reducers: {
    setPage(state, action) {
      state.page = action.payload
      localStorage.setItem('currentPage', action.payload)
    },
  },
})

export const { setPage } = uiSlice.actions
export default uiSlice.reducer
