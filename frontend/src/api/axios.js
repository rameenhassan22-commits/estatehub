import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Called once from main.jsx. We pass the store in (instead of importing it here)
// to avoid a circular import: store -> authSlice -> api -> store.
export const setupInterceptors = (store, logoutAction) => {
  // Attach the JWT to every request
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url || "";
      const isCredentialCall = url.includes("/auth/login") || url.includes("/auth/register");

      // Log the user out only when a SAVED token was rejected. A 401 on the login form just means
      // "wrong password": the page must stay and show the error, not reload.
      if (error.response?.status === 401 && !isCredentialCall && error.config?.headers?.Authorization) {
        store.dispatch(logoutAction());
      }
      return Promise.reject(error);
    }
  );
};

// Helper used by pages: pull a readable message out of any Axios error
export const errorMessage = (err, fallback = "Something went wrong") =>
  err.response?.data?.message || fallback;