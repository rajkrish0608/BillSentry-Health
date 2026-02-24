'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Benchmark {
    id: number;
    code: string;
    name: string;
    category: string;
    city: string | null;
    benchmark_max: number;
    source: string;
    created_at: string;
}

export default function BenchmarksPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBenchmarks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/benchmarks');
            setBenchmarks(res.data.items);
        } catch (error) {
            console.error("Failed to fetch benchmarks", error);
            toast.error("Could not load benchmarks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBenchmarks();
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        const uploadToast = toast.loading('Importing benchmarks...');

        try {
            const res = await api.post('/admin/benchmarks/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message || 'Benchmarks imported successfully', { id: uploadToast });
            fetchBenchmarks(); // Refresh the table
        } catch (error: any) {
            console.error('Upload failed', error);
            toast.error(error.response?.data?.detail || 'Failed to upload benchmarks', { id: uploadToast });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <Link href="/admin" className="text-brand-gray hover:text-white flex items-center gap-2 mb-4 transition-colors w-max">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Manage Benchmarks</h1>
                    <p className="text-brand-gray">Upload and review government rate lists (CGHS, NPPA).</p>
                </div>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                    <button
                        onClick={handleUploadClick}
                        disabled={uploading}
                        className="btn-primary flex items-center gap-2 shadow-brand-blue/20"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {uploading ? 'Uploading...' : 'Upload CSV Rates'}
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-blue" />
                        Active Rate Rules
                    </h3>
                    <span className="text-xs text-brand-gray bg-brand-navy px-2 py-1 rounded w-max">
                        {benchmarks.length} rules loaded
                    </span>
                </div>

                <div className="overflow-x-auto max-h-[600px]">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                        </div>
                    ) : benchmarks.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-brand-navy z-10 border-b border-white/5 shadow-md">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Code / Desc</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">City</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Max Limit</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {benchmarks.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-white">{item.code}</p>
                                            <p className="text-xs text-brand-gray mt-1 truncate max-w-xs">{item.name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-brand-gray bg-white/5 px-2 py-1 rounded-md">
                                                {item.category.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray">
                                            {item.city || 'ALL'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-white">₹{item.benchmark_max.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.source === 'CGHS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    item.source === 'NPPA' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                        'bg-brand-gray/10 text-brand-gray border border-white/10'
                                                }`}>
                                                {item.source}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-brand-gray">
                            <p>No benchmarks found. Upload a CSV to populate the rate engine.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
