'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    ArrowLeft,
    ShieldCheck,
    AlertTriangle,
    AlertCircle,
    FileText,
    Activity,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface BillDetail {
    id: number;
    hospital_name: string;
    hospital_city: string;
    status: string;
    total_amount: number;
    created_at: string;
}

interface LineItem {
    id: number;
    raw_description: string;
    normalized_category: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    flag: 'OK' | 'SUSPICIOUS' | 'OVERCHARGED';
    flag_reason: string;
    benchmark_max: number | null;
    benchmark_source: string | null;
}

interface AuditReport {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    total_flagged_amount: number;
    potential_recovery_amount: number;
    confidence_score: number;
    plain_language_summary: string;
    summary_json: any;
}

export default function AuditReportPage() {
    const params = useParams();
    const router = useRouter();
    const billId = params.id as string;

    const [bill, setBill] = useState<BillDetail | null>(null);
    const [items, setItems] = useState<LineItem[]>([]);
    const [report, setReport] = useState<AuditReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [billRes, itemsRes, reportRes] = await Promise.all([
                    api.get(`/bills/${billId}`),
                    api.get(`/bills/${billId}/items`),
                    api.get(`/bills/${billId}/audit-report`).catch(() => ({ data: null }))
                ]);

                setBill(billRes.data);
                setItems(itemsRes.data);
                if (reportRes.data) setReport(reportRes.data);
            } catch (error) {
                console.error('Failed to load report data', error);
                toast.error('Could not load audit report details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [billId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Report Not Found</h2>
                <button onClick={() => router.push('/dashboard')} className="btn-primary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const isHighRisk = report?.risk_level === 'HIGH';
    const isMediumRisk = report?.risk_level === 'MEDIUM';

    return (
        <div className="space-y-8 animate-fade-in pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-brand-gray hover:text-white flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">Audit Report</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border
              ${bill.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'}
            `}>
                            {bill.status}
                        </span>
                    </div>
                    <p className="text-brand-gray flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {bill.hospital_name || 'Unknown Hospital'} • {format(new Date(bill.created_at), 'MMM dd, yyyy')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="btn-secondary">Download PDF</button>
                    {report && (isHighRisk || isMediumRisk) && (
                        <button className="btn-primary bg-red-500 hover:bg-red-600 text-white shadow-red-500/20">
                            Generate Dispute Letter
                        </button>
                    )}
                </div>
            </div>

            {report ? (
                <>
                    {/* Executive Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass-card p-6 rounded-2xl">
                            <p className="text-sm font-medium text-brand-gray mb-1">Total Billed</p>
                            <h3 className="text-3xl font-bold text-white">₹{bill.total_amount?.toLocaleString() || '0'}</h3>
                            <p className="text-xs text-brand-gray mt-2">{items.length} line items analyzed</p>
                        </div>

                        <div className={`glass-card p-6 rounded-2xl border ${isHighRisk ? 'border-red-500/30 bg-red-500/5' : isMediumRisk ? 'border-amber-500/30' : 'border-green-500/30'}`}>
                            <p className="text-sm font-medium text-brand-gray mb-1">Overcharges Found</p>
                            <h3 className={`text-3xl font-bold ${isHighRisk ? 'text-red-400' : isMediumRisk ? 'text-amber-400' : 'text-green-400'}`}>
                                ₹{report.total_flagged_amount.toLocaleString()}
                            </h3>
                            <p className="text-xs text-brand-gray mt-2">
                                Potential recovery: <span className="text-white font-medium">₹{report.potential_recovery_amount.toLocaleString()}</span>
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-2xl">
                            <p className="text-sm font-medium text-brand-gray mb-1">Risk Level</p>
                            <div className="flex items-center gap-3">
                                {isHighRisk ? <AlertTriangle className="w-8 h-8 text-red-500" /> :
                                    isMediumRisk ? <AlertCircle className="w-8 h-8 text-amber-500" /> :
                                        <ShieldCheck className="w-8 h-8 text-green-500" />}
                                <h3 className={`text-2xl font-bold ${isHighRisk ? 'text-red-400' : isMediumRisk ? 'text-amber-400' : 'text-green-400'}`}>
                                    {report.risk_level}
                                </h3>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl">
                            <p className="text-sm font-medium text-brand-gray mb-1">AI Confidence</p>
                            <div className="flex items-center gap-3">
                                <Activity className="w-8 h-8 text-brand-blue" />
                                <h3 className="text-2xl font-bold text-white">{(report.confidence_score * 100).toFixed(1)}%</h3>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary Narrative */}
                    <div className="glass-card p-8 rounded-2xl border border-brand-blue/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue"></div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-brand-blue" /> AI Auditor Summary
                        </h3>
                        <div className="prose prose-invert max-w-none">
                            {report.plain_language_summary.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="text-brand-gray leading-relaxed mb-4 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Line Item Breakdown</h3>
                        <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider w-1/3">Description</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Billed Amount</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider text-right">Gov Limit (Max)</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-brand-gray uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-white">{item.raw_description}</p>
                                                    {item.flag_reason && item.flag !== 'OK' && (
                                                        <p className="text-xs text-red-400/80 mt-1">{item.flag_reason}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-xs text-brand-gray bg-white/5 px-2 py-1 rounded-md">
                                                        {item.normalized_category.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-medium text-white">₹{item.total_price.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm text-brand-gray">
                                                        {item.benchmark_max ? `₹${item.benchmark_max.toLocaleString()}` : '--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {item.flag === 'OK' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                        {item.flag === 'SUSPICIOUS' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                                        {item.flag === 'OVERCHARGED' && <XCircle className="w-4 h-4 text-red-500" />}

                                                        <span className={`text-xs font-bold ${item.flag === 'OK' ? 'text-green-500' :
                                                                item.flag === 'SUSPICIOUS' ? 'text-amber-500' :
                                                                    'text-red-500'
                                                            }`}>
                                                            {item.flag}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
                    <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Analysis in Progress</h3>
                    <p className="text-brand-gray">Our AI is extracting line items and checking them against government benchmarks...</p>
                </div>
            )}
        </div>
    );
}
