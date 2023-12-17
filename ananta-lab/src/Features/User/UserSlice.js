import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  userId: localStorage.getItem('userId'),
  isLoading: false,
  token: localStorage.getItem('token'),
  is2FAEnabled: false,
};
export const LoginUser = createAsyncThunk(
  'user/LoginUser',
  async (formData, thunkAPI) => {
    const response = await axios.post(
      'http://localhost:5000/api/v1/login',
      formData
    );
    if (response.data.is2FAEnabled) {
      thunkAPI.dispatch(set2FAEnabled());
    }
    return response.data;
    // console.log(response.data, 'This is form data');
  }
);
export const CreateUser = createAsyncThunk(
  'user/CreateUser',
  async (formData, thunkAPI) => {
    const response = await axios.post(
      'http://localhost:5000/api/v1/createUser',
      formData
    );
    return response.data;
  }
);

const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    set2FAEnabled: (state) => {
      state.is2FAEnabled = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(CreateUser.fulfilled, (state, { payload }) => {
      localStorage.setItem('userId', payload.userId);
      localStorage.setItem('token', payload.token);
      state.userId = payload.userId;
      state.token = payload.token;
    });
    builder.addCase(CreateUser.rejected, (state, action) => {
      console.log(action);
    });
    builder.addCase(LoginUser.fulfilled, (state, { payload }) => {
      localStorage.setItem('userId', payload.userId);
      localStorage.setItem('token', payload.token);
      state.userId = payload.userId;
      state.token = payload.token;
    });
  },
});
export const { setTokenandUser, set2FAEnabled } = UserSlice.actions;
export default UserSlice.reducer;
