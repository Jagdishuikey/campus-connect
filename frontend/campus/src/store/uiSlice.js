import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    page: 'dashboard',
  },
  reducers: {
    setPage(state, action) {
      state.page = action.payload
    },
  },
})

export const { setPage } = uiSlice.actions
export default uiSlice.reducer
