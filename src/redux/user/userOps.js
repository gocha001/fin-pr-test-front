import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { refreshTokens } from "./userSlice";
// import { store } from "../store";

// Create an Axios instance with a base URL for API requests
export const axiosInstance = axios.create({
  baseURL: "https://fin-pr-test-bek.onrender.com",
  // baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Utility to set the Authorization header with the JWT token
const setAuthHeader = (token) => {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// Utility to remove the Authorization header
const clearAuthHeader = () => {
  delete axiosInstance.defaults.headers.common.Authorization;
};

// Set up Axios interceptors to handle token refresh on 401 errors
export const setupAxiosInterceptors = (store) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log(error.config);
      console.log(error.response?.status);
      if (error.response?.status === 401) {
        try {
          const data = await store.dispatch(refresh());
          console.log(data);
          // const { refreshToken } = store.getState().auth;
          // console.log(refreshToken);
          // if (refreshToken) {
          //   const { data } = await axiosInstance.post("/auth/refresh");
          //   console.log(data);
            store.dispatch(refreshTokens(data));
            setAuthHeader(data.accessToken);
            error.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return axiosInstance.request(error.config);
          // }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Thunk for user registration
export const signUp = createAsyncThunk(
  "user/signup",
  async (signUpData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/auth/register", signUpData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for user login
export const signIn = createAsyncThunk(
  "user/signin",
  async (signInData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/auth/login", signInData);
      setAuthHeader(response.data.data.accessToken);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for user logout
export const signOut = createAsyncThunk("user/signout", async (_, thunkAPI) => {
  try {
    await axiosInstance.post("/auth/logout");
    clearAuthHeader();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message
    );
  }
});

// Thunk for fetching the current user
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const reduxState = thunkAPI.getState();
      setAuthHeader(reduxState.auth.accessToken);
      const response = await axiosInstance.get("/auth/current");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      const savedToken = state.auth.accessToken;
      return savedToken !== null;
    },
  }
);

// Thunk for updating user details
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (data, thunkAPI) => {
    try {
      let response = "";
      if ("avatar" in data) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
          formData.append(key, value);
        }
        response = await axiosInstance.patch("/auth/update-user", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axiosInstance.patch("/auth/update-user", data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      return response.data.data;
    } catch (error) {
      console.error(error);
      return thunkAPI.rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState, rejectWithValue }) => {
      const state = getState();
      const savedToken = state.auth.accessToken;
      if (!savedToken) {
        rejectWithValue("Unauthorized");
        return false;
      }
      return true;
    },
  }
);

// Thunk for sending a password reset email
export const sendResetEmail = createAsyncThunk(
  "user/sendResetEmail",
  async (emailData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/auth/send-reset-email",
        emailData
      );
      return response.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for validating a password reset token
export const validateResetToken = createAsyncThunk(
  "user/validateResetToken",
  async (token, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/auth/reset-password?token=${token}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for resetting the password
export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (resetData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/auth/reset-pwd", {
        token: resetData.resetToken, 
        password: resetData.password,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for fetching the OAuth URL for Google login
export const fetchOAuthUrl = createAsyncThunk(
  "user/fetchOAuthUrl",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/auth/get-oauth-url");
      return response.data.url;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Thunk for handling Google login
export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (googleData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/auth/google-login",
        googleData
      );
      setAuthHeader(response.data.accessToken);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getUserCount = createAsyncThunk(
  "user/getUserCount",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/auth/count");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const refresh = createAsyncThunk("auth/refresh", async (_, thunkApi) => {
  const savedToken = thunkApi.getState().auth.accessToken;

  if (!savedToken) {
    return thunkApi.rejectWithValue("Token does not exist!");
  }
  setAuthHeader(savedToken);
  try {
    const { data } = await axiosInstance.post("/auth/refresh");

    if (!data.accessToken) {
      throw new Error("No accessToken in server response");
    }
    return data;
  } catch (error) {
    console.error("Error in refresh token:", error);
    return thunkApi.rejectWithValue(error.message);
  }
});

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/auth/refresh")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const result = await store.dispatch(refresh());
//         const newToken = result.payload.accessToken;
//         setAuthHeader(newToken);

//         originalRequest.headers.Authorization = `Bearer ${newToken}`;

//         return axiosInstance(originalRequest);
//       } catch (err) {
//         console.error("Failed to refresh token:", err);
//         store.dispatch(signOut());
//         return Promise.reject(err);
//       }
//     }
//     return Promise.reject(error);
//   }
// );