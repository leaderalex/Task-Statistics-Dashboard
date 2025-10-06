import React, { useMemo } from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { TrendingUp, AlertTriangle, Users, Calendar, Target, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { formatDuration } from '../utils/dataProcessor';

export function WorkloadForecast({ userStats, allTasks }) {
  const forecast = useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    // Анализ текущей нагрузки
    const currentWorkload = userStats.map(user => {
      const currentTasks = user.currentTasks?.length || 0;
      const avgTaskTime = user.averageTaskTime || 120; // 2 часа по умолчанию
      const estimatedHours = currentTasks * (avgTaskTime / 60);
      
      // Прогноз capacity на основе исторических данных
      const weeklyCapacity = user.completedTasks > 0 
        ? Math.max(5, Math.ceil(user.completedTasks / 4)) // примерно задач в неделю
        : 5;
      
      const weeklyHours = weeklyCapacity * (avgTaskTime / 60);
      const utilizationRate = weeklyHours > 0 ? (estimatedHours / weeklyHours) * 100 : 0;
      
      return {
        username: user.assignee_username,
        currentTasks,
        estimatedHours: Math.round(estimatedHours * 10) / 10,
        weeklyCapacity,
        weeklyHours: Math.round(weeklyHours * 10) / 10,
        utilizationRate: Math.round(utilizationRate),
        riskLevel: utilizationRate > 100 ? 'high' : utilizationRate > 80 ? 'medium' : 'low'
      };
    });
    
    // Прогноз перегрузок
    const overloadRisks = currentWorkload.filter(user => user.riskLevel === 'high');
    const mediumRisks = currentWorkload.filter(user => user.riskLevel === 'medium');
    
    // Анализ трендов
    const completedLastWeek = allTasks.filter(task => {
      if (!task.time_end) return false;
      const endDate = new Date(task.time_end);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return endDate >= weekAgo;
    }).length;
    
    const completedTwoWeeksAgo = allTasks.filter(task => {
      if (!task.time_end) return false;
      const endDate = new Date(task.time_end);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return endDate >= twoWeeksAgo && endDate < weekAgo;
    }).length;
    
    const velocityTrend = completedTwoWeeksAgo > 0 
      ? ((completedLastWeek - completedTwoWeeksAgo) / completedTwoWeeksAgo) * 100 
      : 0;
    
    // Прогноз завершения текущих задач
    const totalCurrentTasks = currentWorkload.reduce((sum, user) => sum + user.currentTasks, 0);
    const avgVelocity = Math.max(1, (completedLastWeek + completedTwoWeeksAgo) / 2);
    const estimatedWeeksToComplete = totalCurrentTasks > 0 ? Math.ceil(totalCurrentTasks / avgVelocity) : 0;
    
    // Рекомендации по распределению
    const availableCapacity = currentWorkload
      .filter(user => user.riskLevel === 'low')
      .reduce((sum, user) => sum + Math.max(0, user.weeklyCapacity - user.currentTasks), 0);
    
    const excessLoad = currentWorkload
      .filter(user => user.riskLevel === 'high')
      .reduce((sum, user) => sum + Math.max(0, user.currentTasks - user.weeklyCapacity), 0);
    
    return {
      currentWorkload: currentWorkload.sort((a, b) => b.utilizationRate - a.utilizationRate),
      risks: {
        high: overloadRisks,
        medium: mediumRisks,
        total: overloadRisks.length + mediumRisks.length
      },
      trends: {
        velocity: completedLastWeek,
        change: Math.round(velocityTrend),
        direction: velocityTrend > 0 ? 'up' : velocityTrend < 0 ? 'down' : 'stable'
      },
      forecast: {
        weeksToComplete: estimatedWeeksToComplete,
        completionDate: estimatedWeeksToComplete > 0 
          ? new Date(now.getTime() + estimatedWeeksToComplete * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')
          : 'Скоро',
        totalCurrentTasks
      },
      rebalancing: {
        availableCapacity,
        excessLoad,
        canRebalance: availableCapacity >= excessLoad
      }
    };
  }, [userStats, allTasks]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Неизвестно';
    }
  };

  return (
    <CollapsibleWidget
      title="Прогноз нагрузки и предупреждения"
      icon={TrendingUp}
      iconColor="text-orange-600"
      defaultExpanded={forecast.risks.total > 0}
    >
      
      {/* Общие метрики прогноза */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Риск перегрузки"
          value={forecast.risks.total}
          subtitle="участников в зоне риска"
          icon={AlertTriangle}
          color={forecast.risks.high.length > 0 ? 'red' : forecast.risks.medium.length > 0 ? 'amber' : 'green'}
        />
        
        <StatCard
          title="Текущая velocity"
          value={forecast.trends.velocity}
          subtitle={`${forecast.trends.change > 0 ? '+' : ''}${forecast.trends.change}% к пред. неделе`}
          icon={TrendingUp}
          color={forecast.trends.direction === 'up' ? 'green' : forecast.trends.direction === 'down' ? 'red' : 'amber'}
        />
        
        <StatCard
          title="Прогноз завершения"
          value={forecast.forecast.weeksToComplete > 0 ? `${forecast.forecast.weeksToComplete} нед` : 'Скоро'}
          subtitle={forecast.forecast.completionDate}
          icon={Calendar}
          color={forecast.forecast.weeksToComplete > 6 ? 'red' : forecast.forecast.weeksToComplete > 3 ? 'amber' : 'green'}
        />
        
        <StatCard
          title="Возможность ребаланса"
          value={forecast.rebalancing.canRebalance ? 'Да' : 'Нет'}
          subtitle={`${forecast.rebalancing.availableCapacity} свободных слотов`}
          icon={Users}
          color={forecast.rebalancing.canRebalance ? 'green' : 'red'}
        />
      </div>
      
      {/* Детальный прогноз по участникам */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Прогноз нагрузки по участникам</h3>
        <div className="space-y-3">
          {forecast.currentWorkload.map(user => (
            <div key={user.username} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{user.username}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(user.riskLevel)}`}>
                    {getRiskLabel(user.riskLevel)} риск
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{user.utilizationRate}%</div>
                  <div className="text-xs text-gray-500">загрузки</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Текущие задачи:</span>
                  <div className="font-medium">{user.currentTasks}</div>
                </div>
                <div>
                  <span className="text-gray-600">Оценка времени:</span>
                  <div className="font-medium">{user.estimatedHours}ч</div>
                </div>
                <div>
                  <span className="text-gray-600">Недельная capacity:</span>
                  <div className="font-medium">{user.weeklyCapacity} задач</div>
                </div>
                <div>
                  <span className="text-gray-600">Недельные часы:</span>
                  <div className="font-medium">{user.weeklyHours}ч</div>
                </div>
              </div>
              
              {/* Прогресс бар загрузки */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Загрузка</span>
                  <span>{user.utilizationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      user.riskLevel === 'high' ? 'bg-red-500' :
                      user.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, user.utilizationRate)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Предупреждения о рисках */}
      {(forecast.risks.high.length > 0 || forecast.risks.medium.length > 0) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Предупреждения о перегрузке</h3>
          
          {forecast.risks.high.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Критический риск перегрузки ({forecast.risks.high.length})
              </h4>
              <div className="space-y-2">
                {forecast.risks.high.map(user => (
                  <div key={user.username} className="text-sm text-red-800 bg-red-100 rounded px-3 py-2">
                    <span className="font-medium">{user.username}</span>
                    <span className="mx-2">-</span>
                    <span>{user.utilizationRate}% загрузки ({user.currentTasks} задач, ~{user.estimatedHours}ч)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {forecast.risks.medium.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Средний риск перегрузки ({forecast.risks.medium.length})
              </h4>
              <div className="space-y-2">
                {forecast.risks.medium.map(user => (
                  <div key={user.username} className="text-sm text-amber-800 bg-amber-100 rounded px-3 py-2">
                    <span className="font-medium">{user.username}</span>
                    <span className="mx-2">-</span>
                    <span>{user.utilizationRate}% загрузки ({user.currentTasks} задач, ~{user.estimatedHours}ч)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Рекомендации по ребалансировке */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">🎯 Рекомендации по оптимизации нагрузки:</h4>
        <div className="space-y-2 text-sm text-blue-800">
          {forecast.risks.high.length > 0 && (
            <p>🚨 <strong>Критично:</strong> {forecast.risks.high.length} участников перегружены. Необходимо срочное перераспределение задач</p>
          )}
          
          {forecast.rebalancing.canRebalance ? (
            <p>✅ <strong>Хорошие новости:</strong> Есть {forecast.rebalancing.availableCapacity} свободных слотов для перераспределения {forecast.rebalancing.excessLoad} избыточных задач</p>
          ) : forecast.rebalancing.excessLoad > 0 ? (
            <p>⚠️ <strong>Внимание:</strong> Избыток нагрузки ({forecast.rebalancing.excessLoad} задач) превышает доступную capacity. Рассмотрите привлечение дополнительных ресурсов</p>
          ) : null}
          
          {forecast.trends.direction === 'down' && (
            <p>📉 <strong>Тренд:</strong> Velocity снижается на {Math.abs(forecast.trends.change)}%. Проанализируйте блокеры</p>
          )}
          
          {forecast.forecast.weeksToComplete > 6 && (
            <p>📅 <strong>Прогноз:</strong> Текущие задачи завершатся через {forecast.forecast.weeksToComplete} недель. Возможно, стоит пересмотреть приоритеты</p>
          )}
          
          {forecast.currentWorkload.filter(u => u.riskLevel === 'low').length > 0 && (
            <p>💡 <strong>Возможности:</strong> Участники с низкой загрузкой могут взять дополнительные задачи: {
              forecast.currentWorkload.filter(u => u.riskLevel === 'low').map(u => u.username).join(', ')
            }</p>
          )}
          
          {forecast.risks.total === 0 && (
            <p>🎉 <strong>Отлично:</strong> Нагрузка команды сбалансирована. Продолжайте в том же духе!</p>
          )}
        </div>
      </div>
    </CollapsibleWidget>
  );
}