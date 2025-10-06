import { parseDateTime } from './dataProcessor';

// Generate timeline data for charts
export function generateTimelineData(tasks) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Generating timeline data for', tasks.length, 'tasks');
  }
  
  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Remove duplicates first
  const uniqueTasks = tasks.reduce((acc, task) => {
    const exists = acc.find(t => t.taskid === task.taskid);
    if (!exists) acc.push(task);
    return acc;
  }, []);

  const dayMap = new Map();
  
  uniqueTasks.forEach(task => {
    // Use createTask as primary date source
    let dateStr = task.createTask;
    if (!dateStr && task.time_start) dateStr = task.time_start;
    if (!dateStr && task.time_end) dateStr = task.time_end;
    
    if (!dateStr) return;
    
    const date = parseDateTime(dateStr);
    if (!date || isNaN(date.getTime())) return;
    
    const dayKey = date.toISOString().split('T')[0];
    
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        date: dayKey,
        totalTasks: 0,
        completedTasks: 0,
        totalTime: 0
      });
    }
    
    const dayData = dayMap.get(dayKey);
    dayData.totalTasks++;
    
    // Check if task is completed
    const isCompleted = task.time_start && task.time_start.trim() !== '' && 
                       task.time_end && task.time_end.trim() !== '';
    
    if (isCompleted) {
      dayData.completedTasks++;
      
      // Calculate duration more reliably
      let duration = task.duration;
      if (!duration || duration === 0) {
        const startDate = parseDateTime(task.time_start, task.createTask?.split(' ')[0]);
        const endDate = parseDateTime(task.time_end, task.createTask?.split(' ')[0]);
        
        if (startDate && endDate && endDate > startDate) {
          const diffMs = endDate.getTime() - startDate.getTime();
          duration = Math.max(0, Math.round(diffMs / (1000 * 60))); // minutes
        }
      }
      
      if (duration && !isNaN(duration) && duration > 0) {
        dayData.totalTime += duration;
      }
    }
  });
  
  // Convert to array and sort by date
  const result = Array.from(dayMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30); // Last 30 days
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Timeline data generated:', result.length, 'days');
    if (result.length > 0) {
      console.log('Sample timeline data:', result[0]);
      console.log('Total time across all days:', result.reduce((sum, day) => sum + day.totalTime, 0));
    }
  }
  return result;
}

// Generate heatmap data for activity visualization
export function generateHeatmapData(tasks) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Generating heatmap data for', tasks.length, 'tasks');
  }
  
  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Remove duplicates and filter valid tasks
  const validTasks = tasks.reduce((acc, task) => {
    const exists = acc.find(t => t.taskid === task.taskid);
    if (!exists && task.time_start) acc.push(task);
    return acc;
  }, []);
  
  // Initialize 7 days x 15 hours (9-23) grid
  const heatmapData = Array(7).fill(null).map(() => 
    Array(15).fill(null).map(() => ({ count: 0, tasks: [] }))
  );
  let totalActivity = 0;
  
  validTasks.forEach(task => {
    const date = parseDateTime(task.time_start, task.createTask?.split(' ')[0]);
    if (!date || isNaN(date.getTime())) return;
    
    // Convert JavaScript day (0=Sunday) to Monday-first week (0=Monday)
    const jsDayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfWeek = jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1; // 0=Monday, 6=Sunday
    const hour = date.getHours();
    
    // Only count working hours (9-23)
    if (hour >= 9 && hour <= 23) {
      const hourIndex = hour - 9; // Convert to 0-14 index
      heatmapData[dayOfWeek][hourIndex].count++;
      heatmapData[dayOfWeek][hourIndex].tasks.push(task);
      totalActivity++;
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Heatmap data generated, total activity:', totalActivity);
  }
  return heatmapData;
}

// Detect zombie tasks (tasks without activity for too long)
export function detectZombieTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return tasks.filter(task => {
    // Skip completed tasks
    if (task.time_end) return false;
    
    // Check if task has been inactive for more than 7 days
    const lastActivity = parseDateTime(task.time_start || task.time_created);
    if (!lastActivity) return false;
    
    return lastActivity < sevenDaysAgo;
  });
}

