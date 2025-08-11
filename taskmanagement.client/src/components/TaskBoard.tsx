import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';
import type { Task } from '../types';
import type { RootState } from '../store';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } from '../store/slices/taskSlice';
import { tasksApi, usersApi } from '../services/api';
import { logout } from '../store/slices/authSlice';

const TaskBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error, users } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(fetchTasksStart());
      try {
        const [tasksData, usersData] = await Promise.all([
          tasksApi.getTasks(),
          usersApi.getUsers()
        ]);
        dispatch(fetchTasksSuccess({ tasks: tasksData, users: usersData }));
      } catch (err: any) {
        dispatch(fetchTasksFailure(err.response?.data?.message || 'Failed to fetch data'));
      }
    };
    fetchData();
  }, [dispatch]);

  const todoTasks = tasks.filter(task => task.status === 'TODO');
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(task => task.status === 'DONE');

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Task Management</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateTask}
              className="px-3 py-2 bg-[#ff5733] text-white rounded-md hover:bg-[#e64e2e]"
            >
              + New Task
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-300 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Task Board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            status="TODO"
            tasks={todoTasks}
            onEditTask={handleEditTask}
          />
          <TaskColumn
            title="In Progress"
            status="IN_PROGRESS"
            tasks={inProgressTasks}
            onEditTask={handleEditTask}
          />
          <TaskColumn
            title="Done"
            status="DONE"
            tasks={doneTasks}
            onEditTask={handleEditTask}
          />
        </div>
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TaskBoard;
