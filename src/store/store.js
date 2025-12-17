import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../store/slices/userSlice"
import notificationSlice from "../store/slices/notificationSlice"

export const store = configureStore({
    reducer: {
        user: userSlice,
        notification: notificationSlice,
    },
});

export default store;
