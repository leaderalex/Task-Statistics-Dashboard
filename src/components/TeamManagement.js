import React, { useMemo, useState } from 'react';
import { CollapsibleWidget } from './CollapsibleWidget';
import { Users, Award, TrendingUp, Star, Clock, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { formatDuration } from '../utils/dataProcessor';

export function TeamManagement({ userStats, allTasks }) {
  const [expandedUser, setExpandedUser] = useState(null);
  
  const teamAnalytics = useMemo(() => {
    // Рейтинг эффективности
    const rankedUsers = userStats
      .filter(user => user.completedTasks > 0)
      .map(user => {
        // Комплексный скор эффективности
        const completionRate = user.totalTasks > 0 ? (user.completedTasks / user.totalTasks) * 100 : 0;
        const avgTaskTime = user.averageTaskTime || 0;
        const quickTasksRatio = user.completedTasks > 0 ? (user.quickTasks.length / user.completedTasks) * 100 : 0;
        const overtimeRatio = user.completedTasks > 0 ? (user.overtimeTasks.length / user.completedTasks) * 100 : 0;
        
        // Формула эффективности (0-100)
        let efficiencyScore = 0;
        efficiencyScore += completionRate * 0.3; // 30% - процент завершения
        efficiencyScore += Math.max(0, 100 - (avgTaskTime / 60)) * 0.2; // 20% - скорость (чем быстрее, тем лучше)
        efficiencyScore += quickTasksRatio * 0.2; // 20% - доля быстрых задач
        efficiencyScore += Math.max(0, 100 - overtimeRatio) * 0.15; // 15% - меньше переработок
        efficiencyScore += Math.min(100, user.completedTasks * 5) * 0.15; // 15% - количество задач
        
        return {
          ...user,
          efficiencyScore: Math.round(efficiencyScore),
          completionRate: Math.round(completionRate),
          quickTasksRatio: Math.round(quickTasksRatio),
          overtimeRatio: Math.round(overtimeRatio)
        };
      })
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    
    // Командные цели
    const totalTeamTasks = userStats.reduce((sum, user) => sum + user.totalTasks, 0);
    const totalTeamCompleted = userStats.reduce((sum, user) => sum + user.completedTasks, 0);
    const teamCompletionRate = totalTeamTasks > 0 ? (totalTeamCompleted / totalTeamTasks) * 100 : 0;
    
    // Анализ нагрузки
    const currentTasksDistribution = userStats.map(user => ({
      username: user.assignee_username,
      currentTasks: user.currentTasks?.length || 0,
      capacity: user.completedTasks > 0 ? Math.ceil(user.completedTasks / 4) : 5 // примерная недельная capacity
    }));
    
    // Peer review метрики (симуляция)
    const peerReviewData = rankedUsers.slice(0, 5).map(user => ({
      username: user.assignee_username,
      reviewsGiven: Math.floor(Math.random() * 10) + 1,
      reviewsReceived: Math.floor(Math.random() * 8) + 1,
      avgRating: (Math.random() * 2 + 3).toFixed(1) // 3.0-5.0
    }));
    
    return {
      rankedUsers,
      teamGoals: {
        completionRate: Math.round(teamCompletionRate),
        totalTasks: totalTeamTasks,
        completedTasks: totalTeamCompleted
      },
      workloadDistribution: currentTasksDistribution,
      peerReview: peerReviewData
    };
  }, [userStats, allTasks]);

  const getEfficiencyBadge = (score) => {
    if (score >= 80) return { label: 'Отличная', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Хорошая', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { label: 'Средняя', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Низкая', color: 'bg-red-100 text-red-800' };
  };

  return (
    <CollapsibleWidget
      title="Управление командой"
      icon={Users}
      defaultExpanded={true}
    >
      
      {/* Командные цели */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Прогресс команды"
          value={`${teamAnalytics.teamGoals.completionRate}%`}
          subtitle={`${teamAnalytics.teamGoals.completedTasks}/${teamAnalytics.teamGoals.totalTasks} задач`}
          icon={Target}
          color={teamAnalytics.teamGoals.completionRate > 70 ? 'green' : teamAnalytics.teamGoals.completionRate > 40 ? 'amber' : 'red'}
        />
        
        <StatCard
          title="Активных участников"
          value={teamAnalytics.rankedUsers.length}
          subtitle="с завершенными задачами"
          icon={Users}
          color="blue"
        />
        
        <StatCard
          title="Средняя эффективность"
          value={teamAnalytics.rankedUsers.length > 0 
            ? Math.round(teamAnalytics.rankedUsers.reduce((sum, user) => sum + user.efficiencyScore, 0) / teamAnalytics.rankedUsers.length)
            : 0
          }
          subtitle="из 100 баллов"
          icon={Award}
          color="purple"
        />
      </div>
      
      {/* Рейтинг эффективности */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-gold-500" />
          Рейтинг эффективности команды
        </h3>
        
        <div className="space-y-3">
          {teamAnalytics.rankedUsers.slice(0, 10).map((user, index) => {
            const badge = getEfficiencyBadge(user.efficiencyScore);
            const isExpanded = expandedUser === user.assignee_username;
            
            return (
              <div key={user.assignee_username} className="border border-gray-200 rounded-lg p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedUser(isExpanded ? null : user.assignee_username)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                      {index < 3 && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{user.assignee_username}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{user.completedTasks} задач</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{user.efficiencyScore}</div>
                      <div className="text-xs text-gray-500">баллов</div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Завершение:</span>
                        <div className="font-medium">{user.completionRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Быстрые задачи:</span>
                        <div className="font-medium">{user.quickTasksRatio}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Переработки:</span>
                        <div className="font-medium">{user.overtimeRatio}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Среднее время:</span>
                        <div className="font-medium">{formatDuration(Math.round(user.averageTaskTime))}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Распределение нагрузки */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Текущая нагрузка команды</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamAnalytics.workloadDistribution.map(user => {
            const loadPercentage = user.capacity > 0 ? Math.min(100, (user.currentTasks / user.capacity) * 100) : 0;
            const loadColor = loadPercentage > 80 ? 'bg-red-500' : loadPercentage > 60 ? 'bg-amber-500' : 'bg-green-500';
            
            return (
              <div key={user.username} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{user.username}</span>
                  <span className="text-sm text-gray-600">{user.currentTasks}/{user.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${loadColor}`}
                    style={{ width: `${Math.min(100, loadPercentage)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(loadPercentage)}% загрузки
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Peer Review метрики */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Взаимодействие в команде</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamAnalytics.peerReview.map(user => (
              <div key={user.username} className="bg-white rounded-lg p-3 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-2">{user.username}</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Проверил:</span>
                    <span className="font-medium">{user.reviewsGiven}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Проверили:</span>
                    <span className="font-medium">{user.reviewsReceived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Рейтинг:</span>
                    <span className="font-medium text-yellow-600">⭐ {user.avgRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Рекомендации по команде */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">🎯 Рекомендации по управлению командой:</h4>
        <div className="space-y-2 text-sm text-blue-800">
          {teamAnalytics.rankedUsers.length > 0 && (
            <p>🏆 Лидер команды: <strong>{teamAnalytics.rankedUsers[0].assignee_username}</strong> ({teamAnalytics.rankedUsers[0].efficiencyScore} баллов)</p>
          )}
          {teamAnalytics.workloadDistribution.some(u => (u.currentTasks / u.capacity) > 0.8) && (
            <p>⚠️ Есть перегруженные участники. Рассмотрите перераспределение задач</p>
          )}
          {teamAnalytics.workloadDistribution.some(u => u.currentTasks === 0) && (
            <p>💡 Есть свободные ресурсы. Можно добавить задач недогруженным участникам</p>
          )}
          {teamAnalytics.teamGoals.completionRate < 50 && (
            <p>📈 Низкий процент завершения команды. Нужно проанализировать блокеры</p>
          )}
          {teamAnalytics.rankedUsers.filter(u => u.efficiencyScore < 40).length > 0 && (
            <p>🎓 Некоторым участникам может потребоваться дополнительная поддержка</p>
          )}
        </div>
      </div>
    </CollapsibleWidget>
  );
}