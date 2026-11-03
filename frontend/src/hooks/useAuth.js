import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

// Small wrapper so components don't need to know Redux is underneath:
//   const { user, tenant, logout } = useAuth();
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, tenant, initializing } = useSelector((state) => state.auth);

  return {
    user,
    tenant,
    initializing,
    isAuthenticated: Boolean(user),
    logout: () => dispatch(logout()),
  };
};