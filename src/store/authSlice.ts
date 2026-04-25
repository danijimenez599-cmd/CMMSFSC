import { StateCreator } from 'zustand';
import { User } from '../shared/types';
import { supabase } from '../lib/supabase';
import { defaultUsers } from '../data/defaults';

export interface AuthSlice {
  currentUser: User | null;
  users: User[];
  authLoading: boolean;

  setCurrentUser: (user: User | null) => void;
  fetchProfiles: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
  loginAsDev: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], []> = (set, get) => ({
  currentUser: null,
  users: defaultUsers,
  authLoading: true,

  setCurrentUser: (user) => set({ currentUser: user }),

  loginAsDev: () => {
    set({
      currentUser: {
        id: '00000000-0000-4000-a000-000000000000',
        fullName: 'Administrador (Dev)',
        role: 'admin',
        avatarUrl: null,
        specialty: null,
        active: true,
      } as User,
      authLoading: false,
    });
  },

  fetchProfiles: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('active', true);

      if (data && !error && data.length > 0) {
        const mapped: User[] = data.map((p: any) => ({
          id: p.id,
          fullName: p.full_name || p.email || 'Usuario',
          role: p.role || 'technician',
          avatarUrl: p.avatar_url || null,
          specialty: p.specialty || null,
          active: p.active ?? true,
        }));
        set({ users: mapped });
      }
    } catch {
      // Keep default users on error
    }
  },

  signIn: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null });
  },

  initializeAuth: () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            currentUser: {
              id: profile.id,
              fullName: profile.full_name || session.user.email || 'Usuario',
              role: profile.role || 'technician',
              avatarUrl: profile.avatar_url || null,
              specialty: profile.specialty || null,
              active: profile.active ?? true,
            },
            authLoading: false,
          });
        } else {
          set({ authLoading: false });
        }
      } else {
        set({ currentUser: null, authLoading: false });
      }
    });

    get().fetchProfiles();
  },
});
