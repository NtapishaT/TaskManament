import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface UIState {
  notifications: NotificationItem[];
}

const initialState: UIState = {
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<{ type: NotificationType; message: string }>
    ) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      state.notifications.push({ id, ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } = uiSlice.actions;
export default uiSlice.reducer;
