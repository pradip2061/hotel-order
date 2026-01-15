// src/store/order/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL

/* ================= PLACE ORDER ================= */
export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/order/createOrder`,
        orderData,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to place order"
      );
    }
  }
);

/* ================= GET ORDERS ================= */
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/order/getOrder`);
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to fetch orders");
    }
  }
);

export const fetchMenuItems = createAsyncThunk(
  "order/fetchMenuItems",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/menu/getMenu`, {
        headers: { Authorization: `${token }`},
      });
      return res.data;
    } catch (err) {
      return rejectWithValue("Failed to fetch orders");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    loading: false,
    message: null,
    error: null,
    menuItems:[]
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    updateNewOrder:(state,action)=>{
      const exists = state.orders.find((o) => o._id === action.payload._id);
      if (!exists) {
        state.orders.unshift(action.payload); // add only if it doesn't exist
      }
    }
    ,
    updateNewMenu: (state, action) => {
    const incomingItem = action.payload;

    // If the payload has `deleted: true`, remove it
    if (incomingItem.deleted) {
      state.menuItems = state.menuItems.filter((item) => item._id !== incomingItem._id);
      return;
    }

    // Check if item already exists
    const index = state.menuItems.findIndex((item) => item._id === incomingItem._id);

    if (index !== -1) {
      // Replace the existing item
      state.menuItems[index] = incomingItem;
    } else {
      // Add new item at the top
      state.menuItems.unshift(incomingItem);
    }
  },
},
  extraReducers: (builder) => {
    builder
      // PLACE ORDER
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })

      // FETCH ORDERS
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.loading = false
      })
       .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.menuItems = action.payload.items;
      });
  },
});

export const { clearMessage,updateNewOrder,updateNewMenu} = orderSlice.actions;
export default orderSlice.reducer;
