'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
    LayoutDashboard,
    FileText,
    ShieldCheck,
    Settings,
    LogOut,
    Activity,
    Users
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuthStore();

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Bills', href: '/dashboard/bills', icon: FileText },
        { name: 'Audit Reports', href: '/dashboard/audits', icon: ShieldCheck },
        { name: 'Advisor Network', href: '/dashboard/network', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    if (user?.is_admin) {
        navItems.push({ name: 'Admin Panel', href: '/admin', icon: ShieldCheck });
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] }}
            className="w-64 h-[calc(100vh-2rem)] my-4 ml-4 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col fixed left-0 top-0 z-50 overflow-hidden"
            style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
        >
            {/* Logo */}
            <div className="p-8 flex items-center gap-4 border-b border-white/5 relative">
                {/* Subtle top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-50" />

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF]/10 to-[#00E676]/10 border border-[#00F0FF]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                    <Activity className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    BillSentry
                </span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block relative group"
                        >
                            <motion.div
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={clsx(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative z-10",
                                    isActive
                                        ? "bg-white/5 text-[#00F0FF] border border-[#00F0FF]/10 shadow-[inner_0_0_10px_rgba(0,240,255,0.05)]"
                                        : "text-[#8892B0] hover:text-white"
                                )}
                            >
                                {/* Hover background effect */}
                                {!isActive && (
                                    <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                                )}

                                <item.icon className={clsx("w-5 h-5 transition-colors duration-300", isActive ? "text-[#00F0FF]" : "text-[#8892B0] group-hover:text-[#00F0FF]")} />
                                <span style={{ fontFamily: "'Satoshi', sans-serif" }}>{item.name}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 mt-auto border-t border-white/5 relative">
                {/* Subtle bottom glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent blur-sm" />

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </motion.button>
            </div>
        </motion.div>
    );
}
