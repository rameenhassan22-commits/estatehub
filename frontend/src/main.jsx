import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { store } from "./app/store";
import { setupInterceptors } from "./api/axios";
import { logout } from "./features/auth/authSlice";

setupInterceptors(store, logout);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);