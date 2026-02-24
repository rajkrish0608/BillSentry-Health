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
        <div className="w-64 h-screen bg-brand-navy border-r border-white/5 flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-brand-gray text-transparent bg-clip-text">
                    BillSentry
                </span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-brand-blue/10 text-brand-blue"
                                    : "text-brand-gray hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5", isActive ? "text-brand-blue" : "text-brand-gray group-hover:text-white")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 mt-auto border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
