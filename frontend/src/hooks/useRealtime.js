import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createSocket } from "../lib/socket";
import { inquiryReceived, inquiryChanged, setConnected } from "../features/notifications/notificationsSlice";

export const useRealtime = () => {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const role = useSelector((s) => s.auth.user?.role);

  useEffect(() => {
    if (!token || !role || role === "super_admin") return;

    const socket = createSocket(token);
    socket.on("connect", () => dispatch(setConnected(true)));
    socket.on("disconnect", () => dispatch(setConnected(false)));

    socket.on("inquiry:new", (e) => {
      dispatch(inquiryReceived());
      toast(`📬 ${e.customerName} asked about “${e.propertyTitle}”`, { duration: 6000 });
    });

    socket.on("inquiry:updated", (e) => {
      dispatch(inquiryChanged());
      toast(`Your inquiry about “${e.propertyTitle || "a property"}” is now: ${e.status}`, { duration: 6000 });
    });

    return () => socket.close(); // logout / token change -> disconnect
  }, [token, role, dispatch]);
};