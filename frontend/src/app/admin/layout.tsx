'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/ui/Sidebar';
import TopNav from '@/components/ui/TopNav';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    // Handle client-side auth redirection
    useEffect(() => {
        if (mounted && !isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!user?.is_admin) {
                toast.error('Unauthorized access');
                router.push('/dashboard');
            }
        }
    }, [mounted, isLoading, isAuthenticated, user, router]);

    // Show a loading state while checking auth
    if (!mounted || isLoading || !isAuthenticated || !user?.is_admin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - fixed width */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-8 bg-[url('/grid.svg')] bg-center bg-fixed">
                    <div className="absolute inset-0 bg-gray-50/90 pointer-events-none -z-10" />
                    <div className="max-w-6xl mx-auto z-10 relative">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
