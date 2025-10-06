import React, { useState } from 'react';
import { StatCard } from './StatCard';
import { TaskList } from './TaskList';
import { TaskChart } from './TaskChart';
import { 
  User, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  Moon,
  Zap,
  Timer,
  Pause
} from 'lucide-react';
import { formatDuration } from '../utils/dataProcessor';

export function UserCard({ userStats }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{userStats.assignee_username}</h3>
              <p className="text-sm text-gray-500">
                {userStats.completedTasks} из {userStats.taskCount} задач завершено
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
          >
            <span>{isExpanded ? 'Скрыть' : 'Подробнее'}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Общее количество задач"
            value={userStats.totalTasks}
            icon={BarChart3}
            color="blue"
          />
          <StatCard
            title="Завершено задач"
            value={userStats.completedTasks}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Общее время работы"
            value={formatDuration(userStats.totalWorkTime)}
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Задач в работе"
            value={userStats.currentTasks.length}
            icon={Timer}
            color={userStats.currentTasks.length > 0 ? 'amber' : 'green'}
          />
          <StatCard
            title="Задач не начато"
            value={userStats.notStartedTasks.length}
            icon={Clock}
            color={userStats.notStartedTasks.length > 0 ? 'red' : 'green'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <StatCard
            title="Долгих задач (>5ч)"
            value={userStats.longRunningTasks.length}
            icon={AlertTriangle}
            color={userStats.longRunningTasks.length > 0 ? 'amber' : 'green'}
          />
          <StatCard
            title="Переработка (после 16:00)"
            value={userStats.overtimeTasks.length}
            subtitle={`${formatDuration(userStats.overtimeWorkTime || 0)} времени`}
            icon={Moon}
            color={userStats.overtimeTasks.length > 0 ? 'red' : 'green'}
          />
          <StatCard
            title="Часы переработки"
            value={formatDuration(userStats.totalOvertimeHours || 0)}
            subtitle={`${userStats.tasksWithOvertimeHours.length} задач с переработкой`}
            icon={Clock}
            color={(userStats.totalOvertimeHours || 0) > 0 ? 'red' : 'green'}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <StatCard
            title="Быстрые задачи (≤30мин)"
            value={userStats.quickTasks.length}
            subtitle={`${formatDuration(userStats.quickTasks.reduce((sum, task) => sum + task.duration, 0))} времени`}
            icon={Zap}
            color="green"
          />
          <StatCard
            title="Средние задачи (30мин-2ч)"
            value={userStats.mediumTasks.length}
            subtitle={`${formatDuration(userStats.mediumTasks.reduce((sum, task) => sum + task.duration, 0))} времени`}
            icon={Timer}
            color="blue"
          />
        </div>
        {userStats.completedTasks > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Среднее время задачи:</span>{' '}
                {formatDuration(Math.round(userStats.averageTaskTime))}
              </p>
              <p>
                <span className="font-medium">Процент завершения:</span>{' '}
                {Math.round((userStats.completedTasks / userStats.totalTasks) * 100)}%
              </p>
              <p>
                <span className="font-medium">Часов переработки:</span>{' '}
                {formatDuration(userStats.totalOvertimeHours || 0)}
              </p>
              <p>
                <span className="font-medium">Быстрых задач:</span>{' '}
                {userStats.quickTasks.length}
              </p>
              <p>
                <span className="font-medium">Средних задач:</span>{' '}
                {userStats.mediumTasks.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          <TaskChart userStats={userStats} />

          {userStats.currentTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Timer className="h-4 w-4 text-amber-500 mr-2" />
                Текущие задачи в работе ({userStats.currentTasks.length})
              </h4>
              <TaskList tasks={userStats.currentTasks} />
            </div>
          )}

          {userStats.notStartedTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Pause className="h-4 w-4 text-red-500 mr-2" />
                Задачи не начаты ({userStats.notStartedTasks.length})
              </h4>
              <TaskList tasks={userStats.notStartedTasks} />
            </div>
          )}

          {userStats.tasksWithOvertimeHours.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 text-red-500 mr-2" />
                Задачи с часами переработки (закончены после 16:00)
              </h4>
              <TaskList tasks={userStats.tasksWithOvertimeHours} showOvertime />
            </div>
          )}

          {userStats.overtimeTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Moon className="h-4 w-4 text-red-500 mr-2" />
                Задачи начатые после 16:00 (переработка)
              </h4>
              <TaskList tasks={userStats.overtimeTasks} showWarning />
            </div>
          )}

          {userStats.longRunningTasks.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                Задачи с длительным выполнением (более 5 часов)
              </h4>
              <TaskList tasks={userStats.longRunningTasks} showWarning />
            </div>
          )}

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
              Все задачи пользователя
            </h4>
            <TaskList tasks={userStats.tasks} />
          </div>
        </div>
      )}
    </div>
  );
}