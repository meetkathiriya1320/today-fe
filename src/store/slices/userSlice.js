import { getCookieItem, getCurrentUserCookie } from "@/utils/cookieUtils";
import { createSlice } from "@reduxjs/toolkit";

const user_location_data = getCookieItem("user_location")
const user = getCurrentUserCookie();

const userSlice = createSlice({
    name: "user",
    initialState: {
        isOpenLocationModal: !user_location_data && !user,
        location: user_location_data,
        breadcrumArray: []
    },
    reducers: {
        openLocationModal: (state, { payload }) => {
            state.isOpenLocationModal = payload
        },
        setLocation: (state, { payload }) => {
            state.location = payload;
        },
        setBreeadCrumb: (state, { payload }) => {
            state.breadcrumArray = payload
        }

    },
});

export const { openLocationModal, setLocation, setBreeadCrumb } = userSlice.actions;
export default userSlice.reducer;
