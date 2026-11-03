import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

const readJSON = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

// Turn an Axios error into a plain object that is safe to keep in Redux
const toPayload = (err) => ({
  status: err.response?.status ?? 0,
  message: err.response?.data?.message || "Could not reach the server. Please try again.",
  errors: err.response?.data?.errors || {}, // { email: "Email already in use" } -> shown under the field
});

const postThunk = (type, url) =>
  createAsyncThunk(type, async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post(url, body);
      return data; // { token, user, tenant }
    } catch (err) {
      return rejectWithValue(toPayload(err));
    }
  });

export const login = postThunk("auth/login", "/auth/login");
export const registerCustomer = postThunk("auth/registerCustomer", "/auth/register-customer");
export const registerAgency = postThunk("auth/registerAgency", "/auth/register-agency");

// Runs once on page load: is the saved token still valid?
export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data; // { user, tenant }
  } catch (err) {
    return rejectWithValue(toPayload(err));
  }
});

const token = localStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token,
    user: readJSON("user"),
    tenant: readJSON("tenant"),
    // true while we verify a saved token, so ProtectedRoute doesn't flash the login page
    initializing: Boolean(token),
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.tenant = null;
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [login, registerCustomer, registerAgency]) {
      builder.addCase(thunk.fulfilled, (state, { payload }) => {
        state.token = payload.token;
        state.user = payload.user;
        state.tenant = payload.tenant;
        state.initializing = false;
      });
    }

    builder
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.tenant = payload.tenant;
        state.initializing = false;
      })
      .addCase(fetchMe.rejected, (state, { payload }) => {
        state.initializing = false;
        // Only log out when the server says the token is bad, NOT when the server is merely unreachable
        if (payload?.status === 401 || payload?.status === 403) {
          state.token = null;
          state.user = null;
          state.tenant = null;
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;