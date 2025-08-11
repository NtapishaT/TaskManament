import React from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, onEditTask }) => {
  const getColumnColor = () => {
    switch (status) {
      case 'TODO':
        return 'border-gray-300 bg-gray-50';
      case 'IN_PROGRESS':
        return 'border-blue-300 bg-blue-50';
      case 'DONE':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg border-2 ${getColumnColor()} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
        <span className="bg-white rounded-full px-2 py-1 text-sm font-medium text-gray-600">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
