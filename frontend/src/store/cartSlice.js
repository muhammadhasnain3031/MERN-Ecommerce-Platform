import { createSlice } from '@reduxjs/toolkit';

// ✅ Har user ka alag cart key
const getCartKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id ? `cart_${user._id}` : 'cart_guest';
  } catch {
    return 'cart_guest';
  }
};

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(getCartKey())) || [];
  } catch {
    return [];
  }
};

const save = (items) => {
  localStorage.setItem(getCartKey(), JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load() },
  reducers: {
    addToCart: (state, { payload }) => {
      const idx = state.items.findIndex((i) => i._id === payload._id);
      if (idx >= 0) {
        state.items[idx].quantity = payload.quantity || state.items[idx].quantity + 1;
      } else {
        state.items.push({ ...payload, quantity: payload.quantity || 1 });
      }
      save(state.items);
    },

    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter((i) => i._id !== payload);
      save(state.items);
    },

    updateQuantity: (state, { payload: { id, quantity } }) => {
      const item = state.items.find((i) => i._id === id);
      if (item) item.quantity = quantity;
      save(state.items);
    },

    clearCart: (state) => {
      const key = getCartKey();
      state.items = [];
      localStorage.removeItem(key);
    },

    // ✅ Login ke baad us user ka cart load karo
    loadUserCart: (state) => {
      state.items = load();
    },

    // ✅ Logout ke baad cart empty karo (state mein, localStorage nahi)
    resetCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadUserCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;