// Analyze workload balance across team members
export function analyzeWorkloadBalance(userStats) {
  if (!userStats || userStats.length === 0) {
    return {
      totalActiveUsers: 0,
      maxActive: 0,
      minActive: 0,
      avgActive: 0,
      overloaded: [],
      underloaded: [],
      balanceScore: 100
    };
  }

  // Filter users with any tasks and ensure data consistency
  const activeUsers = userStats.filter(u => u.totalTasks > 0);
  
  if (activeUsers.length === 0) {
    return {
      totalActiveUsers: 0,
      maxActive: 0,
      minActive: 0,
      avgActive: 0,
      overloaded: [],
      underloaded: [],
      balanceScore: 100
    };
  }
  
  const activeTasks = activeUsers.map(u => (u.currentTasks && u.currentTasks.length) || 0);
  const maxActive = Math.max(...activeTasks);
  const minActive = Math.min(...activeTasks);
  const avgActive = activeTasks.reduce((sum, count) => sum + count, 0) / activeTasks.length;
  
  // Improved balance score calculation
  let balanceScore = 100;
  
  if (activeUsers.length > 1) {
    if (maxActive === 0) {
      // No active tasks, check completed tasks for balance
      const completedTasks = activeUsers.map(u => u.completedTasks);
      const maxCompleted = Math.max(...completedTasks);
      const minCompleted = Math.min(...completedTasks);
      
      if (maxCompleted > 0) {
        const difference = maxCompleted - minCompleted;
        balanceScore = Math.max(0, (1 - difference / maxCompleted) * 100);
      }
    } else {
      // Calculate balance based on active tasks
      const difference = maxActive - minActive;
      
      if (difference === 0) {
        balanceScore = 100; // Perfect balance
      } else if (difference === 1) {
        balanceScore = 85; // Very good balance
      } else {
        // Use coefficient of variation for better balance calculation
        const variance = activeTasks.reduce((sum, count) => {
          return sum + Math.pow(count - avgActive, 2);
        }, 0) / activeTasks.length;
        
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = avgActive > 0 ? standardDeviation / avgActive : 0;
        
        // Convert to balance score (lower CV = higher balance)
        balanceScore = Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
      }
    }
  }
  
  // Find overloaded and underloaded users with better thresholds
  const overloaded = activeUsers.filter(u => {
    const currentTasks = (u.currentTasks && u.currentTasks.length) || 0;
    return currentTasks >= 3 || (avgActive > 1 && currentTasks > avgActive * 1.8);
  }).map(u => ({
    username: u.assignee_username,
    activeTasks: (u.currentTasks && u.currentTasks.length) || 0,
    tasks: (u.currentTasks || []).slice(0, 5) // Limit to 5 tasks for display
  }));
  
  const underloaded = activeUsers.filter(u => {
    const currentTasks = (u.currentTasks && u.currentTasks.length) || 0;
    return avgActive > 0.5 && currentTasks === 0 && u.completedTasks > 0;
  }).map(u => ({
    username: u.assignee_username,
    activeTasks: (u.currentTasks && u.currentTasks.length) || 0,
    tasks: (u.currentTasks || []).slice(0, 5)
  }));
  
  return {
    maxActive,
    minActive,
    avgActive: Math.round(avgActive * 10) / 10,
    totalActiveUsers: activeUsers.length,
    overloaded,
    underloaded,
    balanceScore: Math.round(balanceScore)
  };
}

// Generate productivity insights
export function generateProductivityInsights(userStats, tasks) {
  const insights = [];
  
  if (!userStats || userStats.length === 0) {
    return insights;
  }
  
  // Find most productive user (by completed tasks)
  const activeUsers = userStats.filter(u => u.completedTasks > 0);
  
  if (activeUsers.length === 0) {
    return insights;
  }
  
  const mostProductive = activeUsers.reduce((max, user) => 
    user.completedTasks > max.completedTasks ? user : max
  );
  
  if (mostProductive.completedTasks > 0) {
    insights.push({
      type: 'success',
      title: 'Лидер по продуктивности',
      description: `${mostProductive.assignee_username} завершил ${mostProductive.completedTasks} задач`
    });
  }
  
  // Find most efficient user (lowest average time per task)
  const usersWithTime = activeUsers.filter(u => u.averageTaskTime > 0);
  if (usersWithTime.length > 0) {
    const mostEfficient = usersWithTime.reduce((min, user) => 
      user.averageTaskTime < min.averageTaskTime ? user : min
    );
    
    insights.push({
      type: 'success',
      title: 'Самый эффективный',
      description: `${mostEfficient.assignee_username} - среднее время задачи ${Math.round(mostEfficient.averageTaskTime)} мин`
    });
  }
  
  // Find users with many long-running tasks (threshold: 2+ long tasks)
  const usersWithLongTasks = userStats.filter(u => u.longRunningTasks && u.longRunningTasks.length >= 2);
  if (usersWithLongTasks.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Много долгих задач',
      description: `${usersWithLongTasks.length} пользователей имеют 2+ долгих задач: ${usersWithLongTasks.map(u => u.assignee_username).join(', ')}`
    });
  }
  
  // Find users with significant overtime work (threshold: 60+ minutes)
  const usersWithOvertime = userStats.filter(u => (u.totalOvertimeHours || 0) > 120); // more than 2 hours
  if (usersWithOvertime.length > 0) {
    const overtimeUsersList = usersWithOvertime.map(u => u.assignee_username).join(', ');
    insights.push({
      type: 'warning',
      title: 'Много переработок',
      description: `${usersWithOvertime.length} пользователей работают сверхурочно: ${overtimeUsersList}`
    });
  }
  
  // Find users with many quick tasks (threshold: 5+ quick tasks)
  const usersWithQuickTasks = userStats.filter(u => u.quickTasks && u.quickTasks.length >= 5);
  if (usersWithQuickTasks.length > 0) {
    const topQuick = usersWithQuickTasks.reduce((max, user) => 
      user.quickTasks.length > max.quickTasks.length ? user : max
    );
    
    insights.push({
      type: 'success',
      title: 'Мастер быстрых задач',
      description: `${topQuick.assignee_username} выполнил ${topQuick.quickTasks.length} быстрых задач`
    });
  }
  
  // Add team performance insights
  const totalCompleted = activeUsers.reduce((sum, u) => sum + u.completedTasks, 0);
  const avgCompletedPerUser = totalCompleted / activeUsers.length;
  
  if (avgCompletedPerUser >= 5) {
    insights.push({
      type: 'success',
      title: 'Высокая продуктивность команды',
      description: `В среднем ${Math.round(avgCompletedPerUser)} задач на пользователя`
    });
  }
  
  return insights;
}

