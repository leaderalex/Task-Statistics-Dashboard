import React from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { StatCard } from './StatCard';
import { Users, CheckCircle, Clock, AlertTriangle, BarChart3, TrendingUp, Moon, Zap, Timer, Pause } from 'lucide-react';
import { formatDuration } from '../utils/dataProcessor';

export function OverallStats({ userStats, unassignedTasks = [] }) {
  const totalTasks = userStats.reduce((sum, user) => sum + user.totalTasks, 0);
  const totalCompletedTasks = userStats.reduce((sum, user) => sum + user.completedTasks, 0);
  const totalWorkTime = userStats.reduce((sum, user) => sum + user.totalWorkTime, 0);
  const totalLongRunningTasks = userStats.reduce((sum, user) => sum + user.longRunningTasks.length, 0);
  const totalOvertimeTasks = userStats.reduce((sum, user) => sum + user.overtimeTasks.length, 0);
  
  // Правильный расчет общих часов переработки
  const totalOvertimeHours = userStats.reduce((sum, user) => {
    const userOvertime = user.totalOvertimeHours || 0;
    return sum + userOvertime;
  }, 0);
  
  const totalTasksWithOvertimeHours = userStats.reduce((sum, user) => sum + user.tasksWithOvertimeHours.length, 0);
  const totalQuickTasks = userStats.reduce((sum, user) => sum + user.quickTasks.length, 0);
  const totalMediumTasks = userStats.reduce((sum, user) => sum + user.mediumTasks.length, 0);
  const activeUsers = userStats.filter(user => user.completedTasks > 0).length;
  const totalCurrentTasks = userStats.reduce((sum, user) => sum + (user.currentTasks?.length || 0), 0);
  const totalNotStartedTasks = userStats.reduce((sum, user) => sum + (user.notStartedTasks?.length || 0), 0);
  const averageTasksPerUser = activeUsers > 0 ? Math.round(totalCompletedTasks / activeUsers) : 0;
  
  // Calculate incomplete tasks (not started + in progress)
  const totalIncompleteTasks = totalCurrentTasks + totalNotStartedTasks;
  
  // Statistics for unassigned tasks
  const unassignedCompletedTasks = unassignedTasks.filter(task => task.isCompleted).length;
  const unassignedInProgress = unassignedTasks.filter(task => 
    task.time_start && task.time_start.trim() !== '' && 
    (!task.time_end || task.time_end.trim() === '')
  ).length;

  return (
    <CollapsibleWidget
      title="Общая статистика команды"
      icon={BarChart3}
      defaultExpanded={true}
    >
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Всего пользователей"
          value={userStats.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Активных пользователей"
          value={activeUsers}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Всего задач"
          value={totalTasks}
          icon={BarChart3}
          color="purple"
        />
        <StatCard
          title="Завершенных задач"
          value={totalCompletedTasks}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Задач в работе"
          value={totalCurrentTasks}
          icon={Timer}
          color={totalCurrentTasks > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Задач не начато"
          value={totalNotStartedTasks}
          icon={Pause}
          color={totalNotStartedTasks > 0 ? 'red' : 'green'}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
        <StatCard
          title="Всего незавершенных"
          value={totalIncompleteTasks}
          subtitle={`${totalCurrentTasks} в работе + ${totalNotStartedTasks} не начато`}
          icon={AlertTriangle}
          color={totalIncompleteTasks > 20 ? 'red' : totalIncompleteTasks > 10 ? 'amber' : 'green'}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
        <StatCard
          title="Общее время работы"
          value={formatDuration(totalWorkTime)}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Задач без исполнителя"
          value={unassignedTasks.length}
          subtitle={`${unassignedCompletedTasks} завершено, ${unassignedInProgress} в работе`}
          icon={AlertTriangle}
          color={unassignedTasks.length > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Долгих задач"
          value={totalLongRunningTasks}
          icon={AlertTriangle}
          color={totalLongRunningTasks > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Быстрых задач (≤30мин)"
          value={totalQuickTasks}
          icon={Zap}
          color="green"
        />
        <StatCard
          title="Средних задач (30мин-2ч)"
          value={totalMediumTasks}
          icon={Timer}
          color="blue"
        />
        <StatCard
          title="Переработка (>16:00)"
          value={totalOvertimeTasks}
          icon={Moon}
          color={totalOvertimeTasks > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Задач с переработкой"
          value={totalTasksWithOvertimeHours}
          icon={Clock}
          color={totalTasksWithOvertimeHours > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Часов переработки"
          value={formatDuration(totalOvertimeHours)}
          icon={Clock}
          color={totalOvertimeHours > 0 ? 'red' : 'green'}
        />
      </div>
      
      {activeUsers > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">Рабочие часы:</span>{' '}
              9:00-16:00 (переработка до 23:00)
            </p>
            <p>
              <span className="font-medium">Среднее задач на пользователя:</span>{' '}
              {averageTasksPerUser}
            </p>
            <p>
              <span className="font-medium">Процент завершения:</span>{' '}
              {totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0}%
            </p>
            <p>
              <span className="font-medium">Часов переработки:</span>{' '}
              {formatDuration(totalOvertimeHours)}
            </p>
          </div>
        </div>
      )}
    </CollapsibleWidget>
  );
}