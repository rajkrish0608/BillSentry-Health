'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, FileText, AlertTriangle, Activity, Loader2 } from 'lucide-react';

interface AdminMetrics {
    total_users: number;
    total_bills_processed: number;
    total_overcharges_detected: number;
    total_potential_recovery: number;
}

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/admin/metrics');
                setMetrics(res.data);
            } catch (error) {
                console.error("Failed to fetch admin metrics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Global System Metrics</h1>
                    <p className="text-brand-gray">Platform-wide statistics and overall performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-brand-blue" />
                    </div>
                    <p className="text-sm font-medium text-brand-gray mb-1 relative z-10">Total Users</p>
                    <h3 className="text-4xl font-bold text-white relative z-10">{metrics?.total_users || 0}</h3>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-16 h-16 text-brand-teal" />
                    </div>
                    <p className="text-sm font-medium text-brand-gray mb-1 relative z-10">Bills Processed</p>
                    <h3 className="text-4xl font-bold text-white relative z-10">{metrics?.total_bills_processed || 0}</h3>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-red-500/20 bg-red-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-brand-gray mb-1 relative z-10">Overcharges Found</p>
                    <h3 className="text-4xl font-bold text-red-400 relative z-10">
                        ₹{metrics?.total_overcharges_detected?.toLocaleString() || 0}
                    </h3>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-green-500/20 bg-green-500/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-16 h-16 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-brand-gray mb-1 relative z-10">Potential Recovery</p>
                    <h3 className="text-4xl font-bold text-green-400 relative z-10">
                        ₹{metrics?.total_potential_recovery?.toLocaleString() || 0}
                    </h3>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="/admin/benchmarks" className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer block border border-brand-blue/30">
                        <h3 className="text-lg font-bold text-brand-blue mb-2">Manage Benchmarks</h3>
                        <p className="text-sm text-brand-gray">Upload CGHS, NPPA, or state rate lists to fuel the AI engine.</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
