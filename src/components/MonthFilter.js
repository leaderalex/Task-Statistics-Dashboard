import React from 'react';
import { Calendar } from 'lucide-react';
import { formatMonthName } from '../utils/dataProcessor';

export function MonthFilter({ availableMonths, selectedMonth, onMonthChange }) {
  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        <option value="all">Все месяцы</option>
        {availableMonths.map(month => (
          <option key={month} value={month}>
            {formatMonthName(month)}
          </option>
        ))}
      </select>
    </div>
  );
}