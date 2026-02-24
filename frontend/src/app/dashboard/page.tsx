'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, AlertTriangle, ShieldCheck, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Bill {
    id: number;
    hospital_name: string | null;
    total_amount: number | null;
    status: string;
    created_at: string;
}

export default function DashboardOverview() {
    const router = useRouter();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchBills = async () => {
        try {
            const res = await api.get('/bills/');
            setBills(res.data);
        } catch (error) {
            console.error('Failed to fetch bills', error);
            toast.error('Could not load recent bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (file.size > 15 * 1024 * 1024) {
            toast.error('File size must be under 15MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const uploadToast = toast.loading('Uploading and analyzing your bill...');

        try {
            const res = await api.post('/bills/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Bill processed successfully!', { id: uploadToast });
            fetchBills();

            // Auto-redirect to the detailed report
            if (res.data.bill_id) {
                router.push(`/dashboard/bills/${res.data.bill_id}`);
            }
        } catch (error: any) {
            console.error('Upload failed', error);
            toast.error(error.response?.data?.detail || 'Failed to upload bill', { id: uploadToast });
        } finally {
            setUploading(false);
        }
    }, [router]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxFiles: 1,
        disabled: uploading
    });

    // Calculate some dummy stats for now (could be derived from bills later)
    const totalBills = bills.length;
    const processingCount = bills.filter(b => b.status === 'UPLOADED' || b.status === 'PROCESSING').length;

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Audit Dashboard</h1>
                <p className="text-brand-gray">Upload hospital bills for instant AI verification against government benchmarks.</p>
            </div>

            {/* Upload Widget */}
            <div
                {...getRootProps()}
                className={`glass-card p-10 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center mb-4">
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    ) : (
                        <UploadCloud className="w-8 h-8 text-brand-blue" />
                    )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    {uploading ? 'AI Analysis in Progress...' : 'Drag & Drop your Hospital Bill'}
                </h3>
                <p className="text-brand-gray max-w-md mx-auto mb-6">
                    {uploading
                        ? 'Extracting line items, checking government benchmarks, and detecting potential overcharges.'
                        : 'Supports PDF, JPG, and PNG files up to 15MB. Ensure line items are clearly legible.'}
                </p>
                <button className="btn-primary pointer-events-none" disabled={uploading}>
                    {uploading ? 'Processing...' : 'Browse Files'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-gray">Total Bills Audited</p>
                            <h4 className="text-2xl font-bold text-white">{totalBills}</h4>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-green-500/20 bg-gradient-to-br from-brand-navy-light to-green-900/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-gray">Potential Savings Found</p>
                            <h4 className="text-2xl font-bold text-green-400">---</h4>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-gray">Pending Reviews</p>
                            <h4 className="text-2xl font-bold text-white">{processingCount}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bills Table */}
            <div>
                <div className="flex items-end justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Audits</h2>
                    <button className="text-brand-blue hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                        </div>
                    ) : bills.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="w-20 h-20 bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/5 relative z-10">
                                <FileText className="w-10 h-10 text-brand-blue/50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Ready for your first audit</h3>
                            <p className="text-brand-gray max-w-sm mx-auto relative z-10">
                                Drag and drop a hospital bill in the widget above to instantly benchmark it against government pricing.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Hospital & Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Total Billed</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bills.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{bill.hospital_name || 'Unknown Hospital'}</span>
                                                    <span className="text-xs text-brand-gray">{format(new Date(bill.created_at), 'MMM dd, yyyy • h:mm a')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-white font-medium">
                                                    {bill.total_amount ? `₹${bill.total_amount.toLocaleString()}` : '--'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${bill.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        bill.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                                                >
                                                    {bill.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/dashboard/bills/${bill.id}`)}
                                                    className="text-brand-blue hover:text-white flex items-center justify-end gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-all font-semibold"
                                                >
                                                    View Report <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
