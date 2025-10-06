import React from 'react';
import { UserCard } from './UserCard';
import { MonthFilter } from './MonthFilter';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useCustomization } from '../contexts/CustomizationContext';

export function UserList({
  filteredAndSortedStats,
  searchTerm,
  setSearchTerm,
  sortField,
  sortDirection,
  handleSort,
  showOnlyWithLongTasks,
  setShowOnlyWithLongTasks,
  availableMonths,
  selectedMonth,
  onMonthChange
}) {
  const { theme, themes } = useCustomization();
  const themeColors = themes[theme].colors;

  return (
    <div className={`${themeColors.cardBackground} rounded-xl shadow-sm border ${themeColors.border} p-6 mb-8`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className={`text-xl font-bold ${themeColors.text} flex items-center`}>
          <Filter className={`h-5 w-5 mr-2 ${themeColors.primary}`} />
          Статистика пользователей
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <MonthFilter 
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск пользователя..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyWithLongTasks}
              onChange={(e) => setShowOnlyWithLongTasks(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${themeColors.textSecondary}`}>Только с долгими задачами</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'totalWorkTime', label: 'По времени работы' },
          { key: 'taskCount', label: 'По количеству задач' },
          { key: 'longRunningTasks', label: 'По долгим задачам' },
          { key: 'overtimeTasks', label: 'По переработке' },
          { key: 'quickTasks', label: 'По быстрым задачам' },
          { key: 'mediumTasks', label: 'По средним задачам' },
          { key: 'currentTasks', label: 'По задачам в работе' },
          { key: 'notStartedTasks', label: 'По не начатым задачам' },
          { key: 'assignee_username', label: 'По имени' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              sortField === key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{label}</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ))}
      </div>

      {filteredAndSortedStats.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Пользователи не найдены</p>
          <p className="text-sm mt-2">Попробуйте изменить критерии поиска</p>
        </div>
      ) : (
        <p className={`text-sm ${themeColors.textSecondary} mb-4`}>
          Показано {filteredAndSortedStats.length} пользователей
        </p>
      )}

      <div className="space-y-6">
        {filteredAndSortedStats.map((userStat) => (
          <UserCard key={userStat.assignee_username} userStats={userStat} />
        ))}
      </div>
    </div>
  );
}