import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CustomizationContext = createContext();

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

const DEFAULT_LAYOUT = [
  { id: 'overall-stats', type: 'overall-stats', position: 0, visible: true },
  { id: 'smart-notifications', type: 'smart-notifications', position: 1, visible: true },
  { id: 'workload-forecast', type: 'workload-forecast', position: 2, visible: true },
  { id: 'advanced-analytics', type: 'advanced-analytics', position: 3, visible: true },
  { id: 'team-management', type: 'team-management', position: 4, visible: true },
  { id: 'alerts', type: 'alerts', position: 5, visible: true },
  { id: 'unassigned-tasks', type: 'unassigned-tasks', position: 6, visible: true },
  { id: 'incomplete-tasks', type: 'incomplete-tasks', position: 7, visible: true },
  { id: 'productivity', type: 'productivity', position: 8, visible: true },
  { id: 'timeline', type: 'timeline', position: 9, visible: true },
  { id: 'heatmap', type: 'heatmap', position: 10, visible: true },
  { id: 'filters', type: 'filters', position: 11, visible: true },
  { id: 'export', type: 'export', position: 12, visible: true },
  { id: 'user-list', type: 'user-list', position: 13, visible: true }
];

const THEMES = {
  light: {
    name: 'Светлая',
    colors: {
      background: 'bg-gray-50',
      cardBackground: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      primary: 'text-blue-600',
      accent: 'bg-blue-600'
    }
  },
  dark: {
    name: 'Темная',
    colors: {
      background: 'bg-gray-900',
      cardBackground: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      primary: 'text-blue-400',
      accent: 'bg-blue-500'
    }
  },
  blue: {
    name: 'Синяя',
    colors: {
      background: 'bg-blue-50',
      cardBackground: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-blue-700',
      border: 'border-blue-200',
      primary: 'text-blue-700',
      accent: 'bg-blue-700'
    }
  },
  green: {
    name: 'Зеленая',
    colors: {
      background: 'bg-green-50',
      cardBackground: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-green-700',
      border: 'border-green-200',
      primary: 'text-green-700',
      accent: 'bg-green-600'
    }
  }
};

export const CustomizationProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState('default');
  const [theme, setTheme] = useState('light');
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [customMetrics, setCustomMetrics] = useState([]);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`dashboard-settings-${currentUser}`);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTheme(settings.theme || 'light');
        
        // Merge saved layout with default layout to ensure new widgets appear
        const savedLayout = settings.layout || [];
        const mergedLayout = DEFAULT_LAYOUT.map(defaultWidget => {
          const savedWidget = savedLayout.find(w => w.id === defaultWidget.id);
          return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
        });
        
        setLayout(mergedLayout);
        setCustomMetrics(settings.customMetrics || []);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLayout(DEFAULT_LAYOUT);
      }
    }
  }, [currentUser]);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    const settings = {
      theme,
      layout,
      customMetrics
    };
    localStorage.setItem(`dashboard-settings-${currentUser}`, JSON.stringify(settings));
  }, [theme, layout, customMetrics, currentUser]);

  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  const updateLayout = (newLayout) => {
    setLayout(newLayout);
  };

  const toggleWidget = (widgetId) => {
    setLayout(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  };

  const moveWidget = (widgetId, newPosition) => {
    setLayout(prev => {
      const widget = prev.find(w => w.id === widgetId);
      const otherWidgets = prev.filter(w => w.id !== widgetId);
      
      return [
        ...otherWidgets.slice(0, newPosition),
        { ...widget, position: newPosition },
        ...otherWidgets.slice(newPosition)
      ].map((w, index) => ({ ...w, position: index }));
    });
  };

  const addCustomMetric = (metric) => {
    setCustomMetrics(prev => [...prev, { ...metric, id: Date.now() }]);
  };

  const removeCustomMetric = (metricId) => {
    setCustomMetrics(prev => prev.filter(m => m.id !== metricId));
  };

  const resetToDefault = () => {
    setTheme('light');
    setLayout(DEFAULT_LAYOUT);
    setCustomMetrics([]);
    localStorage.removeItem(`dashboard-settings-${currentUser}`);
  };

  const value = {
    currentUser,
    setCurrentUser,
    theme,
    setTheme,
    themes: THEMES,
    layout,
    updateLayout,
    toggleWidget,
    moveWidget,
    customMetrics,
    addCustomMetric,
    removeCustomMetric,
    isCustomizing,
    setIsCustomizing,
    resetToDefault,
    saveSettings
  };

  return (
    <CustomizationContext.Provider value={value}>
      <div className={THEMES[theme].colors.background}>
        {children}
      </div>
    </CustomizationContext.Provider>
  );
};