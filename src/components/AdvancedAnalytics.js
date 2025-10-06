import React, { useMemo } from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { TrendingUp, TrendingDown, BarChart3, Target, Calendar, Users, Zap, AlertTriangle } from 'lucide-react';
import { StatCard } from './StatCard';
import { formatDuration } from '../utils/dataProcessor';

export function AdvancedAnalytics({ userStats, allTasks, selectedMonth }) {
  const analytics = useMemo(() => {
    if (!allTasks || allTasks.length === 0) {
      return {
        velocity: { weekly: 0, monthly: 0, avgPerWeek: 0 },
        burndown: { completed: 0, remaining: 0, rate: 0 },
        blockers: [],
        quality: 0,
        forecast: { weeksToComplete: 0, estimatedDate: 'Не определено' },
        trend: { value: 0, direction: 'stable' }
      };
    }

    // Velocity - задач в неделю/месяц
    // Используем более гибкую логику для определения завершенных задач
    const completedTasks = allTasks.filter(task => {
      // Задача завершена если есть время окончания ИЛИ если isCompleted = true
      return (task.time_end && task.time_end.trim() !== '') || 
             task.isCompleted === true ||
             (task.time_start && task.time_start.trim() !== '' && task.time_end && task.time_end.trim() !== '');
    });
    
    console.log('Total tasks:', allTasks.length);
    console.log('Completed tasks found:', completedTasks.length);
    console.log('Sample completed task:', completedTasks[0]);
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const tasksThisWeek = completedTasks.filter(task => {
      // Используем время окончания или время начала для определения даты
      const dateToCheck = task.time_end || task.time_start || task.createTask;
      if (!dateToCheck) return false;
      
      try {
        // Пробуем разные форматы дат
        let endDate;
        if (dateToCheck.includes(' ')) {
          endDate = new Date(dateToCheck);
        } else if (dateToCheck.includes(':')) {
          // Если только время, используем сегодняшнюю дату
          const today = new Date().toISOString().split('T')[0];
          endDate = new Date(`${today} ${dateToCheck}`);
        } else {
          endDate = new Date(dateToCheck);
        }
        
        return !isNaN(endDate.getTime()) && endDate >= oneWeekAgo;
      } catch (e) {
        console.log('Error parsing date for task:', task.taskid, dateToCheck, e);
        return false;
      }
    }).length;
    
    const tasksThisMonth = completedTasks.filter(task => {
      const dateToCheck = task.time_end || task.time_start || task.createTask;
      if (!dateToCheck) return false;
      
      try {
        let endDate;
        if (dateToCheck.includes(' ')) {
          endDate = new Date(dateToCheck);
        } else if (dateToCheck.includes(':')) {
          const today = new Date().toISOString().split('T')[0];
          endDate = new Date(`${today} ${dateToCheck}`);
        } else {
          endDate = new Date(dateToCheck);
        }
        
        return !isNaN(endDate.getTime()) && endDate >= oneMonthAgo;
      } catch (e) {
        return false;
      }
    }).length;
    
    console.log('Tasks this week:', tasksThisWeek);
    console.log('Tasks this month:', tasksThisMonth);
    
    // Burndown - оставшиеся задачи
    const totalTasks = allTasks.length;
    const remainingTasks = allTasks.filter(task => {
      return !(task.time_end && task.time_end.trim() !== '') && 
             !task.isCompleted &&
             !(task.time_start && task.time_start.trim() !== '' && task.time_end && task.time_end.trim() !== '');
    }).length;
    
    const burndownRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    console.log('Burndown - Total:', totalTasks, 'Completed:', completedTasks.length, 'Remaining:', remainingTasks, 'Rate:', burndownRate);
    
    // Анализ блокеров - долгие задачи в работе
    const blockedTasks = allTasks.filter(task => {
      // Задача заблокирована если начата но не завершена и висит долго
      if (!task.time_start || task.time_start.trim() === '') return false;
      if (task.time_end && task.time_end.trim() !== '') return false;
      
      try {
        let startDate;
        if (task.time_start.includes(' ')) {
          startDate = new Date(task.time_start);
        } else if (task.time_start.includes(':')) {
          const baseDate = task.createTask ? task.createTask.split(' ')[0] : new Date().toISOString().split('T')[0];
          startDate = new Date(`${baseDate} ${task.time_start}`);
        } else {
          startDate = new Date(task.time_start);
        }
        
        if (isNaN(startDate.getTime())) return false;
        const hoursDiff = (now - startDate) / (1000 * 60 * 60);
        return hoursDiff > 48; // более 48 часов в работе
      } catch (e) {
        return false;
      }
    });
    
    // Метрики качества - быстрые vs долгие задачи
    const qualityScore = completedTasks.length > 0 
      ? (completedTasks.filter(task => (task.duration || 0) <= 120).length / completedTasks.length) * 100 
      : 0;
    
    // Прогноз завершения
    const avgTasksPerWeek = tasksThisMonth / 4;
    const weeksToComplete = avgTasksPerWeek > 0 ? Math.ceil(remainingTasks / avgTasksPerWeek) : 0;
    
    // Тренд производительности
    const lastWeekTasks = completedTasks.filter(task => {
      const dateToCheck = task.time_end || task.time_start || task.createTask;
      if (!dateToCheck) return false;
      
      try {
        let endDate;
        if (dateToCheck.includes(' ')) {
          endDate = new Date(dateToCheck);
        } else if (dateToCheck.includes(':')) {
          const today = new Date().toISOString().split('T')[0];
          endDate = new Date(`${today} ${dateToCheck}`);
        } else {
          endDate = new Date(dateToCheck);
        }
        
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        return !isNaN(endDate.getTime()) && endDate >= twoWeeksAgo && endDate < oneWeekAgo;
      } catch (e) {
        return false;
      }
    }).length;
    
    const productivityTrend = lastWeekTasks > 0 
      ? ((tasksThisWeek - lastWeekTasks) / lastWeekTasks) * 100 
      : tasksThisWeek > 0 ? 100 : 0;
    
    console.log('Final analytics:', {
      completedTasks: completedTasks.length,
      tasksThisWeek,
      tasksThisMonth,
      burndownRate,
      qualityScore,
      blockedTasks: blockedTasks.length
    });
    
    return {
      velocity: {
        weekly: tasksThisWeek,
        monthly: tasksThisMonth,
        avgPerWeek: Math.round(avgTasksPerWeek * 10) / 10
      },
      burndown: {
        completed: completedTasks.length,
        remaining: remainingTasks,
        rate: Math.round(burndownRate)
      },
      blockers: blockedTasks,
      quality: Math.round(qualityScore),
      forecast: {
        weeksToComplete,
        estimatedDate: weeksToComplete > 0 
          ? new Date(now.getTime() + weeksToComplete * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')
          : 'Не определено'
      },
      trend: {
        value: Math.round(productivityTrend),
        direction: productivityTrend > 0 ? 'up' : productivityTrend < 0 ? 'down' : 'stable'
      }
    };
  }, [userStats, allTasks]);

  return (
    <CollapsibleWidget
      title="Расширенная аналитика"
      icon={BarChart3}
      iconColor="text-purple-600"
      defaultExpanded={true}
    >
      
      {/* Velocity и Burndown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Velocity (неделя)"
          value={analytics.velocity.weekly}
          subtitle="задач завершено"
          icon={Zap}
          color="green"
        />
        
        <StatCard
          title="Velocity (месяц)"
          value={analytics.velocity.monthly}
          subtitle={`~${analytics.velocity.avgPerWeek}/неделю`}
          icon={TrendingUp}
          color="blue"
        />
        
        <StatCard
          title="Burndown прогресс"
          value={`${analytics.burndown.rate}%`}
          subtitle={`${analytics.burndown.remaining} осталось`}
          icon={Target}
          color={analytics.burndown.rate > 70 ? 'green' : analytics.burndown.rate > 40 ? 'amber' : 'red'}
        />
        
        <StatCard
          title="Тренд продуктивности"
          value={`${analytics.trend.value > 0 ? '+' : ''}${analytics.trend.value}%`}
          subtitle="к прошлой неделе"
          icon={analytics.trend.direction === 'up' ? TrendingUp : TrendingDown}
          color={analytics.trend.direction === 'up' ? 'green' : analytics.trend.direction === 'down' ? 'red' : 'amber'}
        />
      </div>
      
      {/* Качество и прогнозы */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Индекс качества"
          value={`${analytics.quality}%`}
          subtitle="быстрых задач (≤2ч)"
          icon={Target}
          color={analytics.quality > 60 ? 'green' : analytics.quality > 30 ? 'amber' : 'red'}
        />
        
        <StatCard
          title="Прогноз завершения"
          value={analytics.forecast.weeksToComplete > 0 ? `${analytics.forecast.weeksToComplete} нед` : 'Готово'}
          subtitle={analytics.forecast.estimatedDate}
          icon={Calendar}
          color={analytics.forecast.weeksToComplete > 8 ? 'red' : analytics.forecast.weeksToComplete > 4 ? 'amber' : 'green'}
        />
        
        <StatCard
          title="Заблокированные задачи"
          value={analytics.blockers.length}
          subtitle="долго в работе"
          icon={AlertTriangle}
          color={analytics.blockers.length > 3 ? 'red' : analytics.blockers.length > 0 ? 'amber' : 'green'}
        />
      </div>
      
      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Burndown Chart</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Завершено</span>
              <span className="font-medium">{analytics.burndown.completed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${analytics.burndown.rate}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Осталось: {analytics.burndown.remaining}</span>
              <span>{analytics.burndown.rate}%</span>
            </div>
          </div>
        </div>
        
        {/* Velocity Trend */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Velocity Trend</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Эта неделя</span>
              <span className="font-medium text-green-600">{analytics.velocity.weekly} задач</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Средняя в месяц</span>
              <span className="font-medium text-blue-600">{analytics.velocity.avgPerWeek}/нед</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Изменение</span>
              <span className={`font-medium flex items-center ${
                analytics.trend.direction === 'up' ? 'text-green-600' : 
                analytics.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.trend.direction === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                 analytics.trend.direction === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
                {analytics.trend.value > 0 ? '+' : ''}{analytics.trend.value}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Заблокированные задачи */}
      {analytics.blockers.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-900 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Заблокированные задачи ({analytics.blockers.length})
          </h4>
          <div className="space-y-2">
            {analytics.blockers.slice(0, 5).map(task => (
              <div key={task.taskid} className="text-sm text-red-800 bg-red-100 rounded px-3 py-2">
                <span className="font-medium">#{task.taskid}</span>
                <span className="mx-2">-</span>
                <span>{task.title}</span>
                <span className="text-red-600 ml-2">
                  ({task.assignee_username || 'Не назначен'})
                </span>
              </div>
            ))}
            {analytics.blockers.length > 5 && (
              <p className="text-sm text-red-600">И еще {analytics.blockers.length - 5} задач...</p>
            )}
          </div>
        </div>
      )}
      
      {/* Рекомендации */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">💡 Аналитические инсайты:</h4>
        <div className="space-y-2 text-sm text-blue-800">
          {analytics.trend.direction === 'up' && (
            <p>✅ Отличная динамика! Продуктивность растет на {analytics.trend.value}%</p>
          )}
          {analytics.trend.direction === 'down' && (
            <p>⚠️ Продуктивность снижается на {Math.abs(analytics.trend.value)}%. Стоит проанализировать причины</p>
          )}
          {analytics.quality < 50 && (
            <p>🎯 Много долгих задач. Рассмотрите декомпозицию крупных задач</p>
          )}
          {analytics.forecast.weeksToComplete > 8 && (
            <p>📅 Текущие задачи завершатся через {analytics.forecast.weeksToComplete} недель. Возможно нужны дополнительные ресурсы</p>
          )}
          {analytics.blockers.length > 0 && (
            <p>🚫 {analytics.blockers.length} задач заблокированы. Требуется вмешательство</p>
          )}
          {analytics.velocity.weekly === 0 && (
            <p>⏸️ На этой неделе не завершено ни одной задачи. Проверьте нагрузку команды</p>
          )}
          {analytics.velocity.weekly === 0 && analytics.velocity.monthly === 0 && analytics.blockers.length === 0 && (
            <p>📊 Система готова к анализу. Добавьте больше данных для получения детальной аналитики</p>
          )}
        </div>
      </div>
    </CollapsibleWidget>
  );
}