'use client';

import { useAuthStore } from '@/store/authStore';
import { Bell, UserCircle } from 'lucide-react';

export default function TopNav() {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-20 border-b border-white/5 bg-brand-navy/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
            <div>
                <h2 className="text-xl font-semibold text-white">Dashboard</h2>
                <p className="text-sm text-brand-gray">Welcome back, {user?.name || 'User'}</p>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-brand-gray hover:text-white transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-navy"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-brand-gray">{user?.email}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-brand-blue" />
                    </div>
                </div>
            </div>
        </header>
    );
}
