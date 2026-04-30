import { useEffect, useState } from 'react';

export interface KpiTargets {
  pmCompliance: number;        // % objetivo
  slaCompliance: number;       // % objetivo
  preventiveRatio: number;     // % preventivo / total (clase mundial: 80%)
  scheduleCompliance: number;  // %
  mttrHours: number;           // máximo tolerable
  overdueMax: number;          // # máximo aceptable
}

export const DEFAULT_TARGETS: KpiTargets = {
  pmCompliance: 80,
  slaCompliance: 80,
  preventiveRatio: 70,
  scheduleCompliance: 80,
  mttrHours: 8,
  overdueMax: 0,
};

const STORAGE_KEY = 'apex.kpiTargets.v1';

export function loadTargets(): KpiTargets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TARGETS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TARGETS, ...parsed };
  } catch {
    return DEFAULT_TARGETS;
  }
}

export function saveTargets(t: KpiTargets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
    window.dispatchEvent(new CustomEvent('apex:kpiTargets:changed'));
  } catch {}
}

export function useKpiTargets(): [KpiTargets, (t: KpiTargets) => void] {
  const [targets, setTargets] = useState<KpiTargets>(() => loadTargets());

  useEffect(() => {
    const handler = () => setTargets(loadTargets());
    window.addEventListener('apex:kpiTargets:changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('apex:kpiTargets:changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const update = (t: KpiTargets) => {
    saveTargets(t);
    setTargets(t);
  };

  return [targets, update];
}
