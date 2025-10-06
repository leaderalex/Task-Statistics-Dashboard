import React, { useMemo, useState } from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { Bell, AlertTriangle, Clock, Users, TrendingDown, Zap, X, CheckCircle, Eye, EyeOff } from 'lucide-react';

export function SmartNotifications({ userStats, allTasks, workloadBalance, zombieTasks }) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  
  const notifications = useMemo(() => {
    const alerts = [];
    const now = new Date();
    
    // 1. Критические задачи-зомби (более 7 дней без движения)
    if (zombieTasks && zombieTasks.length > 0) {
      alerts.push({
        id: 'zombie-tasks',
        type: 'critical',
        icon: AlertTriangle,
        title: 'Критично: Задачи-зомби',
        message: `${zombieTasks.length} задач висят без движения более 7 дней`,
        details: zombieTasks.slice(0, 3).map(task => `#${task.taskid} - ${task.title}`),
        action: 'Переназначить или закрыть',
        priority: 10
      });
    }
    
    // 2. Перегруженные пользователи
    if (workloadBalance && workloadBalance.overloaded && workloadBalance.overloaded.length > 0) {
      alerts.push({
        id: 'overloaded-users',
        type: 'warning',
        icon: Users,
        title: 'Перегрузка команды',
        message: `${workloadBalance.overloaded.length} участников перегружены`,
        details: workloadBalance.overloaded.map(user => `${user.username}: ${user.activeTasks} активных задач`),
        action: 'Перераспределить нагрузку',
        priority: 8
      });
    }
    
    // 3. Долгие задачи в работе (более 2 дней)
    const longRunningInProgress = allTasks.filter(task => {
      if (!task.time_start || task.time_end) return false;
      const startDate = new Date(task.time_start);
      const daysDiff = (now - startDate) / (1000 * 60 * 60 * 24);
      return daysDiff > 2;
    });
    
    if (longRunningInProgress.length > 0) {
      alerts.push({
        id: 'long-running-tasks',
        type: 'warning',
        icon: Clock,
        title: 'Долгие задачи в работе',
        message: `${longRunningInProgress.length} задач в работе более 2 дней`,
        details: longRunningInProgress.slice(0, 3).map(task => 
          `#${task.taskid} - ${task.assignee_username || 'Не назначен'}`
        ),
        action: 'Проверить прогресс',
        priority: 6
      });
    }
    
    // 4. Неназначенные задачи
    const unassignedTasks = allTasks.filter(task => !task.assignee_username || task.assignee_username.trim() === '');
    if (unassignedTasks.length > 0) {
      alerts.push({
        id: 'unassigned-tasks',
        type: 'info',
        icon: Users,
        title: 'Неназначенные задачи',
        message: `${unassignedTasks.length} задач без исполнителя`,
        details: unassignedTasks.slice(0, 3).map(task => `#${task.taskid} - ${task.title}`),
        action: 'Назначить исполнителей',
        priority: 5
      });
    }
    
    // 5. Падение производительности
    const completedThisWeek = allTasks.filter(task => {
      if (!task.time_end) return false;
      const endDate = new Date(task.time_end);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return endDate >= weekAgo;
    }).length;
    
    const completedLastWeek = allTasks.filter(task => {
      if (!task.time_end) return false;
      const endDate = new Date(task.time_end);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return endDate >= twoWeeksAgo && endDate < weekAgo;
    }).length;
    
    if (completedLastWeek > 0 && completedThisWeek < completedLastWeek * 0.7) {
      alerts.push({
        id: 'productivity-drop',
        type: 'warning',
        icon: TrendingDown,
        title: 'Снижение производительности',
        message: `Завершено ${completedThisWeek} задач против ${completedLastWeek} на прошлой неделе`,
        details: [`Снижение на ${Math.round((1 - completedThisWeek/completedLastWeek) * 100)}%`],
        action: 'Проанализировать причины',
        priority: 7
      });
    }
    
    // 6. Пользователи без активности
    const inactiveUsers = userStats.filter(user => {
      const hasCurrentTasks = user.currentTasks && user.currentTasks.length > 0;
      const hasRecentActivity = user.completedTasks > 0;
      return !hasCurrentTasks && hasRecentActivity;
    });
    
    if (inactiveUsers.length > 0) {
      alerts.push({
        id: 'inactive-users',
        type: 'info',
        icon: Clock,
        title: 'Пользователи без активных задач',
        message: `${inactiveUsers.length} участников без текущих задач`,
        details: inactiveUsers.slice(0, 3).map(user => user.assignee_username),
        action: 'Назначить новые задачи',
        priority: 3
      });
    }
    
    // 7. Много переработок
    const overtimeUsers = userStats.filter(user => (user.totalOvertimeHours || 0) > 240); // более 4 часов
    if (overtimeUsers.length > 0) {
      alerts.push({
        id: 'overtime-alert',
        type: 'warning',
        icon: Clock,
        title: 'Превышение рабочего времени',
        message: `${overtimeUsers.length} участников работают сверхурочно`,
        details: overtimeUsers.map(user => 
          `${user.assignee_username}: ${Math.round((user.totalOvertimeHours || 0) / 60)}ч переработки`
        ),
        action: 'Снизить нагрузку',
        priority: 9
      });
    }
    
    // Сортируем по приоритету и фильтруем отклоненные
    return alerts
      .filter(alert => !dismissedAlerts.has(alert.id))
      .sort((a, b) => b.priority - a.priority);
  }, [userStats, allTasks, workloadBalance, zombieTasks, dismissedAlerts]);
  
  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };
  
  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-amber-500 bg-amber-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };
  
  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };
  
  const visibleNotifications = showAll ? notifications : notifications.slice(0, 5);
  const criticalCount = notifications.filter(n => n.type === 'critical').length;
  const warningCount = notifications.filter(n => n.type === 'warning').length;

  return (
    <CollapsibleWidget
      title={`Умные уведомления${notifications.length > 0 ? ` (${notifications.length})` : ''}`}
      icon={Bell}
      iconColor="text-red-600"
      defaultExpanded={notifications.length > 0}
    >
      <div className="flex items-center justify-between mb-6">
        {notifications.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showAll ? 'Скрыть' : `Показать все (${notifications.length})`}</span>
          </button>
        )}
      </div>
      
      {/* Сводка по типам уведомлений */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Критичные</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{criticalCount}</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Предупреждения</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">{warningCount}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Информация</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{notifications.length - criticalCount - warningCount}</p>
          </div>
        </div>
      )}
      
      {/* Список уведомлений */}
      {visibleNotifications.length > 0 ? (
        <div className="space-y-4">
          {visibleNotifications.map(alert => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      
                      {alert.details && alert.details.length > 0 && (
                        <div className="text-xs text-gray-600 mb-2">
                          {alert.details.map((detail, index) => (
                            <div key={index}>• {detail}</div>
                          ))}
                        </div>
                      )}
                      
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border">
                        💡 {alert.action}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                    title="Скрыть уведомление"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Все отлично! 🎉</h3>
          <p className="text-gray-600">Критических проблем не обнаружено</p>
        </div>
      )}
      
      {/* Настройки уведомлений */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">⚙️ Система мониторинга отслеживает:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• Задачи без движения более 7 дней</div>
          <div>• Перегрузку участников команды</div>
          <div>• Задачи в работе более 2 дней</div>
          <div>• Неназначенные задачи</div>
          <div>• Снижение производительности</div>
          <div>• Превышение рабочего времени</div>
          <div>• Неактивных участников</div>
          <div>• Дисбаланс нагрузки</div>
        </div>
      </div>
    </CollapsibleWidget>
  );
}