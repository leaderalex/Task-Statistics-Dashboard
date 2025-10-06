import React from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { TrendingUp, Target, Zap, AlertTriangle, Award, Clock, XCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { formatDuration } from '../utils/dataProcessor';

export function ProductivityMetrics({ userStats, allTasks }) {
  // Calculate advanced metrics
  const calculateMetrics = () => {
    const activeUsers = userStats.filter(user => user.completedTasks > 0);
    
    // Response time (from creation to start)
    const tasksWithResponseTime = allTasks.filter(task => 
      task.createTask && task.time_start && task.time_start.trim() !== ''
    );
    
    const responseTimes = tasksWithResponseTime.map(task => {
      const created = new Date(task.createTask);
      const started = new Date(task.time_start.includes(' ') ? task.time_start : `${task.createTask.split(' ')[0]} ${task.time_start}`);
      return Math.max(0, (started - created) / (1000 * 60)); // minutes
    });
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Efficiency coefficient
    const completedTasks = allTasks.filter(task => task.time_end && task.time_end.trim() !== '');
    const totalWorkTime = completedTasks.reduce((sum, task) => {
      const duration = task.duration || 0;
      return sum + duration;
    }, 0);
    
    const avgTaskTime = completedTasks.length > 0 ? totalWorkTime / completedTasks.length : 0;
    
    // Incomplete tasks
    const incompleteTasks = allTasks.filter(task => 
      !task.time_end || task.time_end.trim() === ''
    );
    
    // Load balance
    let loadBalance = 100; // Default value for single user or no users
    const taskCounts = activeUsers.map(user => user.totalTasks);
    if (taskCounts.length > 1) {
      const maxTasks = Math.max(...taskCounts);
      const minTasks = Math.min(...taskCounts);
      const avgTasks = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length;
      
      // Use coefficient of variation for better balance calculation
      const variance = taskCounts.reduce((sum, count) => sum + Math.pow(count - avgTasks, 2), 0) / taskCounts.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = avgTasks > 0 ? standardDeviation / avgTasks : 0;
      
      loadBalance = Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
    }
    
    // Peak hours analysis
    const hourlyActivity = {};
    completedTasks.forEach(task => {
      if (task.time_start && task.time_start.includes(':')) {
        const hour = parseInt(task.time_start.split(':')[0]);
        if (hour >= 9 && hour <= 23) {
          hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
        }
      }
    });
    
    const peakHour = Object.entries(hourlyActivity).reduce((peak, [hour, count]) => 
      count > (hourlyActivity[peak] || 0) ? hour : peak, '9'
    );
    
    // Quality metrics
    const quickTasksRatio = completedTasks.filter(task => (task.duration || 0) <= 30).length / completedTasks.length * 100;
    const longTasksRatio = completedTasks.filter(task => (task.duration || 0) > 300).length / completedTasks.length * 100;
    
    // Team efficiency
    const workingHoursPerDay = 8 * 60; // 8 hours in minutes
    const workingDays = Math.max(1, Math.ceil(totalWorkTime / (activeUsers.length * workingHoursPerDay)));
    const teamEfficiency = Math.min(100, (totalWorkTime / (activeUsers.length * workingDays * workingHoursPerDay)) * 100);
    
    return {
      avgResponseTime,
      avgTaskTime,
      incompleteTasks: incompleteTasks.length,
      loadBalance,
      peakHour,
      quickTasksRatio,
      longTasksRatio,
      totalEfficiency: teamEfficiency
    };
  };

  const metrics = calculateMetrics();

  return (
    <CollapsibleWidget
      title="Метрики продуктивности"
      icon={Target}
      iconColor="text-purple-600"
      defaultExpanded={true}
    >
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Среднее время реакции"
          value={metrics.avgResponseTime > 0 ? formatDuration(Math.round(metrics.avgResponseTime)) : 'Нет данных'}
          subtitle="От создания до начала"
          icon={Clock}
          color={metrics.avgResponseTime > 120 ? 'red' : metrics.avgResponseTime > 60 ? 'amber' : 'green'}
        />
        
        <StatCard
          title="Среднее время задачи"
          value={metrics.avgTaskTime > 0 ? formatDuration(Math.round(metrics.avgTaskTime)) : 'Нет данных'}
          subtitle="Для завершенных задач"
          icon={TrendingUp}
          color="blue"
        />
        
        <StatCard
          title="Незавершенные задачи"
          value={metrics.incompleteTasks}
          subtitle="Требуют внимания"
          icon={XCircle}
          color={metrics.incompleteTasks > 10 ? 'red' : metrics.incompleteTasks > 5 ? 'amber' : 'green'}
        />
        
        <StatCard
          title="Баланс нагрузки"
          value={`${Math.round(metrics.loadBalance)}%`}
          subtitle="Равномерность распределения"
          icon={Target}
          color={metrics.loadBalance > 80 ? 'green' : metrics.loadBalance > 60 ? 'amber' : 'red'}
        />
        
        <StatCard
          title="Пиковый час"
          value={`${metrics.peakHour}:00`}
          subtitle="Максимальная активность"
          icon={TrendingUp}
          color="purple"
        />
        
        <StatCard
          title="Быстрые задачи"
          value={`${Math.round(metrics.quickTasksRatio)}%`}
          subtitle="≤30 минут"
          icon={Zap}
          color="green"
        />
        
        <StatCard
          title="Долгие задачи"
          value={`${Math.round(metrics.longTasksRatio)}%`}
          subtitle=">5 часов"
          icon={AlertTriangle}
          color={metrics.longTasksRatio > 20 ? 'red' : metrics.longTasksRatio > 10 ? 'amber' : 'green'}
        />
        
        <StatCard
          title="Общая эффективность"
          value={metrics.totalEfficiency > 0 ? `${Math.round(Math.min(100, metrics.totalEfficiency))}%` : 'Нет данных'}
          subtitle="Использование рабочего времени"
          icon={Award}
          color={metrics.totalEfficiency > 70 ? 'green' : metrics.totalEfficiency > 50 ? 'amber' : 'red'}
        />
      </div>
      
      {/* Performance Summary */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">Сводка по производительности:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Скорость реакции:</span>
            <p className={`text-lg font-bold ${metrics.avgResponseTime === 0 ? 'text-gray-600' : metrics.avgResponseTime > 120 ? 'text-red-600' : metrics.avgResponseTime > 60 ? 'text-amber-600' : 'text-green-600'}`}>
              {metrics.avgResponseTime === 0 ? 'Нет данных' : metrics.avgResponseTime > 120 ? 'Медленная' : metrics.avgResponseTime > 60 ? 'Средняя' : 'Быстрая'}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Качество задач:</span>
            <p className={`text-lg font-bold ${metrics.quickTasksRatio > 50 ? 'text-green-600' : metrics.quickTasksRatio > 30 ? 'text-amber-600' : 'text-red-600'}`}>
              {metrics.quickTasksRatio > 50 ? 'Отличное' : metrics.quickTasksRatio > 30 ? 'Хорошее' : 'Требует улучшения'}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Баланс команды:</span>
            <p className={`text-lg font-bold ${metrics.loadBalance > 80 ? 'text-green-600' : metrics.loadBalance > 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {metrics.loadBalance > 80 ? 'Отличный' : metrics.loadBalance > 60 ? 'Хороший' : 'Неравномерный'}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Общая оценка:</span>
            <p className={`text-lg font-bold ${metrics.totalEfficiency === 0 ? 'text-gray-600' : metrics.totalEfficiency > 70 ? 'text-green-600' : metrics.totalEfficiency > 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {metrics.totalEfficiency === 0 ? 'Нет данных' : metrics.totalEfficiency > 70 ? 'Высокая' : metrics.totalEfficiency > 50 ? 'Средняя' : 'Низкая'}
            </p>
          </div>
        </div>
      </div>
    </CollapsibleWidget>
  );
}