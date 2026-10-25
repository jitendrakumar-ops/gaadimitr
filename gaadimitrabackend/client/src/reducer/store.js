import { configureStore } from "@reduxjs/toolkit";

import adminReducer from "./slices/adminSlice";
import vehicleReducer from "./slices/vehicleSlice";
import packageReducer from "./slices/packageSlice";
import supportReducer from "./slices/supportSlice";
import bookingReducer from "./slices/bookingSlice";
import serviceReducer from "./slices/serviceSlice";
import ratingReducer from "./slices/ratingSlice";
import documentReducer from "./slices/documentSlice";
import settingReducer from "./slices/settingSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    vehicle: vehicleReducer,
    package: packageReducer,
    support: supportReducer,
    booking: bookingReducer,
    service: serviceReducer,
    rating: ratingReducer,
    document: documentReducer,
    setting: settingReducer,

    // existing reducers
    // auth: authReducer,
    // user: userReducer,
    // settings: settingsReducer,
  },
});

export default store;
