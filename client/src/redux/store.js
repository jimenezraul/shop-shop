import { configureStore } from "@reduxjs/toolkit";
import ecommerceSlice from "./ecommerce/ecommerceSlice";

export default configureStore({
  reducer: {
    ecommerce: ecommerceSlice,
  },
});
