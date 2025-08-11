import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } from '../store/slices/taskSlice';
import { tasksApi, usersApi } from '../services/api';
import { addNotification } from '../store/slices/uiSlice';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigneeId: string;
}

const priorityMap: Record<TaskFormData['priority'], number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.tasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: (task?.priority as TaskFormData['priority']) || 'Medium',
      assigneeId: task?.assigneeId?.toString() || '',
    }
  });

  useEffect(() => {
    reset({
      title: task?.title || '',
      description: task?.description || '',
      priority: (task?.priority as TaskFormData['priority']) || 'Medium',
      assigneeId: task?.assigneeId?.toString() || '',
    });
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const mappedPriority = priorityMap[data.priority];
      const assignee = data.assigneeId && data.assigneeId !== '0' ? parseInt(data.assigneeId, 10) : undefined;

      const taskData = {
        title: data.title,
        description: data.description || undefined,
        priority: mappedPriority as unknown as CreateTaskRequest['priority'],
        assigneeId: assignee,
      } as unknown as CreateTaskRequest;

      if (task) {
        await tasksApi.updateTask(task.id, {
          title: taskData.title!,
          description: taskData.description,
          priority: taskData.priority as unknown as UpdateTaskRequest['priority'],
          assigneeId: taskData.assigneeId,
        } as UpdateTaskRequest);
        dispatch(addNotification({ type: 'success', message: 'Task updated successfully' }));
      } else {
        await tasksApi.createTask(taskData);
        dispatch(addNotification({ type: 'success', message: 'Task created successfully' }));
      }
      // Refresh tasks after create/update
      dispatch(fetchTasksStart());
      const [tasksData, usersData] = await Promise.all([
        tasksApi.getTasks(),
        usersApi.getUsers()
      ]);
      dispatch(fetchTasksSuccess({ tasks: tasksData, users: usersData }));
      onClose();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.title || err?.response?.data?.message || err?.message || 'Request failed';
      setError(serverMsg);
      dispatch(fetchTasksFailure(serverMsg));
      dispatch(addNotification({ type: 'error', message: serverMsg }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg text-center font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="input-field"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div> 
              <textarea
                {...register('description')}
                rows={3}
                className="input-field resize-none"
                placeholder="Enter task description"
              />
            </div>
            <div>
              <select {...register('priority')} className="input-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <select {...register('assigneeId')} className="input-field">
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff5733] text-white rounded-md hover:bg-[#e64e2e] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
