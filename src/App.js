import React, { useMemo, useState } from 'react';
import { CustomizationProvider } from './contexts/CustomizationContext';
import { CustomizationPanel } from './components/CustomizationPanel';
import { DashboardLayout } from './components/DashboardLayout';
import { useTaskData } from './hooks/useTaskData';
import { processTaskData, getAvailableMonths, filterTasksByMonth, formatMonthName } from './utils/dataProcessor';
import { 
  generateTimelineData, 
  generateHeatmapData, 
  detectZombieTasks, 
  analyzeWorkloadBalance, 
  generateProductivityInsights,
  getAvailableCreators,
  getAvailableIdentifiers,
  applyAdvancedFilters
} from './utils/advancedAnalytics';
import { AlertCircle, Loader } from 'lucide-react';

function App() {
  const { tasks: currentData, loading, error } = useTaskData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('totalWorkTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showOnlyWithLongTasks, setShowOnlyWithLongTasks] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    searchTerm: '',
    createdBy: '',
    taskIdentifier: '',
    minDuration: '',
    maxDuration: '',
    dateFrom: '',
    dateTo: '',
    taskStatus: 'all'
  });

  const availableMonths = useMemo(() => getAvailableMonths(currentData), [currentData]);
  
  const filteredTasksByMonth = useMemo(() => 
    filterTasksByMonth(currentData, selectedMonth), 
    [currentData, selectedMonth]
  );
  
  const processedData = useMemo(() => processTaskData(filteredTasksByMonth), [filteredTasksByMonth]);
  const userStats = processedData.userStats;
  const unassignedTasksFiltered = processedData.unassignedTasks;
  
  // Apply advanced filters
  const filteredTasks = useMemo(() => 
    applyAdvancedFilters(filteredTasksByMonth, advancedFilters), 
    [filteredTasksByMonth, advancedFilters]
  );
  
  // Generate analytics data
  const timelineData = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Generating timeline data for', filteredTasks.length, 'tasks');
    }
    const result = generateTimelineData(filteredTasks);
    if (process.env.NODE_ENV === 'development') {
      console.log('Timeline data generated:', result.length, 'days');
    }
    return result;
  }, [filteredTasks]);
  
  const heatmapData = useMemo(() => generateHeatmapData(filteredTasks), [filteredTasks]);
  const zombieTasks = useMemo(() => detectZombieTasks(filteredTasks), [filteredTasks]);
  const workloadBalance = useMemo(() => analyzeWorkloadBalance(userStats), [userStats]);
  const productivityInsights = useMemo(() => 
    generateProductivityInsights(userStats, filteredTasks), 
    [userStats, filteredTasks]
  );
  
  // Get filter options
  const availableCreators = useMemo(() => getAvailableCreators(currentData), [currentData]);
  const availableIdentifiers = useMemo(() => getAvailableIdentifiers(currentData), [currentData]);
  
  // Reprocess data with filtered tasks for user stats
  const filteredProcessedData = useMemo(() => processTaskData(filteredTasks), [filteredTasks]);
  const filteredUserStats = filteredProcessedData.userStats;

  const filteredAndSortedStats = useMemo(() => {
    let filtered = filteredUserStats.filter(user =>
      user.assignee_username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showOnlyWithLongTasks) {
      filtered = filtered.filter(user => user.longRunningTasks.length > 0);
    }

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'assignee_username':
          aValue = a.assignee_username;
          bValue = b.assignee_username;
          break;
        case 'taskCount':
          aValue = a.totalTasks;
          bValue = b.totalTasks;
          break;
        case 'completedTasks':
          aValue = a.completedTasks;
          bValue = b.completedTasks;
          break;
        case 'totalWorkTime':
          aValue = a.totalWorkTime;
          bValue = b.totalWorkTime;
          break;
        case 'longRunningTasks':
          aValue = a.longRunningTasks.length;
          bValue = b.longRunningTasks.length;
          break;
        case 'overtimeTasks':
          aValue = a.overtimeTasks.length;
          bValue = b.overtimeTasks.length;
          break;
        case 'quickTasks':
          aValue = a.quickTasks.length;
          bValue = b.quickTasks.length;
          break;
        case 'mediumTasks':
          aValue = a.mediumTasks.length;
          bValue = b.mediumTasks.length;
          break;
        case 'currentTasks':
          aValue = a.currentTasks?.length || 0;
          bValue = b.currentTasks?.length || 0;
          break;
        case 'notStartedTasks':
          aValue = a.notStartedTasks?.length || 0;
          bValue = b.notStartedTasks?.length || 0;
          break;
        default:
          aValue = a.totalWorkTime;
          bValue = b.totalWorkTime;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [filteredUserStats, searchTerm, sortField, sortDirection, showOnlyWithLongTasks]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <CustomizationProvider>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Статистика задач команды
            </h1>
            <p className="text-lg text-gray-600">
              Анализ производительности и времени выполнения задач
              {selectedMonth !== 'all' && (
                <span className="block text-sm text-blue-600 mt-1">
                  Период: {formatMonthName(selectedMonth)}
                </span>
              )}
            </p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        <DashboardLayout
          userStats={filteredUserStats}
          unassignedTasks={unassignedTasksFiltered}
          timelineData={timelineData}
          heatmapData={heatmapData}
          zombieTasks={zombieTasks}
          workloadBalance={workloadBalance}
          productivityInsights={productivityInsights}
          filteredTasks={filteredTasks}
          selectedMonth={selectedMonth}
          advancedFilters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          availableCreators={availableCreators}
          availableIdentifiers={availableIdentifiers}
          filteredAndSortedStats={filteredAndSortedStats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          showOnlyWithLongTasks={showOnlyWithLongTasks}
          setShowOnlyWithLongTasks={setShowOnlyWithLongTasks}
          availableMonths={availableMonths}
          onMonthChange={setSelectedMonth}
        />
        
        <CustomizationPanel />
      </div>
    </CustomizationProvider>
  );
}

export default App;