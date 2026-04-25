import { StateCreator } from 'zustand';
import { generateId } from '../shared/utils/utils';

export interface MeterAlert {
  id: string;
  type: 'limit' | 'cumulative_reset';
  title: string;
  message: string;
  assetId: string;
  assetName: string;
  pointId: string;
  pointName: string;
  value: number;
  unit: string;
  dismissed: boolean;
  createdAt: string;
}

export interface AlertSlice {
  meterAlerts: MeterAlert[];
  addMeterAlert: (alert: Omit<MeterAlert, 'id' | 'dismissed' | 'createdAt'>) => void;
  dismissMeterAlert: (id: string) => void;
  clearDismissedAlerts: () => void;
}

export const createAlertSlice: StateCreator<AlertSlice, [], []> = (set, get) => ({
  meterAlerts: [],

  addMeterAlert: (alert) => {
    // Avoid duplicate alerts for same point
    const existing = get().meterAlerts.find(
      a => a.pointId === alert.pointId && !a.dismissed
    );
    if (existing) return;

    set(state => ({
      meterAlerts: [
        ...state.meterAlerts,
        {
          ...alert,
          id: generateId(),
          dismissed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  },

  dismissMeterAlert: (id) => {
    set(state => ({
      meterAlerts: state.meterAlerts.map(a =>
        a.id === id ? { ...a, dismissed: true } : a
      ),
    }));
  },

  clearDismissedAlerts: () => {
    set(state => ({
      meterAlerts: state.meterAlerts.filter(a => !a.dismissed),
    }));
  },
});
