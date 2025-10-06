import React, { useState } from 'react';
import { AlertTriangle, Timer, Pause, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { TaskList } from './TaskList';

export function IncompleteTasks({ userStats, unassignedTasks }) {
  const [activeTab, setActiveTab] = useState('not-started');
  const [isExpanded, setIsExpanded] = useState(true);

  // Собираем все незавершенные задачи
  const allNotStartedTasks = [];
  const allInProgressTasks = [];
  
  userStats.forEach(user => {
    if (user.notStartedTasks && user.notStartedTasks.length > 0) {
      allNotStartedTasks.push(...user.notStartedTasks.map(task => ({
        ...task,
        assignee_username: user.assignee_username
      })));
    }
    
    if (user.currentTasks && user.currentTasks.length > 0) {
      allInProgressTasks.push(...user.currentTasks.map(task => ({
        ...task,
        assignee_username: user.assignee_username
      })));
    }
  });

  // Добавляем неназначенные задачи
  const unassignedNotStarted = unassignedTasks.filter(task => 
    (!task.time_start || task.time_start.trim() === '') &&
    (!task.time_end || task.time_end.trim() === '')
  );
  
  const unassignedInProgress = unassignedTasks.filter(task => 
    task.time_start && task.time_start.trim() !== '' && 
    (!task.time_end || task.time_end.trim() === '')
  );

  allNotStartedTasks.push(...unassignedNotStarted);
  allInProgressTasks.push(...unassignedInProgress);

  const tabs = [
    {
      id: 'not-started',
      label: 'Не начатые',
      count: allNotStartedTasks.length,
      icon: Pause,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'in-progress',
      label: 'В работе',
      count: allInProgressTasks.length,
      icon: Timer,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  const getCurrentTasks = () => {
    switch (activeTab) {
      case 'not-started':
        return allNotStartedTasks;
      case 'in-progress':
        return allInProgressTasks;
      default:
        return [];
    }
  };

  const currentTasks = getCurrentTasks();
  const totalIncompleteTasks = allNotStartedTasks.length + allInProgressTasks.length;

  if (totalIncompleteTasks === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-green-600" />
          Незавершенные задачи
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Отлично!</h3>
          <p className="text-gray-600">Все задачи завершены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Незавершенные задачи ({totalIncompleteTasks})
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
        >
          <span>{isExpanded ? 'Скрыть' : 'Показать'}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Pause className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Не начатые задачи</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{allNotStartedTasks.length}</p>
          <p className="text-sm text-red-600">Требуют назначения и начала работы</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Timer className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">В работе</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">{allInProgressTasks.length}</p>
          <p className="text-sm text-amber-600">Начаты, но не завершены</p>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? `${tab.bgColor} ${tab.color} border ${tab.borderColor}`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-white' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tasks list */}
          {currentTasks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label} ({currentTasks.length})
                </h4>
                <div className="text-sm text-gray-500">
                  Сортировка: по дате создания (новые первыми)
                </div>
              </div>
              
              <TaskList 
                tasks={currentTasks.sort((a, b) => {
                  const dateA = new Date(a.createTask || 0);
                  const dateB = new Date(b.createTask || 0);
                  return dateB - dateA;
                })} 
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">
                {activeTab === 'not-started' ? 'Нет не начатых задач' : 'Нет задач в работе'}
              </p>
              <p className="text-sm mt-2">
                {activeTab === 'not-started' 
                  ? 'Все задачи либо завершены, либо находятся в работе' 
                  : 'Все задачи либо завершены, либо еще не начаты'
                }
              </p>
            </div>
          )}

          {/* Statistics by assignee */}
          {currentTasks.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Распределение по исполнителям:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(
                  currentTasks.reduce((acc, task) => {
                    const assignee = task.assignee_username || 'Не назначен';
                    acc[assignee] = (acc[assignee] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([assignee, count]) => (
                  <div key={assignee} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{assignee}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}