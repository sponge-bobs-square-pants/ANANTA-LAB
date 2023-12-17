import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  is2FA: false,
  secret: '',
  imgurl: '',
  otp: '',
  otpVerificationStatus: 'not',
};
export const get2FA = createAsyncThunk(
  'userAuthSlice/get2FA',
  async (state, thunkAPI) => {
    const token = thunkAPI.getState().user.token;
    const headers = {
      authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.get(
        'http://localhost:5000/api/v1/generate-otp-secret',
        { headers }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
export const verify2FA = createAsyncThunk(
  'userAuthSlice/verify2FA',
  async (state, thunkAPI) => {
    const otp = thunkAPI.getState().uauth.otp;
    const token = thunkAPI.getState().user.token;
    const headers = {
      authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/confirm-otp-secret',
        { token: `${otp}` },
        { headers }
      );
      return response.data;
    } catch (error) {
      thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
export const deactive2FA = createAsyncThunk(
  'userAuthSlice/deactivate2FA',
  async (state, thunkAPI) => {
    const token = thunkAPI.getState().user.token;
    const headers = {
      authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.get(
        'http://localhost:5000/api/v1/deactivate2FA',
        { headers }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      thunkAPI.rejectWithValue(error.response.msg);
    }
  }
);
const userAuthSlice = createSlice({
  name: 'userAuthSlice',
  initialState,
  reducers: {
    setauth: (state) => {
      state.is2FA = !state.is2FA;
    },
    setotp: (state, { payload }) => {
      state.otp = payload.otp;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get2FA.fulfilled, (state, { payload }) => {
      state.is2FA = !state.is2FA;
      state.imgurl = payload.image;
      state.secret = payload.secret;
    });
    builder.addCase(get2FA.rejected, (state, { payload }) => {
      console.log(payload.error);
    });
    builder.addCase(verify2FA.fulfilled, (state, action) => {
      if (action.payload) {
        console.log(action);
        state.otpVerificationStatus = 'success';
        state.secret = '';
        state.imgurl = '';
        state.is2FA = false;
      }
    });
    builder.addCase(verify2FA.rejected, (state, action) => {
      console.log(action);
    });
    builder.addCase(deactive2FA.fulfilled, (state, action) => {
      console.log(action);
    });
  },
});
export const { setauth, setotp } = userAuthSlice.actions;
export default userAuthSlice.reducer;
