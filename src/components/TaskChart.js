import React from 'react';
import { Zap, Timer, AlertTriangle } from 'lucide-react';

export function TaskChart({ userStats }) {
  const { quickTasks, mediumTasks, longRunningTasks, completedTasks } = userStats;
  
  const quickCount = quickTasks.length;
  const mediumCount = mediumTasks.length;
  const longCount = longRunningTasks.length;
  const total = completedTasks;
  
  if (total === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">Нет завершенных задач для отображения</p>
      </div>
    );
  }
  
  const quickPercent = (quickCount / total) * 100;
  const mediumPercent = (mediumCount / total) * 100;
  const longPercent = (longCount / total) * 100;
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        Распределение задач по времени выполнения
      </h4>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div className="h-full flex">
          {quickPercent > 0 && (
            <div 
              className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${quickPercent}%` }}
              title={`Быстрые задачи: ${quickCount}`}
            >
              {quickPercent >= 15 && `${quickCount}`}
            </div>
          )}
          {mediumPercent > 0 && (
            <div 
              className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${mediumPercent}%` }}
              title={`Средние задачи: ${mediumCount}`}
            >
              {mediumPercent >= 15 && `${mediumCount}`}
            </div>
          )}
          {longPercent > 0 && (
            <div 
              className="bg-amber-500 h-full flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${longPercent}%` }}
              title={`Долгие задачи: ${longCount}`}
            >
              {longPercent >= 15 && `${longCount}`}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-green-500" />
            <div className="w-3 h-3 bg-green-500 rounded"></div>
          </div>
          <span className="text-gray-700">
            Быстрые (≤30мин): <span className="font-medium">{quickCount}</span> 
            <span className="text-gray-500 ml-1">({quickPercent.toFixed(1)}%)</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Timer className="h-4 w-4 text-blue-500" />
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
          </div>
          <span className="text-gray-700">
            Средние (30мин-2ч): <span className="font-medium">{mediumCount}</span>
            <span className="text-gray-500 ml-1">({mediumPercent.toFixed(1)}%)</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
          </div>
          <span className="text-gray-700">
            Долгие (>5ч): <span className="font-medium">{longCount}</span>
            <span className="text-gray-500 ml-1">({longPercent.toFixed(1)}%)</span>
          </span>
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Быстрые задачи</span>
          </div>
          <p className="text-lg font-bold text-green-900">{quickCount}</p>
          <p className="text-xs text-green-600">
            {(quickCount / total * 100).toFixed(1)}% от всех задач
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Средние задачи</span>
          </div>
          <p className="text-lg font-bold text-blue-900">{mediumCount}</p>
          <p className="text-xs text-blue-600">
            {(mediumCount / total * 100).toFixed(1)}% от всех задач
          </p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Долгие задачи</span>
          </div>
          <p className="text-lg font-bold text-amber-900">{longCount}</p>
          <p className="text-xs text-amber-600">
            {(longCount / total * 100).toFixed(1)}% от всех задач
          </p>
        </div>
      </div>
    </div>
  );
}