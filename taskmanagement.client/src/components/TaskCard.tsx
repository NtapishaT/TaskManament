import React, { useState } from 'react';
import type { Task } from '../types';
import { useDispatch } from 'react-redux';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } from '../store/slices/taskSlice';
import { tasksApi, usersApi } from '../services/api';
import { addNotification } from '../store/slices/uiSlice';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await tasksApi.updateTaskStatus(task.id, newStatus);
      dispatch(fetchTasksStart());
      const [tasksData, usersData] = await Promise.all([
        tasksApi.getTasks(),
        usersApi.getUsers()
      ]);
      dispatch(fetchTasksSuccess({ tasks: tasksData, users: usersData }));
      dispatch(addNotification({ type: 'success', message: 'Task status updated' }));
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update task status';
      dispatch(fetchTasksFailure(msg));
      dispatch(addNotification({ type: 'error', message: msg }));
      console.error('Failed to update task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await tasksApi.deleteTask(task.id);
        dispatch(fetchTasksStart());
        const [tasksData, usersData] = await Promise.all([
          tasksApi.getTasks(),
          usersApi.getUsers()
        ]);
        dispatch(fetchTasksSuccess({ tasks: tasksData, users: usersData }));
        dispatch(addNotification({ type: 'success', message: 'Task deleted successfully' }));
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.message || 'Failed to delete task';
        dispatch(fetchTasksFailure(msg));
        dispatch(addNotification({ type: 'error', message: msg }));
        console.error('Failed to delete task:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getNextStatus = () => {
    switch (task.status) {
      case 'TODO':
        return 'IN_PROGRESS';
      case 'IN_PROGRESS':
        return 'DONE';
      case 'DONE':
        return 'TODO';
      default:
        return 'TODO';
    }
  };

  const getNextStatusLabel = () => {
    switch (task.status) {
      case 'TODO':
        return 'Start';
      case 'IN_PROGRESS':
        return 'Complete';
      case 'DONE':
        return 'Reopen';
      default:
        return 'Start';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Created by {task.creatorName}</span>
        {task.assigneeName && <span>Assigned to {task.assigneeName}</span>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange(getNextStatus())}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {getNextStatusLabel()}
          </button>
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Edit
          </button>
        </div>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
