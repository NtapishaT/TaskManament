import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  User 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const tasksApi = {
  getTasks: async (status?: string, assignee?: number): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (assignee) params.append('assignee', assignee.toString());
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: number, taskData: UpdateTaskRequest): Promise<void> => {
    await api.put(`/tasks/${id}`, taskData);
  },

  updateTaskStatus: async (id: number, status: string): Promise<void> => {
    await api.put(`/tasks/${id}/status`, { status });
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};

export default api;
