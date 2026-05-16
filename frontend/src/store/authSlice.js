import { createSlice } from '@reduxjs/toolkit';

const getUser  = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const getToken = () => localStorage.getItem('token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: getUser(), token: getToken() },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user  = payload.user;
      state.token = payload.token;
      localStorage.setItem('user',  JSON.stringify(payload.user));
      localStorage.setItem('token', payload.token);
    },
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;