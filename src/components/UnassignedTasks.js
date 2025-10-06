import React, { useState } from 'react';
import { AlertTriangle, User, Clock, ChevronDown, ChevronUp, UserX } from 'lucide-react';
import { TaskList } from './TaskList';

export function UnassignedTasks({ unassignedTasks }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!unassignedTasks || unassignedTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <UserX className="h-5 w-5 mr-2 text-green-600" />
          Задачи без исполнителя
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Отлично!</h3>
          <p className="text-gray-600">Все задачи назначены исполнителям</p>
        </div>
      </div>
    );
  }

  // Разделяем задачи по статусам
  const completedTasks = unassignedTasks.filter(task => task.isCompleted);
  const inProgressTasks = unassignedTasks.filter(task => 
    task.time_start && task.time_start.trim() !== '' && 
    (!task.time_end || task.time_end.trim() === '')
  );
  const notStartedTasks = unassignedTasks.filter(task => 
    (!task.time_start || task.time_start.trim() === '') &&
    (!task.time_end || task.time_end.trim() === '')
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <UserX className="h-5 w-5 mr-2 text-amber-600" />
          Задачи без исполнителя ({unassignedTasks.length})
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
        >
          <span>{isExpanded ? 'Скрыть' : 'Показать'}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Не начатые</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{notStartedTasks.length}</p>
          <p className="text-sm text-red-600">Требуют назначения исполнителя</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">В работе</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">{inProgressTasks.length}</p>
          <p className="text-sm text-amber-600">Начаты, но без исполнителя</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Завершенные</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{completedTasks.length}</p>
          <p className="text-sm text-green-600">Выполнены без назначения</p>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Not started tasks */}
          {notStartedTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                Не начатые задачи ({notStartedTasks.length})
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Критично:</strong> Эти задачи не имеют исполнителя и не начаты. 
                  Необходимо срочно назначить ответственных!
                </p>
              </div>
              <TaskList tasks={notStartedTasks.sort((a, b) => {
                const dateA = new Date(a.createTask || 0);
                const dateB = new Date(b.createTask || 0);
                return dateB - dateA;
              })} />
            </div>
          )}

          {/* In progress tasks */}
          {inProgressTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                Задачи в работе без исполнителя ({inProgressTasks.length})
              </h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Внимание:</strong> Эти задачи начаты, но не имеют назначенного исполнителя. 
                  Кто-то работает над ними, но это не отслеживается.
                </p>
              </div>
              <TaskList tasks={inProgressTasks.sort((a, b) => {
                const dateA = new Date(a.time_start || 0);
                const dateB = new Date(b.time_start || 0);
                return dateB - dateA;
              })} />
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 text-green-500 mr-2" />
                Завершенные задачи без исполнителя ({completedTasks.length})
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>ℹ️ Информация:</strong> Эти задачи выполнены, но не имели назначенного исполнителя. 
                  Возможно, стоит проанализировать процесс назначения задач.
                </p>
              </div>
              <TaskList tasks={completedTasks.sort((a, b) => {
                const dateA = new Date(a.time_end || 0);
                const dateB = new Date(b.time_end || 0);
                return dateB - dateA;
              })} />
            </div>
          )}

          {/* Statistics by creator */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Кто создает задачи без исполнителя:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(
                unassignedTasks.reduce((acc, task) => {
                  const creator = task.created_by_name || 'Неизвестно';
                  acc[creator] = (acc[creator] || 0) + 1;
                  return acc;
                }, {})
              ).map(([creator, count]) => (
                <div key={creator} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{creator}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">💡 Рекомендации:</h5>
            <div className="space-y-2 text-sm text-blue-800">
              {notStartedTasks.length > 0 && (
                <p>• Срочно назначьте исполнителей для {notStartedTasks.length} не начатых задач</p>
              )}
              {inProgressTasks.length > 0 && (
                <p>• Определите кто работает над {inProgressTasks.length} задачами в процессе</p>
              )}
              {completedTasks.length > 0 && (
                <p>• Проанализируйте процесс назначения - {completedTasks.length} задач выполнены без назначения</p>
              )}
              <p>• Настройте автоматическое назначение задач или обязательное поле "Исполнитель"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}