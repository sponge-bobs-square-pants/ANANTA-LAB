import { configureStore } from '@reduxjs/toolkit';
import userReducer from './Features/User/UserSlice';
import userauthsliceReducer from './Features/User/UserAuthentication';
export const store = configureStore({
  reducer: {
    user: userReducer,
    uauth: userauthsliceReducer,
  },
});
