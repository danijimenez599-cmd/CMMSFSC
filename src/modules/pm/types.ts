export type TriggerType = 'calendar' | 'meter' | 'hybrid';
export type IntervalUnit = 'days' | 'weeks' | 'months' | 'years';
export type IntervalMode = 'fixed' | 'floating';
export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export interface PmPlan {
  id: string;
  name: string;
  description: string | null;
  triggerType: TriggerType;
  intervalValue: number | null;
  intervalUnit: IntervalUnit | null;
  intervalMode: IntervalMode;
  leadDays: number;
  meterIntervalValue: number | null;
  meterIntervalUnit: string | null;
  estimatedDuration: number | null;
  criticality: Criticality;
  createdAt: string;
}

export interface PmTask {
  id: string;
  pmPlanId: string;
  description: string;
  sortOrder: number;
  frequencyMultiplier: number; // Nuevo
}

export interface AssetPlan {
  id: string;
  assetId: string;
  pmPlanId: string;
  measurementPointId: string | null;
  nextDueDate: string | null;
  nextDueMeter: number | null;
  lastCompletedAt: string | null;
  woCount: number;
  currentCycleIndex: number; // Nuevo
  active: boolean;
  createdAt: string;
}

export interface MeasurementConfig {
  id: string;
  name: string;
  unit: string;
  isCumulative: boolean;
  createdAt: string;
}

export interface MeasurementPoint {
  id: string;
  assetId: string;
  configId: string | null;
  name: string;
  unit: string;
  currentValue: number | null;
  minThreshold: number | null;
  maxThreshold: number | null;
  triggerWoTitle: string | null;
  triggerPriority: string;
  lastTriggerAt: string | null;
  lastReadingAt: string | null;
}

export interface MeterReading {
  id: string;
  measurementPointId: string;
  value: number;
  readingAt: string;
  recordedBy: string | null;
}
