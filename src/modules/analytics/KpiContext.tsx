import { createContext, useContext, ReactNode } from 'react';
import { useKpiData, Period, KpiData } from './hooks/useKpiData';

const KpiContext = createContext<KpiData | null>(null);

interface ProviderProps {
  period: Period;
  custom?: { from: string; to: string };
  filterPlant?: string;
  filterArea?: string;
  children: ReactNode;
}

export function KpiProvider({ period, custom, filterPlant, filterArea, children }: ProviderProps) {
  const data = useKpiData(period, custom, filterPlant, filterArea);
  return <KpiContext.Provider value={data}>{children}</KpiContext.Provider>;
}

export function useKpiContext(): KpiData {
  const ctx = useContext(KpiContext);
  if (!ctx) throw new Error('useKpiContext debe usarse dentro de <KpiProvider>');
  return ctx;
}
