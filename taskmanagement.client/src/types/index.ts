export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  creatorId: number;
  creatorName: string;
  assigneeId?: number;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigneeId?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigneeId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
