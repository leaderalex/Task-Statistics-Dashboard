import React from 'react';
import { OverallStats } from './OverallStats';
import { AlertsMonitoring } from './AlertsMonitoring';
import { ProductivityMetrics } from './ProductivityMetrics';
import { TimelineChart } from './TimelineChart';
import { HeatmapChart } from './HeatmapChart';
import { ExportReports } from './ExportReports';
import { AdvancedFilters } from './AdvancedFilters';
import { UserList } from './UserList';
import { IncompleteTasks } from './IncompleteTasks';
import { UnassignedTasks } from './UnassignedTasks';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { TeamManagement } from './TeamManagement';
import { SmartNotifications } from './SmartNotifications';
import { WorkloadForecast } from './WorkloadForecast';
import { useCustomization } from '../contexts/CustomizationContext';

const WIDGET_COMPONENTS = {
  'overall-stats': OverallStats,
  'smart-notifications': SmartNotifications,
  'workload-forecast': WorkloadForecast,
  'advanced-analytics': AdvancedAnalytics,
  'team-management': TeamManagement,
  'alerts': AlertsMonitoring,
  'unassigned-tasks': UnassignedTasks,
  'incomplete-tasks': IncompleteTasks,
  'productivity': ProductivityMetrics,
  'timeline': TimelineChart,
  'heatmap': HeatmapChart,
  'filters': AdvancedFilters,
  'export': ExportReports,
  'user-list': UserList
};

export function DashboardLayout({ 
  userStats, 
  unassignedTasks, 
  timelineData, 
  heatmapData, 
  zombieTasks, 
  workloadBalance, 
  productivityInsights,
  filteredTasks,
  selectedMonth,
  advancedFilters,
  onFiltersChange,
  availableCreators,
  availableIdentifiers,
  filteredAndSortedStats,
  searchTerm,
  setSearchTerm,
  sortField,
  sortDirection,
  handleSort,
  showOnlyWithLongTasks,
  setShowOnlyWithLongTasks,
  availableMonths,
  selectedMonth: monthFilter,
  onMonthChange
}) {
  const { layout, theme, themes } = useCustomization();
  const themeColors = themes[theme].colors;

  const getWidgetProps = (widgetType) => {
    switch (widgetType) {
      case 'overall-stats':
        return { userStats, unassignedTasks };
      case 'smart-notifications':
        return { userStats, allTasks: filteredTasks, workloadBalance, zombieTasks };
      case 'workload-forecast':
        return { userStats, allTasks: filteredTasks };
      case 'advanced-analytics':
        return { userStats, allTasks: filteredTasks, selectedMonth };
      case 'team-management':
        return { userStats, allTasks: filteredTasks };
      case 'alerts':
        return { zombieTasks, workloadBalance, productivityInsights };
      case 'unassigned-tasks':
        return { unassignedTasks };
      case 'incomplete-tasks':
        return { userStats, unassignedTasks };
      case 'productivity':
        return { userStats, allTasks: filteredTasks };
      case 'timeline':
        return { userStats, timelineData };
      case 'heatmap':
        return { heatmapData };
      case 'filters':
        return { 
          filters: advancedFilters, 
          onFiltersChange, 
          availableCreators, 
          availableIdentifiers 
        };
      case 'export':
        return { userStats, allTasks: filteredTasks, selectedMonth };
      case 'user-list':
        return {
          filteredAndSortedStats,
          searchTerm,
          setSearchTerm,
          sortField,
          sortDirection,
          handleSort,
          showOnlyWithLongTasks,
          setShowOnlyWithLongTasks,
          availableMonths,
          selectedMonth: monthFilter,
          onMonthChange
        };
      default:
        return {};
    }
  };

  const visibleWidgets = layout
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div className={`min-h-screen ${themeColors.background} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {visibleWidgets.map(widget => {
          const Component = WIDGET_COMPONENTS[widget.type];
          if (!Component) {
            console.warn(`Widget component not found for type: ${widget.type}`);
            return null;
          }

          const props = getWidgetProps(widget.type);

          return (
            <div key={widget.id} className="widget-container">
              <Component {...props} />
            </div>
          );
        })}
      </div>
    </div>
  );
}