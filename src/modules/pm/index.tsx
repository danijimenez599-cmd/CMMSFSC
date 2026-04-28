import React, { useState, useEffect } from 'react';
import PlansView from './components/PlansView';
import PmSchedulerPanel from './components/PmSchedulerPanel';
import PmKanbanView from './components/PmKanbanView';
import { FileText, Cpu, LayoutGrid } from 'lucide-react';
import { cn } from '../../shared/components';
import { useStore } from '../../store';

const TABS = [
  { id: 'plans', label: 'Planes PM', shortLabel: 'Planes', icon: <FileText size={16} /> },
  { id: 'scheduler', label: 'Motor', shortLabel: 'Motor', icon: <Cpu size={16} /> },
  { id: 'kanban', label: 'Agenda Kanban', shortLabel: 'Agenda', icon: <LayoutGrid size={16} /> },
];

// Extend TabId so that 'kanban' is included. Since TABS is not a const array with "as const", 
// typeof TABS[number]['id'] will be 'string'. But let's just make it a string type for safety.

type TabId = typeof TABS[number]['id'];

interface PmEngineViewProps {
  mode?: 'plans' | 'scheduler';
}

export default function PmEngineView({ mode = 'plans' }: PmEngineViewProps) {
  const { fetchPmData } = useStore() as any;
  const [activeTab, setActiveTab] = useState<string>(mode === 'plans' ? 'plans' : 'kanban');

  useEffect(() => { 
    fetchPmData(); 
  }, []);

  // Filter tabs based on mode
  const visibleTabs = mode === 'plans' 
    ? TABS.filter(t => t.id === 'plans')
    : TABS.filter(t => t.id !== 'plans');

  return (
    <div className="flex flex-col h-full bg-bg-app">
      {/* Tab bar - Only show if there's more than 1 tab or if we are in scheduler mode */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-2 flex items-center gap-1 sticky top-0 z-10">
        <div className="flex gap-1 bg-bg-3 p-1 rounded-xl border border-border">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-tx-3 hover:text-tx'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'plans' && <PlansView />}
        {activeTab === 'scheduler' && <PmSchedulerPanel />}
        {activeTab === 'kanban' && <PmKanbanView />}
      </div>
    </div>
  );
}
