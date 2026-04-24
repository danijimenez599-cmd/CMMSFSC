import React, { useState, useEffect } from 'react';
import PlansView from './components/PlansView';
import PmSchedulerPanel from './components/PmSchedulerPanel';
import PmCalendarView from './components/PmCalendarView';
import { Calendar, FileText, Cpu } from 'lucide-react';
import { cn } from '../../shared/components';
import { useStore } from '../../store';

const TABS = [
  { id: 'plans', label: 'Planes PM', shortLabel: 'Planes', icon: <FileText size={16} /> },
  { id: 'scheduler', label: 'Motor', shortLabel: 'Motor', icon: <Cpu size={16} /> },
  { id: 'calendar', label: 'Calendario', shortLabel: 'Cal', icon: <Calendar size={16} /> },
];

type TabId = typeof TABS[number]['id'];

export default function PmEngineView() {
  const { fetchPmData } = useStore() as any;
  const [activeTab, setActiveTab] = useState<TabId>('plans');

  useEffect(() => { fetchPmData(); }, []);

  return (
    <div className="flex flex-col h-full bg-bg-app">
      {/* Tab bar */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-2 flex items-center gap-1 sticky top-0 z-10">
        <h1 className="font-display font-bold text-tx mr-4 hidden sm:block">Mantenimiento Preventivo</h1>
        <div className="flex gap-1 bg-bg-3 p-1 rounded-xl border border-border">
          {TABS.map(tab => (
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
        {activeTab === 'calendar' && <PmCalendarView />}
      </div>
    </div>
  );
}
