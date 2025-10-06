import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function TaskList({ tasks, showWarning = false, showOvertime = false }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Нет задач для отображения</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.taskid}
          className={`p-4 rounded-lg border transition-all duration-150 hover:shadow-sm ${
            (showWarning && task.isLongRunning) || (showOvertime && task.hasOvertimeHours)
              ? 'bg-amber-50 border-amber-200'
              : task.isCompleted
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-medium text-gray-500">
                  #{task.taskid}
                </span>
                {task.tast_identifier && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {task.tast_identifier}
                  </span>
                )}
                {task.isLongRunning && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Долгая задача
                  </span>
                )}
                {task.isOvertimeTask && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Переработка
                  </span>
                )}
                {task.hasOvertimeHours && (
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.overtimeFormatted} переработки
                  </span>
                )}
              </div>
              
              <h5 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {task.title}
              </h5>
              
              {task.created_by_name && (
                <p className="text-sm text-gray-600 mb-2">
                  Создано: <span className="font-medium">{task.created_by_name}</span>
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{task.durationFormatted}</span>
                </div>
                
                {task.hasOvertimeHours && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <Clock className="h-4 w-4" />
                    <span>+{task.overtimeFormatted} переработки</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  {task.isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Завершено</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span>В процессе</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}