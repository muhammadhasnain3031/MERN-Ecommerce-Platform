import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'http://localhost:5000/api/products';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return (await axios.get(`${API}?${query}`)).data;
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id) => {
  return (await axios.get(`${API}/${id}`)).data;
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], selected: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,    (s) => { s.loading = true; })
      .addCase(fetchProducts.fulfilled,  (s, a) => { s.items = a.payload; s.loading = false; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.selected = a.payload; });
  }
});

export default productSlice.reducer;