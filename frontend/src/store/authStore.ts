import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface User {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    is_admin: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: (token, user) => {
                set({ token, user, isAuthenticated: true, isLoading: false });
            },

            logout: () => {
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            },

            checkAuth: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false, isLoading: false });
                    return;
                }

                try {
                    set({ isLoading: true });
                    const res = await api.get('/auth/me');
                    set({ user: res.data, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage', // key in local storage
        }
    )
);
