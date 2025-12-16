import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        unreadCount: 0,
    },
    reducers: {
        setUnreadCount: (state, { payload }) => {
            state.unreadCount = payload;
        },
        unreadCountUpdate: (state) => {
            state.unreadCount = 0;
        },
        decrementUnreadCount: (state) => {
            if (state.unreadCount > 0) {
                state.unreadCount -= 1;
            }
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
    },
});

export const { setUnreadCount, unreadCountUpdate, decrementUnreadCount, incrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;