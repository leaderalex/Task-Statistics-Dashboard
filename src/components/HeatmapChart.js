import React from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { Activity } from 'lucide-react';

export function HeatmapChart({ heatmapData }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 9); // 9:00 to 23:00
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  if (process.env.NODE_ENV === 'development') {
    console.log('HeatmapChart received data:', heatmapData);
  }
  
  if (!heatmapData || !Array.isArray(heatmapData) || heatmapData.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('No heatmap data available');
    }
    return (
      <CollapsibleWidget
        title="Тепловая карта активности"
        icon={Activity}
        iconColor="text-purple-600"
        defaultExpanded={false}
      >
        <div className="text-center py-8 text-gray-500">
          <p>Недостаточно данных для отображения тепловой карты</p>
        </div>
      </CollapsibleWidget>
    );
  }

  // Calculate max activity from the 2D array
  const maxActivity = Math.max(
    ...heatmapData.flat().map(cell => cell?.count || 0)
  );
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Max activity:', maxActivity);
  }
  
  // If no activity, show message
  if (maxActivity === 0) {
    return (
      <CollapsibleWidget
        title="Тепловая карта активности команды"
        icon={Activity}
        iconColor="text-purple-600"
        defaultExpanded={false}
      >
        <div className="text-center py-8 text-gray-500">
          <p>Нет активности для отображения</p>
          <p className="text-sm mt-2">Нужны завершенные задачи с временем начала</p>
        </div>
      </CollapsibleWidget>
    );
  }

  const getIntensity = (count) => {
    if (!count || count === 0) return 0;
    return Math.min(Math.ceil((count / maxActivity) * 4), 4);
  };

  const getColorClass = (intensity) => {
    const colors = [
      'bg-gray-100',
      'bg-blue-200',
      'bg-blue-400',
      'bg-blue-600',
      'bg-blue-800'
    ];
    return colors[intensity];
  };

  return (
    <CollapsibleWidget
      title="Тепловая карта активности команды"
      icon={Activity}
      iconColor="text-purple-600"
      defaultExpanded={false}
    >
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header with hours */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {hours.map(hour => (
              <div key={hour} className="w-8 text-xs text-gray-500 text-center">
                {hour}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex mb-1">
              <div className="w-12 text-xs text-gray-600 flex items-center">
                {day}
              </div>
              {hours.map(hour => {
                const hourIndex = hour - 9;
                const cellData = heatmapData[dayIndex] && heatmapData[dayIndex][hourIndex] 
                  ? heatmapData[dayIndex][hourIndex] 
                  : { count: 0, tasks: [] };
                const intensity = getIntensity(cellData.count);
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`w-8 h-6 mx-0.5 rounded-sm ${getColorClass(intensity)} 
                      hover:ring-2 hover:ring-blue-300 cursor-pointer transition-all duration-150`}
                    title={`${day} ${hour}:00 - ${cellData.count} задач`}
                  />
                );
              })}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center justify-center mt-4 space-x-2 text-xs text-gray-600">
            <span>Меньше</span>
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getColorClass(intensity)}`}
              />
            ))}
            <span>Больше</span>
            <span className="ml-4 text-gray-500">Макс: {maxActivity}</span>
          </div>
        </div>
      </div>
    </CollapsibleWidget>
  );
}