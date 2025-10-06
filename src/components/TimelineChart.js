import React from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { TrendingUp, Calendar } from 'lucide-react';
import { formatDuration } from '../utils/dataProcessor';

export function TimelineChart({ userStats, timelineData }) {
  const hasData = timelineData && timelineData.length > 0;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('TimelineChart received data:', timelineData?.length, 'days');
    if (hasData) {
      console.log('Timeline data sample:', timelineData[0]);
    }
  }
  
  const hasCompletedTasks = hasData && timelineData.some(d => d.completedTasks > 0);
  if (process.env.NODE_ENV === 'development') {
    console.log('Has completed tasks:', hasCompletedTasks);
  }
  
  if (!hasData) {
    return (
      <CollapsibleWidget
        title="Временная динамика"
        icon={TrendingUp}
        defaultExpanded={false}
      >
        <div className="text-center py-8 text-gray-500">
          <p>Недостаточно данных для отображения временной динамики</p>
          <p className="text-sm mt-2">Нужны задачи с датами создания, начала или завершения</p>
        </div>
      </CollapsibleWidget>
    );
  }

  const maxTasks = Math.max(...timelineData.map(d => d.totalTasks));
  const maxTime = Math.max(...timelineData.map(d => d.totalTime));
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <CollapsibleWidget
      title={`Временная динамика работы (последние ${timelineData.length} дней)`}
      icon={TrendingUp}
      defaultExpanded={hasCompletedTasks}
    >
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-blue-800 font-medium">Всего задач</p>
          <p className="text-2xl font-bold text-blue-900">
            {timelineData.reduce((sum, d) => sum + d.totalTasks, 0)}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 font-medium">Завершено</p>
          <p className="text-2xl font-bold text-green-900">
            {timelineData.reduce((sum, d) => sum + d.completedTasks, 0)}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-purple-800 font-medium">Общее время</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatDuration(timelineData.reduce((sum, d) => sum + d.totalTime, 0))}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {timelineData.map((day, index) => (
          <div key={day.date} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">{formatDate(day.date)}</span>
              </div>
              <div className="text-gray-600">
                {day.totalTasks} всего • {day.completedTasks} завершено • {formatDuration(day.totalTime)}
              </div>
            </div>
            
            <div className="space-y-1">
              {/* Total tasks bar */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 w-16">Всего</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${maxTasks > 0 ? (day.totalTasks / maxTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8">{day.totalTasks}</span>
              </div>
              
              {/* Completed tasks bar */}
              {day.completedTasks > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">Завершено</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${maxTasks > 0 ? (day.completedTasks / maxTasks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{day.completedTasks}</span>
                </div>
              )}
              
              {/* Time bar */}
              {day.totalTime > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">Время</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${maxTime > 0 ? (day.totalTime / maxTime) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16">{formatDuration(day.totalTime)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {hasData && !hasCompletedTasks && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            <strong>Примечание:</strong> График показывает все задачи по датам. 
            Для отображения времени работы нужны завершенные задачи с указанным временем начала и окончания.
          </p>
        </div>
      )}
    </CollapsibleWidget>
  );
}