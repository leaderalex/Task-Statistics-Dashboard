import React from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { AlertTriangle, Clock, Users, TrendingDown, Zap, CheckCircle } from 'lucide-react';

export function AlertsMonitoring({ zombieTasks, workloadBalance, productivityInsights }) {
  const alerts = [];
  
  // Zombie tasks alert
  if (zombieTasks && zombieTasks.length > 0) {
    alerts.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Задачи-зомби обнаружены',
      description: `${zombieTasks.length} задач висят без движения более 7 дней`,
      action: 'Проверить и переназначить'
    });
  }
  
  // Workload imbalance alert
  if (workloadBalance && workloadBalance.balanceScore < 70) {
    alerts.push({
      type: 'warning',
      icon: Users,
      title: 'Дисбаланс нагрузки',
      description: `Неравномерное распределение задач (баланс: ${workloadBalance.balanceScore}%)`,
      action: 'Перераспределить задачи'
    });
  }
  
  // Overloaded users alert
  if (workloadBalance && workloadBalance.overloaded && workloadBalance.overloaded.length > 0) {
    alerts.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Перегруженные исполнители',
      description: `${workloadBalance.overloaded.length} пользователей имеют более 2 активных задач`,
      action: 'Снизить нагрузку'
    });
  }
  
  // Underloaded users alert
  if (workloadBalance && workloadBalance.underloaded && workloadBalance.underloaded.length > 0) {
    const underloadedUsersList = workloadBalance.underloaded.map(u => u.username).join(', ');
    alerts.push({
      type: 'info',
      icon: Clock,
      title: 'Недогруженные исполнители',
      description: `${workloadBalance.underloaded.length} пользователей имеют мало активных задач: ${underloadedUsersList}`,
      action: 'Можно добавить задач'
    });
  }
  
  // Add productivity insights as alerts
  if (productivityInsights && productivityInsights.length > 0) {
    productivityInsights.forEach(insight => {
      alerts.push({
        type: insight.type === 'success' ? 'info' : 'warning',
        icon: insight.type === 'success' ? CheckCircle : Clock,
        title: insight.title,
        description: insight.description,
        action: insight.type === 'success' ? 'Отлично!' : 'Требует внимания'
      });
    });
  }

  if (alerts.length === 0) {
    return (
      <CollapsibleWidget
        title="Мониторинг и алерты"
        icon={CheckCircle}
        iconColor="text-green-600"
        defaultExpanded={false}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Все в порядке!</h3>
          <p className="text-gray-600">Критических проблем не обнаружено</p>
        </div>
      </CollapsibleWidget>
    );
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-amber-200 bg-amber-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'info': return 'text-blue-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <CollapsibleWidget
      title={`Мониторинг и алерты (${alerts.length})`}
      icon={AlertTriangle}
      iconColor="text-red-600"
      defaultExpanded={alerts.length > 0}
    >
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
            <div className="flex items-start space-x-3">
              <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border">
                  {alert.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Workload Balance Summary */}
      {workloadBalance && workloadBalance.totalActiveUsers > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Анализ нагрузки команды:</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Активных пользователей:</span>
              <p className="text-lg font-bold text-blue-600">{workloadBalance.totalActiveUsers}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Средняя нагрузка:</span>
              <p className="text-lg font-bold text-blue-600">{workloadBalance.avgActive} задач</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Максимум задач:</span>
              <p className="text-lg font-bold text-blue-600">{workloadBalance.maxActive}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Баланс нагрузки:</span>
              <p className={`text-lg font-bold ${workloadBalance.balanceScore > 80 ? 'text-green-600' : workloadBalance.balanceScore > 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {workloadBalance.balanceScore}%
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed zombie tasks */}
      {zombieTasks && zombieTasks.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-900 mb-3">Задачи-зомби:</h4>
          <div className="space-y-2">
            {zombieTasks.slice(0, 5).map(task => (
              <div key={task.taskid} className="text-sm text-red-800">
                <span className="font-medium">#{task.taskid}</span> - {task.title}
                <span className="text-red-600 ml-2">
                  ({task.assignee_username || 'Не назначен'})
                </span>
              </div>
            ))}
            {zombieTasks.length > 5 && (
              <p className="text-sm text-red-600">
                И еще {zombieTasks.length - 5} задач...
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Overloaded users details */}
      {workloadBalance && workloadBalance.overloaded && workloadBalance.overloaded.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-900 mb-3">Перегруженные пользователи:</h4>
          <div className="space-y-4">
            {workloadBalance.overloaded.map(user => (
              <div key={user.username} className="border-l-4 border-amber-400 pl-4">
                <div className="text-sm text-amber-800 mb-2">
                  <span className="font-medium">{user.username}</span>
                  <span className="text-amber-600 ml-2">
                    - {user.activeTasks} активных задач
                  </span>
                </div>
                {user.tasks && user.tasks.length > 0 && (
                  <div className="space-y-1">
                    {user.tasks.map(task => (
                      <div key={task.taskid} className="text-xs text-amber-700 bg-amber-100 rounded px-2 py-1">
                        <span className="font-medium">#{task.taskid}</span>
                        {task.task_identifier && (
                          <span className="text-amber-600 ml-1">({task.task_identifier})</span>
                        )}
                        <span className="ml-2">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Underloaded users details */}
      {workloadBalance && workloadBalance.underloaded && workloadBalance.underloaded.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Недогруженные пользователи:</h4>
          <div className="space-y-4">
            {workloadBalance.underloaded.map(user => (
              <div key={user.username} className="border-l-4 border-blue-400 pl-4">
                <div className="text-sm text-blue-800 mb-2">
                  <span className="font-medium">{user.username}</span>
                  <span className="text-blue-600 ml-2">
                    - {user.activeTasks} активных задач
                  </span>
                </div>
                {user.tasks && user.tasks.length > 0 && (
                  <div className="space-y-1">
                    {user.tasks.map(task => (
                      <div key={task.taskid} className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                        <span className="font-medium">#{task.taskid}</span>
                        {task.task_identifier && (
                          <span className="text-blue-600 ml-1">({task.task_identifier})</span>
                        )}
                        <span className="ml-2">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productivity insights */}
      {productivityInsights && productivityInsights.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Инсайты продуктивности:</h4>
          <div className="space-y-2">
            {productivityInsights.map((insight, index) => (
              <div key={index} className={`text-sm ${insight.type === 'success' ? 'text-green-800' : 'text-amber-800'}`}>
                <span className="font-medium">{insight.title}:</span>
                <span className="ml-2">{insight.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {(alerts.length > 0 || 
        (workloadBalance && (workloadBalance.balanceScore < 70 || 
         (workloadBalance.overloaded && workloadBalance.overloaded.length > 0) ||
         (workloadBalance.underloaded && workloadBalance.underloaded.length > 0))) ||
        (zombieTasks && zombieTasks.length > 0)) && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Рекомендации по оптимизации:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {workloadBalance && workloadBalance.balanceScore < 70 && (
              <p>• Рассмотрите перераспределение задач для улучшения баланса нагрузки</p>
            )}
            {zombieTasks && zombieTasks.length > 0 && (
              <p>• Проверьте задачи-зомби и переназначьте их активным исполнителям</p>
            )}
            {workloadBalance && workloadBalance.overloaded && workloadBalance.overloaded.length > 0 && (
              <p>• Снизьте нагрузку на перегруженных исполнителей</p>
            )}
            {workloadBalance && workloadBalance.underloaded && workloadBalance.underloaded.length > 0 && (
              <p>• Используйте свободные ресурсы недогруженных исполнителей</p>
            )}
            {productivityInsights && productivityInsights.some(insight => insight.type === 'warning') && (
              <p>• Обратите внимание на пользователей с большим количеством переработок</p>
            )}
            {workloadBalance && workloadBalance.balanceScore >= 70 && 
             (!zombieTasks || zombieTasks.length === 0) && 
             (!workloadBalance.overloaded || workloadBalance.overloaded.length === 0) && 
             (!workloadBalance.underloaded || workloadBalance.underloaded.length === 0) && (
              <p>• Команда работает эффективно, продолжайте в том же духе!</p>
            )}
          </div>
        </div>
      )}
    </CollapsibleWidget>
  );
}