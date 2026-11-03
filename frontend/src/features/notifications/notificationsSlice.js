import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { unreadInquiries: 0, tick: 0, connected: false },
  reducers: {
    inquiryReceived(state) {
      state.unreadInquiries += 1;
      state.tick += 1;
    },
    inquiryChanged(state) {
      state.tick += 1;
    },
    clearUnread(state) {
      state.unreadInquiries = 0;
    },
    setConnected(state, { payload }) {
      state.connected = payload;
    },
  },
});

export const { inquiryReceived, inquiryChanged, clearUnread, setConnected } = notificationsSlice.actions;
export default notificationsSlice.reducer;