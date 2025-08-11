import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Task, User } from '../../types';

interface TasksState {
  tasks: Task[];
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  users: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess(state, action: PayloadAction<{ tasks: Task[]; users: User[] }>) {
      state.tasks = action.payload.tasks;
      state.users = action.payload.users;
      state.loading = false;
      state.error = null;
    },
    fetchTasksFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    
  },
});

export const { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } = taskSlice.actions;
export default taskSlice.reducer;
