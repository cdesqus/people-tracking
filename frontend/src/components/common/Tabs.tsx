/**
 * @file Tabs component
 * Tab navigation with multiple content panels
 *
 * @example
 * const [activeTab, setActiveTab] = useState('camera');
 *
 * <Tabs
 *   tabs={[
 *     { id: 'camera', label: 'Cameras', content: <CameraList /> },
 *     { id: 'alerts', label: 'Alerts', content: <AlertList /> }
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 *
 * @example
 * // With icons and pill variant
 * <Tabs
 *   tabs={[
 *     { id: '1', label: 'Active', icon: <CheckIcon />, content: <Active /> },
 *     { id: '2', label: 'Inactive', icon: <XIcon />, content: <Inactive /> }
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="pill"
 * />
 */

import React from 'react';
import { TabsProps } from './types';
import { TRANSITIONS } from './constants';

/**
 * Tabs Component
 *
 * A tabbed interface for switching between multiple content panels.
 *
 * @param {TabsProps} props - Tabs component props
 * @returns {React.ReactElement} Tabs element
 */
const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'line',
  className = '',
  ...rest
}) => {
  const activeTabData = tabs.find((t) => t.id === activeTab);

  const getTabClasses = (tabId: string) => {
    const isActive = tabId === activeTab;

    const baseClasses = `px-4 py-2.5 font-medium inline-flex items-center gap-2 whitespace-nowrap ${TRANSITIONS.base}`;

    if (variant === 'pill') {
      return `${baseClasses} rounded-full ${
        isActive
          ? 'bg-sky-500 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
      }`;
    }

    if (variant === 'card') {
      return `${baseClasses} border border-gray-200 dark:border-slate-700 rounded-t-lg ${
        isActive
          ? 'bg-white dark:bg-slate-800 border-b-0 text-gray-900 dark:text-white'
          : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600'
      }`;
    }

    // Default line variant
    return `${baseClasses} border-b-2 ${
      isActive
        ? 'border-sky-500 text-sky-600 dark:text-sky-400'
        : 'border-transparent text-gray-700 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
    }`;
  };

  return (
    <div className={`w-full ${className}`} {...rest}>
      {/* Tab list */}
      <div
        className={`flex flex-wrap gap-1 border-b border-gray-200 dark:border-slate-700 ${
          variant === 'card' ? 'gap-0 -mb-px' : ''
        }`}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`${getTabClasses(tab.id)} ${
              tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled}
          >
            {tab.icon && <span className="inline-flex">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTabData && (
        <div
          id={`panel-${activeTab}`}
          className="mt-4 animate-in fade-in-50 duration-200"
          role="tabpanel"
          aria-labelledby={activeTab}
        >
          {activeTabData.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;
