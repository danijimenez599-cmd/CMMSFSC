import { StateCreator } from 'zustand';
import { AppModule, ToastPayload } from '../shared/types';
import { generateId } from '../shared/utils/utils';

export interface UiSlice {
  activeModule: AppModule;
  sidebarOpen: boolean;
  toast: ToastPayload | null;
  setModule: (module: AppModule) => void;
  toggleSidebar: () => void;
  showToast: (payload: Omit<ToastPayload, 'id'>) => void;
  dismissToast: () => void;
  isAuditMode: boolean;
  setAuditMode: (enabled: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], []> = (set) => ({
  activeModule: 'dashboard',
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  toast: null,

  setModule: (module) => set({ activeModule: module }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  showToast: (payload) => {
    const id = generateId();
    set({ toast: { ...payload, id } });
    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, 4500);
  },

  dismissToast: () => set({ toast: null }),

  isAuditMode: false,
  setAuditMode: (enabled) => set({ isAuditMode: enabled }),
});
