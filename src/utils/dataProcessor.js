export function parseDateTime(dateStr, fallbackDate) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // If it's just time (HH:MM:SS), use fallback date or current date
  if (dateStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const baseDate = fallbackDate || new Date().toISOString().split('T')[0];
    return new Date(`${baseDate} ${dateStr}`);
  }
  
  // Full datetime
  return new Date(dateStr);
}

export function calculateDuration(startTime, endTime, createTime) {
  const startDate = parseDateTime(startTime, createTime?.split(' ')[0]);
  const endDate = parseDateTime(endTime, createTime?.split(' ')[0]);
  
  if (!startDate || !endDate) return 0;
  
  // Создаем границы рабочего времени (9:00-23:00)
  const workStartTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 9, 0, 0, 0);
  const maxWorkTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 0, 0, 0);
  
  // Если задача началась до 9:00, считаем с 9:00
  const effectiveStartTime = startDate < workStartTime ? workStartTime : startDate;
  
  // Если задача закончилась после 23:00, считаем до 23:00
  const effectiveEndTime = endDate > maxWorkTime ? maxWorkTime : endDate;
  
  // Если эффективное время начала больше времени окончания, продолжительность 0
  if (effectiveStartTime >= effectiveEndTime) return 0;
  
  const diffMs = effectiveEndTime.getTime() - effectiveStartTime.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60))); // Convert to minutes
}

export function calculateOvertimeHours(startTime, endTime, createTime) {
  const startDate = parseDateTime(startTime, createTime?.split(' ')[0]);
  const endDate = parseDateTime(endTime, createTime?.split(' ')[0]);
  
  if (!startDate || !endDate) return 0;
  
  // Создаем границы рабочего дня (9:00-16:00) и максимальное время работы (до 23:00)
  const workStartTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 9, 0, 0, 0);
  const workEndTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 16, 0, 0, 0);
  const maxWorkTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 0, 0, 0);
  
  // Если задача началась до 9:00, считаем с 9:00
  const effectiveStartTime = startDate < workStartTime ? workStartTime : startDate;
  
  // Если задача закончилась после 23:00, считаем до 23:00
  const effectiveEndTime = endDate > maxWorkTime ? maxWorkTime : endDate;
  
  // Если эффективное время начала больше времени окончания, переработки нет
  if (effectiveStartTime >= effectiveEndTime) return 0;
  
  // Если задача закончилась до 16:00, переработки нет
  if (effectiveEndTime <= workEndTime) return 0;
  
  // Если задача началась после 16:00, вся эффективная продолжительность - переработка
  if (effectiveStartTime >= workEndTime) {
    const diffMs = effectiveEndTime.getTime() - effectiveStartTime.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60))); // Convert to minutes
  }
  
  // Если задача началась до 16:00, но закончилась после - считаем только часть после 16:00
  const overtimeMs = effectiveEndTime.getTime() - workEndTime.getTime();
  return Math.max(0, Math.round(overtimeMs / (1000 * 60))); // Convert to minutes
}

