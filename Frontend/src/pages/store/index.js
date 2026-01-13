import { configureStore } from "@reduxjs/toolkit";
import orderReducer from "./order/orderSlice";

export const store = configureStore({
  reducer: {
    order: orderReducer,
  },
});

export default store;
