import React, { useState } from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { Download, FileText, Users, TrendingUp } from 'lucide-react';
import { formatDuration } from '../utils/dataProcessor';

export function ExportReports({ userStats, allTasks, selectedMonth }) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSVData = (data, headers) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (data, filename) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUserStats = async () => {
    setIsExporting(true);
    
    const data = userStats.map(user => ({
      'Пользователь': user.assignee_username,
      'Всего задач': user.totalTasks,
      'Завершено': user.completedTasks,
      'В работе': user.currentTasks?.length || 0,
      'Не начато': user.notStartedTasks?.length || 0,
      'Общее время': formatDuration(user.totalWorkTime),
      'Среднее время задачи': formatDuration(Math.round(user.averageTaskTime)),
      'Быстрые задачи': user.quickTasks.length,
      'Средние задачи': user.mediumTasks.length,
      'Долгие задачи': user.longRunningTasks.length,
      'Переработка (задач)': user.overtimeTasks.length,
      'Часы переработки': formatDuration(user.totalOvertimeHours || 0),
      'Процент завершения': Math.round((user.completedTasks / user.totalTasks) * 100)
    }));

    const headers = Object.keys(data[0]);
    const csvData = generateCSVData(data, headers);
    const filename = `user_stats_${selectedMonth || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(csvData, filename);
    setIsExporting(false);
  };

  const exportTaskDetails = async () => {
    setIsExporting(true);
    
    const data = allTasks.map(task => ({
      'ID задачи': task.taskid,
      'Название': task.title,
      'Исполнитель': task.assignee_username || 'Не назначен',
      'Создатель': task.created_by_name || '',
      'Идентификатор': task.tast_identifier || '',
      'Дата создания': task.createTask || '',
      'Время начала': task.time_start || '',
      'Время окончания': task.time_end || '',
      'Длительность (мин)': task.duration || 0,
      'Длительность': formatDuration(task.duration || 0),
      'Переработка (мин)': task.overtimeHours || 0,
      'Статус': task.isCompleted ? 'Завершена' : task.time_start ? 'В работе' : 'Не начата',
      'Категория': task.isQuickTask ? 'Быстрая' : task.isMediumTask ? 'Средняя' : task.isLongRunning ? 'Долгая' : 'Обычная'
    }));

    const headers = Object.keys(data[0]);
    const csvData = generateCSVData(data, headers);
    const filename = `task_details_${selectedMonth || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(csvData, filename);
    setIsExporting(false);
  };

  const generateSummaryReport = () => {
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.isCompleted).length;
    const totalWorkTime = allTasks.filter(task => task.isCompleted).reduce((sum, task) => sum + (task.duration || 0), 0);
    const activeUsers = userStats.filter(user => user.completedTasks > 0).length;
    
    return {
      period: selectedMonth || 'Все время',
      totalTasks,
      completedTasks,
      completionRate: Math.round((completedTasks / totalTasks) * 100),
      totalWorkTime: formatDuration(totalWorkTime),
      activeUsers,
      avgTasksPerUser: Math.round(completedTasks / activeUsers),
      generatedAt: new Date().toLocaleString('ru-RU')
    };
  };

  const exportSummaryReport = async () => {
    setIsExporting(true);
    
    const summary = generateSummaryReport();
    const reportText = `
ОТЧЕТ ПО СТАТИСТИКЕ ЗАДАЧ
========================

Период: ${summary.period}
Дата генерации: ${summary.generatedAt}

ОБЩАЯ СТАТИСТИКА:
- Всего задач: ${summary.totalTasks}
- Завершено задач: ${summary.completedTasks}
- Процент завершения: ${summary.completionRate}%
- Общее время работы: ${summary.totalWorkTime}
- Активных пользователей: ${summary.activeUsers}
- Среднее задач на пользователя: ${summary.avgTasksPerUser}

ДЕТАЛЬНАЯ СТАТИСТИКА ПО ПОЛЬЗОВАТЕЛЯМ:
${userStats.map(user => `
${user.assignee_username}:
  - Всего задач: ${user.totalTasks}
  - Завершено: ${user.completedTasks}
  - Время работы: ${formatDuration(user.totalWorkTime)}
  - Быстрые задачи: ${user.quickTasks.length}
  - Средние задачи: ${user.mediumTasks.length}
  - Долгие задачи: ${user.longRunningTasks.length}
  - Переработка: ${formatDuration(user.totalOvertimeHours || 0)}
`).join('')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `summary_report_${selectedMonth || 'all'}_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
  };

  return (
    <CollapsibleWidget
      title="Экспорт отчетов"
      icon={Download}
      iconColor="text-green-600"
      defaultExpanded={false}
    >
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportUserStats}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Users className="h-5 w-5" />
          <span>Статистика пользователей</span>
        </button>
        
        <button
          onClick={exportTaskDetails}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileText className="h-5 w-5" />
          <span>Детали задач</span>
        </button>
        
        <button
          onClick={exportSummaryReport}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Сводный отчет</span>
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Доступные форматы:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>CSV</strong> - для импорта в Excel или Google Sheets</p>
          <p>• <strong>TXT</strong> - текстовый отчет для презентаций</p>
          <p>• Все файлы содержат данные за выбранный период</p>
        </div>
      </div>
    </CollapsibleWidget>
  );
}