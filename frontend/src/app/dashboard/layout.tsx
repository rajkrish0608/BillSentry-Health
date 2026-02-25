'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/ui/Sidebar';
import TopNav from '@/components/ui/TopNav';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            checkAuth();
        }
    }, [checkAuth, mounted]);

    // Handle client-side auth redirection
    useEffect(() => {
        if (mounted && !isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isLoading, isAuthenticated, router]);

    // Show a loading state while checking auth
    if (!mounted || isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-brand-navy flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-navy flex">
            {/* Sidebar - fixed width */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-[280px] flex flex-col h-screen overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-8 bg-[url('/grid.svg')] bg-center relative">
                    <div className="absolute inset-0 bg-[#050505]/95 pointer-events-none -z-10" />
                    <div className="max-w-6xl mx-auto z-10 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
