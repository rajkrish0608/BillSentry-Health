'use client';

import { useAuthStore } from '@/store/authStore';
import { Bell, UserCircle } from 'lucide-react';

export default function TopNav() {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="h-24 border-b border-white/5 bg-[#050505]/40 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-30 transition-all duration-300">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>Dashboard</h2>
                <p className="text-[15px] text-[#8892B0] mt-1">Status: <span className="text-[#00E676] font-medium">Monitoring Active</span></p>
            </div>

            <div className="flex items-center gap-8">
                <button className="relative text-[#8892B0] hover:text-[#00F0FF] transition-colors duration-300">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.5)] rounded-full"></span>
                </button>

                <div className="flex items-center gap-4 border-l border-white/5 pl-8">
                    <div className="text-right hidden md:block">
                        <p className="text-[15px] font-semibold text-white tracking-wide">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-[#8892B0] font-medium tracking-wider">{user?.email || 'SYS_OP'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F0FF]/10 to-transparent border border-[#00F0FF]/20 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,240,255,0.05)] cursor-pointer hover:border-[#00F0FF]/40 transition-colors">
                        <UserCircle className="w-6 h-6 text-[#00F0FF]" />
                    </div>
                </div>
            </div>
        </header>
    );
}
