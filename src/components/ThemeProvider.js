import React from 'react';
import { useCustomization } from '../contexts/CustomizationContext';

export function ThemeProvider({ children }) {
  const { theme, themes } = useCustomization();
  const themeColors = themes[theme].colors;

  // Apply theme classes to components
  const applyTheme = (element) => {
    if (!element || typeof element !== 'object') return element;
    
    return React.cloneElement(element, {
      className: `${element.props.className || ''} ${themeColors.background}`.trim()
    });
  };

  return (
    <div className={themeColors.background}>
      {children}
    </div>
  );
}