export function formatDuration(minutes) {
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function processTaskData(tasks) {
  // Remove duplicate tasks by taskid and ensure data consistency
  const uniqueTasks = tasks.reduce((acc, task) => {
    const existingIndex = acc.findIndex(t => t.taskid === task.taskid);
    if (existingIndex === -1) {
      acc.push(task);
    } else {
      // Keep the task with more complete data (prefer tasks with end time)
      const existing = acc[existingIndex];
      if (task.time_end && !existing.time_end) {
        acc[existingIndex] = task;
      }
    }
    return acc;
  }, []);
  
  const userMap = new Map();
  let unassignedTasks = [];
  
  // Process each task and group by user
  uniqueTasks.forEach(task => {
    if (!task.assignee_username || task.assignee_username.trim() === '') {
      // Collect unassigned tasks
      const duration = calculateDuration(task.time_start, task.time_end, task.createTask);
      const overtimeHours = calculateOvertimeHours(task.time_start, task.time_end, task.createTask);
      const isCompleted = task.time_start && task.time_end && task.time_end.trim() !== '';
      const isLongRunning = duration > 300;
      const isQuickTask = duration <= 30;
      const isMediumTask = duration > 30 && duration <= 120;
      const isOvertimeTask = checkIfOvertimeTask(task.time_start, task.createTask);
      const hasOvertimeHours = overtimeHours > 0;
      
      unassignedTasks.push({
        ...task,
        duration,
        overtimeHours,
        durationFormatted: formatDuration(duration),
        overtimeFormatted: formatDuration(overtimeHours),
        isLongRunning,
        isCompleted,
        isQuickTask,
        isMediumTask,
        isOvertimeTask,
        hasOvertimeHours
      });
      return;
    }
    
    const duration = calculateDuration(task.time_start, task.time_end, task.createTask);
    const overtimeHours = calculateOvertimeHours(task.time_start, task.time_end, task.createTask);
    const isCompleted = task.time_start && task.time_end && task.time_end.trim() !== '';
    const isLongRunning = duration > 300; // More than 5 hours (300 minutes)
    const isQuickTask = duration <= 30; // 30 minutes or less
    const isMediumTask = duration > 30 && duration <= 120; // 30 minutes to 2 hours
    
    // Check if task was started after 16:00 (overtime)
    const isOvertimeTask = checkIfOvertimeTask(task.time_start, task.createTask);
    const hasOvertimeHours = overtimeHours > 0;
    
    // Ensure task has all required fields
    const taskWithDuration = {
      ...task,
      duration,
      overtimeHours,
      durationFormatted: formatDuration(duration),
      overtimeFormatted: formatDuration(overtimeHours),
      isLongRunning,
      isCompleted,
      isQuickTask,
      isMediumTask,
      isOvertimeTask,
      hasOvertimeHours,
      // Add computed status for consistency
      status: isCompleted ? 'completed' : (task.time_start && task.time_start.trim() !== '' ? 'in_progress' : 'not_started')
    };
    
    if (!userMap.has(task.assignee_username)) {
      userMap.set(task.assignee_username, []);
    }
    userMap.get(task.assignee_username).push(taskWithDuration);
  });
  
  // Calculate statistics for each user
  const userStats = Array.from(userMap.entries()).map(([assignee_username, userTasks]) => {
    const completedTasks = userTasks.filter(task => task.isCompleted);
    const totalWorkTime = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    const longRunningTasks = userTasks.filter(task => task.isLongRunning && task.isCompleted);
    const overtimeTasks = userTasks.filter(task => task.isOvertimeTask && task.isCompleted);
    const tasksWithOvertimeHours = userTasks.filter(task => task.hasOvertimeHours && task.isCompleted);
    const quickTasks = userTasks.filter(task => task.isQuickTask && task.isCompleted);
    const mediumTasks = userTasks.filter(task => task.isMediumTask && task.isCompleted);
    
    // Правильный расчет переработки
    const totalOvertimeHours = completedTasks.reduce((sum, task) => {
      return sum + (task.overtimeHours || 0);
    }, 0);
    
    // Time for tasks started after 16:00 (separate statistic)
    const overtimeWorkTime = overtimeTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
    
    const averageTaskTime = completedTasks.length > 0 ? totalWorkTime / completedTasks.length : 0;
    
    // Current tasks in progress (started but not completed)
    const currentTasks = userTasks.filter(task => 
      task.time_start && task.time_start.trim() !== '' && 
      (!task.time_end || task.time_end.trim() === '')
    );
    
    // Tasks not started (created but not yet started)
    const notStartedTasks = userTasks.filter(task => 
      (!task.time_start || task.time_start.trim() === '') &&
      (!task.time_end || task.time_end.trim() === '')
    );
    
    // Remove duplicates from task arrays
    const removeDuplicates = (tasks) => {
      const seen = new Set();
      return tasks.filter(task => {
        if (seen.has(task.taskid)) return false;
        seen.add(task.taskid);
        return true;
      });
    };
    
    return {
      assignee_username,
      taskCount: userTasks.length,
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      totalWorkTime,
      longRunningTasks: removeDuplicates(longRunningTasks),
      overtimeTasks: removeDuplicates(overtimeTasks),
      tasksWithOvertimeHours: removeDuplicates(tasksWithOvertimeHours),
      quickTasks: removeDuplicates(quickTasks),
      mediumTasks: removeDuplicates(mediumTasks),
      overtimeWorkTime,
      totalOvertimeHours,
      averageTaskTime,
      currentTasks: removeDuplicates(currentTasks),
      notStartedTasks: removeDuplicates(notStartedTasks),
      tasks: removeDuplicates(userTasks).sort((a, b) => b.duration - a.duration)
    };
  });
  
  return {
    userStats: userStats.sort((a, b) => b.totalWorkTime - a.totalWorkTime),
    unassignedTasks: unassignedTasks.reduce((acc, task) => {
      const exists = acc.find(t => t.taskid === task.taskid);
      if (!exists) acc.push(task);
      return acc;
    }, [])
  };
}

export function checkIfOvertimeTask(timeStart, createTask) {
  if (!timeStart) return false;
  
  const startDate = parseDateTime(timeStart, createTask?.split(' ')[0]);
  
  if (!startDate || isNaN(startDate.getTime())) return false;
  
  const hour = startDate.getHours();
  // Переработка - это работа после 16:00, но не позже 23:00
  return hour >= 16 && hour < 23;
}
export function getAvailableMonths(tasks) {
  const months = new Set();
  
  tasks.forEach(task => {
    // Используем createTask если есть, иначе пытаемся извлечь из time_start или time_end
    let dateStr = task.createTask;
    if (!dateStr && task.time_end && task.time_end.includes('-')) {
      dateStr = task.time_end;
    }
    if (!dateStr && task.time_start && task.time_start.includes('-')) {
      dateStr = task.time_start;
    }
    
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    }
  });
  
  return Array.from(months).sort().reverse(); // Сортируем по убыванию (новые месяцы первыми)
}

export function filterTasksByMonth(tasks, selectedMonth) {
  if (!selectedMonth || selectedMonth === 'all') {
    return tasks;
  }
  
  const [year, month] = selectedMonth.split('-');
  
  return tasks.filter(task => {
    // Используем createTask если есть, иначе пытаемся извлечь из time_start или time_end
    let dateStr = task.createTask;
    if (!dateStr && task.time_end && task.time_end.includes('-')) {
      dateStr = task.time_end;
    }
    if (!dateStr && task.time_start && task.time_start.includes('-')) {
      dateStr = task.time_start;
    }
    
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const taskYear = date.getFullYear().toString();
        const taskMonth = String(date.getMonth() + 1).padStart(2, '0');
        return taskYear === year && taskMonth === month;
      }
    }
    
    return false;
  });
}

export function formatMonthName(monthKey) {
  if (!monthKey || monthKey === 'all') return 'Все месяцы';
  
  const [year, month] = monthKey.split('-');
  const date = new Date(year, month - 1);
  
  return date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long' 
  });
}