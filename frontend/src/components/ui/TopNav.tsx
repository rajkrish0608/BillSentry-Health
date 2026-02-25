'use client';

import { useAuthStore } from '@/store/authStore';
import { Bell, UserCircle } from 'lucide-react';

export default function TopNav() {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-24 border-b border-gray-200 bg-white backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-30 transition-all duration-300">
            <div>
                <h2 className="text-2xl font-bold text-black tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>Dashboard</h2>
                <p className="text-[15px] text-gray-500 mt-1">Status: <span className="text-black font-medium">Monitoring Active</span></p>
            </div>

            <div className="flex items-center gap-8">
                <button className="relative text-gray-500 hover:text-black transition-colors duration-300">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full"></span>
                </button>

                <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
                    <div className="text-right hidden md:block">
                        <p className="text-[15px] font-semibold text-black tracking-wide">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500 font-medium tracking-wider">{user?.email || 'SYS_OP'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-black/10 to-transparent border border-black/20 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] cursor-pointer hover:border-black/40 transition-colors">
                        <UserCircle className="w-6 h-6 text-black" />
                    </div>
                </div>
            </div>
        </header>
    );
}
