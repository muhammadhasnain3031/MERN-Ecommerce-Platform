import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || []; }
  catch { return []; }
};

const save = (items) => localStorage.setItem('cart', JSON.stringify(items));

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load() },
  reducers: {
    addToCart: (state, { payload }) => {
      const idx = state.items.findIndex(i => i._id === payload._id);
      if (idx >= 0) state.items[idx].quantity = (payload.quantity || state.items[idx].quantity + 1);
      else state.items.push({ ...payload, quantity: payload.quantity || 1 });
      save(state.items);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(i => i._id !== payload);
      save(state.items);
    },
    updateQuantity: (state, { payload: { id, quantity } }) => {
      const item = state.items.find(i => i._id === id);
      if (item) item.quantity = quantity;
      save(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;