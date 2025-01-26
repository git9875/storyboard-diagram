import { configureStore } from "@reduxjs/toolkit";
import flowReducer from "./flowSlice";

export default configureStore({
  reducer: {
    flow: flowReducer
  }
});
