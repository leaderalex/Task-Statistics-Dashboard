import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CollapsibleWidget({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = true,
  headerColor = 'text-gray-900',
  iconColor = 'text-blue-600'
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className={`text-xl font-bold ${headerColor} flex items-center`}>
          {Icon && <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />}
          {title}
        </h2>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}