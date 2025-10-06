import React, { useState } from 'react';
import { useCustomization } from '../contexts/CustomizationContext';
import { Settings, Palette, LayoutGrid as Layout, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Trash2, RotateCcw, Save, X } from 'lucide-react';

export function CustomizationPanel() {
  const {
    theme,
    setTheme,
    themes,
    layout,
    toggleWidget,
    moveWidget,
    customMetrics,
    addCustomMetric,
    removeCustomMetric,
    isCustomizing,
    setIsCustomizing,
    resetToDefault,
    saveSettings
  } = useCustomization();

  const [activeTab, setActiveTab] = useState('theme');
  const [newMetric, setNewMetric] = useState({ name: '', formula: '', description: '' });

  const widgetNames = {
    'overall-stats': 'Общая статистика',
    'smart-notifications': 'Умные уведомления',
    'workload-forecast': 'Прогноз нагрузки',
    'advanced-analytics': 'Расширенная аналитика',
    'team-management': 'Управление командой',
    'alerts': 'Алерты и мониторинг',
    'unassigned-tasks': 'Задачи без исполнителя',
    'incomplete-tasks': 'Незавершенные задачи',
    'productivity': 'Метрики продуктивности',
    'timeline': 'Временная динамика',
    'heatmap': 'Тепловая карта',
    'export': 'Экспорт отчетов',
    'filters': 'Расширенные фильтры',
    'user-list': 'Список пользователей'
  };

  const handleAddMetric = () => {
    if (newMetric.name && newMetric.formula) {
      addCustomMetric(newMetric);
      setNewMetric({ name: '', formula: '', description: '' });
    }
  };

  if (!isCustomizing) {
    return (
      <button
        onClick={() => setIsCustomizing(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Настройки дашборда"
      >
        <Settings className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Настройки дашборда</h2>
          <button
            onClick={() => setIsCustomizing(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('theme')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'theme' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Темы</span>
              </button>
              
              <button
                onClick={() => setActiveTab('layout')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'layout' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Layout className="h-4 w-4" />
                <span>Виджеты</span>
              </button>
              
              <button
                onClick={() => setActiveTab('metrics')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'metrics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Метрики</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Выберите тему</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(themes).map(([key, themeData]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 mb-2">{themeData.name}</h4>
                        <div className="flex space-x-2">
                          <div className={`w-4 h-4 rounded ${themeData.colors.background.replace('bg-', 'bg-')}`} />
                          <div className={`w-4 h-4 rounded ${themeData.colors.cardBackground.replace('bg-', 'bg-')}`} />
                          <div className={`w-4 h-4 rounded ${themeData.colors.accent.replace('bg-', 'bg-')}`} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Управление виджетами</h3>
                
                <div className="space-y-3">
                  {layout.sort((a, b) => a.position - b.position).map((widget, index) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleWidget(widget.id)}
                          className={`p-1 rounded ${
                            widget.visible ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <span className="font-medium text-gray-900">
                          {widgetNames[widget.type] || widget.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveWidget(widget.id, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveWidget(widget.id, Math.min(layout.length - 1, index + 1))}
                          disabled={index === layout.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Пользовательские метрики</h3>
                
                {/* Add new metric */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Добавить метрику</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Название метрики"
                      value={newMetric.name}
                      onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Формула (например: completedTasks / totalTasks * 100)"
                      value={newMetric.formula}
                      onChange={(e) => setNewMetric(prev => ({ ...prev, formula: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Описание (опционально)"
                      value={newMetric.description}
                      onChange={(e) => setNewMetric(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddMetric}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить</span>
                    </button>
                  </div>
                </div>

                {/* Existing metrics */}
                <div className="space-y-3">
                  {customMetrics.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{metric.name}</h5>
                        <p className="text-sm text-gray-600">{metric.formula}</p>
                        {metric.description && (
                          <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeCustomMetric(metric.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Сбросить к умолчанию</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={saveSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Сохранить</span>
            </button>
            <button
              onClick={() => setIsCustomizing(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}