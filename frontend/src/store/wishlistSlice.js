import { createSlice } from '@reduxjs/toolkit';

const getKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id ? `wishlist_${user._id}` : 'wishlist_guest';
  } catch { return 'wishlist_guest'; }
};

const load = () => {
  try { return JSON.parse(localStorage.getItem(getKey())) || []; }
  catch { return []; }
};

const save = (items) => localStorage.setItem(getKey(), JSON.stringify(items));

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: load() },
  reducers: {
    toggleWishlist: (state, { payload }) => {
      const idx = state.items.findIndex((i) => i._id === payload._id);
      if (idx >= 0) state.items.splice(idx, 1);
      else state.items.push(payload);
      save(state.items);
    },
    removeFromWishlist: (state, { payload }) => {
      state.items = state.items.filter((i) => i._id !== payload);
      save(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem(getKey());
    },
    loadUserWishlist: (state) => { state.items = load(); },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist, loadUserWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