// Get available creators for filtering
export function getAvailableCreators(tasks) {
  if (!tasks || tasks.length === 0) {
    return [];
  }
  
  const creators = new Set();
  tasks.forEach(task => {
    if (task.created_by_name && task.created_by_name.trim() !== '') {
      creators.add(task.created_by_name);
    }
  });
  
  return Array.from(creators).sort();
}

// Get available task identifiers for filtering
export function getAvailableIdentifiers(tasks) {
  if (!tasks || tasks.length === 0) {
    return [];
  }
  
  const identifiers = new Set();
  tasks.forEach(task => {
    if (task.task_identifier && task.task_identifier.trim() !== '') {
      identifiers.add(task.task_identifier);
    }
  });
  
  return Array.from(identifiers).sort();
}

// Apply advanced filters to tasks
export function applyAdvancedFilters(tasks, filters) {
  if (!tasks || tasks.length === 0) {
    return [];
  }
  
  // Remove duplicates first
  const uniqueTasks = tasks.reduce((acc, task) => {
    const exists = acc.find(t => t.taskid === task.taskid);
    if (!exists) acc.push(task);
    return acc;
  }, []);
  
  return uniqueTasks.filter(task => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        (task.title && task.title.toLowerCase().includes(searchLower)) ||
        (task.taskid && task.taskid.toString().includes(searchLower)) ||
        (task.assignee_username && task.assignee_username.toLowerCase().includes(searchLower)) ||
        (task.task_identifier && task.task_identifier.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Created by filter
    if (filters.createdBy && task.created_by_name !== filters.createdBy) {
      return false;
    }
    
    // Task identifier filter
    if (filters.taskIdentifier && task.task_identifier !== filters.taskIdentifier) {
      return false;
    }
    
    // Duration filters
    if (filters.minDuration && (task.duration || 0) < parseFloat(filters.minDuration)) {
      return false;
    }
    
    if (filters.maxDuration && (task.duration || 0) > parseFloat(filters.maxDuration)) {
      return false;
    }
    
    // Date filters
    if (filters.dateFrom) {
      const taskDate = parseDateTime(task.createTask || task.time_start);
      const fromDate = new Date(filters.dateFrom);
      if (!taskDate || taskDate < fromDate) {
        return false;
      }
    }
    
    if (filters.dateTo) {
      const taskDate = parseDateTime(task.createTask || task.time_start);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (!taskDate || taskDate > toDate) {
        return false;
      }
    }
    
    // Task status filter
    if (filters.taskStatus !== 'all') {
      const isCompleted = task.time_end && task.time_end.trim() !== '';
      const isInProgress = task.time_start && task.time_start.trim() !== '' && !isCompleted;
      const isNotStarted = (!task.time_start || task.time_start.trim() === '') && !isCompleted;
      
      if (filters.taskStatus === 'completed' && !isCompleted) {
        return false;
      }
      if (filters.taskStatus === 'inProgress' && !isInProgress) {
        return false;
      }
      if (filters.taskStatus === 'notStarted' && !isNotStarted) {
        return false;
      }
    }
    
    return true;
  });
}