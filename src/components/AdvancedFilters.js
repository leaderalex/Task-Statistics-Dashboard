import React, { useState } from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { Filter, Search, X, Calendar, User, Clock, Tag } from 'lucide-react';

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  availableCreators, 
  availableIdentifiers 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      createdBy: '',
      taskIdentifier: '',
      minDuration: '',
      maxDuration: '',
      dateFrom: '',
      dateTo: '',
      taskStatus: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== '' && value !== 'all'
  );

  return (
    <CollapsibleWidget
      title="Расширенные фильтры"
      icon={Filter}
      defaultExpanded={hasActiveFilters}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Очистить</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>{isExpanded ? 'Скрыть' : 'Показать'} фильтры</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by task title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск по названию задачи
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Введите ключевые слова..."
                value={filters.searchTerm || ''}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Created by filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Создатель задачи
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filters.createdBy || ''}
                onChange={(e) => updateFilter('createdBy', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все создатели</option>
                {availableCreators.map(creator => (
                  <option key={creator} value={creator}>{creator}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Task identifier filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Идентификатор задачи
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filters.taskIdentifier || ''}
                onChange={(e) => updateFilter('taskIdentifier', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все идентификаторы</option>
                {availableIdentifiers.map(identifier => (
                  <option key={identifier} value={identifier}>{identifier}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Минимальная длительность (мин)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                placeholder="0"
                value={filters.minDuration || ''}
                onChange={(e) => updateFilter('minDuration', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Максимальная длительность (мин)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                placeholder="∞"
                value={filters.maxDuration || ''}
                onChange={(e) => updateFilter('maxDuration', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Task status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус задачи
            </label>
            <select
              value={filters.taskStatus || 'all'}
              onChange={(e) => updateFilter('taskStatus', e.target.value)}
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все статусы</option>
              <option value="completed">Завершенные</option>
              <option value="inProgress">В работе</option>
              <option value="notStarted">Не начатые</option>
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата создания от
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата создания до
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '' || value === 'all') return null;
            
            const labels = {
              searchTerm: 'Поиск',
              createdBy: 'Создатель',
              taskIdentifier: 'ID',
              minDuration: 'Мин. время',
              maxDuration: 'Макс. время',
              dateFrom: 'От',
              dateTo: 'До',
              taskStatus: 'Статус'
            };

            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {labels[key]}: {value}
                <button
                  onClick={() => updateFilter(key, '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </CollapsibleWidget>
  );
}