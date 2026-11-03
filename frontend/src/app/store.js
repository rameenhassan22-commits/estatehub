import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
  },
});

// Keep the login alive across page refreshes.
// Side effects (localStorage) do NOT belong inside reducers, so we do it here.
let previous = store.getState().auth;
store.subscribe(() => {
  const current = store.getState().auth;
  if (current === previous) return;
  previous = current;

  try {
    const { token, user, tenant } = current;
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    if (tenant) localStorage.setItem("tenant", JSON.stringify(tenant));
    else localStorage.removeItem("tenant");
  } catch {
    /* storage can be blocked (private mode): the app still works for this session */
  }
});