'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Loader2, ArrowUpRight, Search, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Bill {
    id: number;
    hospital_name: string | null;
    total_amount: number | null;
    status: string;
    created_at: string;
}

export default function MyBillsPage() {
    const router = useRouter();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        try {
            const res = await api.get('/bills/');
            setBills(res.data);
        } catch (error) {
            console.error('Failed to fetch bills', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Bills</h1>
                    <p className="text-brand-gray">View and manage a secure repository of all your uploaded hospital bills and audit reports.</p>
                </div>
                <Link href="/dashboard" className="btn-primary flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> Upload New Bill
                </Link>
            </div>

            {/* Content Area */}
            {bills.length === 0 ? (
                <div className="glass-card mt-8 p-16 rounded-3xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="w-24 h-24 bg-gradient-to-br from-brand-blue/20 to-brand-teal/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 relative z-10">
                        <FileText className="w-12 h-12 text-brand-blue" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 relative z-10">No Processing History</h2>
                    <p className="text-brand-gray text-lg mb-8 max-w-md relative z-10 leading-relaxed">
                        You haven't uploaded any hospital bills yet. Discover how much you've been overcharged by letting our AI analyze your first bill today.
                    </p>
                    <Link href="/dashboard" className="btn-primary flex items-center gap-2 px-8 py-4 text-lg shadow-brand-blue/20 relative z-10 hover:scale-105 transition-transform">
                        Start First Audit <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 mt-6">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="w-5 h-5 text-brand-gray absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by hospital name..."
                                className="w-full bg-brand-navy border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                            />
                        </div>
                        <span className="text-xs text-brand-gray bg-brand-navy px-3 py-1.5 rounded-full font-medium ml-4 shrink-0">
                            {bills.length} Total Records
                        </span>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-brand-navy/50 sticky top-0 z-10">
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider w-1/3">Hospital Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Total Billed</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Added On</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/bills/${bill.id}`)}>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                    <FileText className="w-5 h-5 text-brand-gray" />
                                                </div>
                                                <span className="font-bold text-white text-base">
                                                    {bill.hospital_name || 'Unknown Provider'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <span className="text-white font-bold text-base">
                                                {bill.total_amount ? `₹${bill.total_amount.toLocaleString()}` : '--'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border
                      ${bill.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    bill.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                                            >
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-brand-gray text-sm">
                                            {format(new Date(bill.created_at), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                                            <button className="text-brand-blue hover:text-white flex items-center justify-end gap-1 ml-auto transition-all font-semibold">
                                                View <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
