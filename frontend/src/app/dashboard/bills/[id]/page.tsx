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
    const [downloading, setDownloading] = useState(false);

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setProcessingPayment(true);
        const res = await loadRazorpayScript();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setProcessingPayment(false);
            return;
        }

        try {
            // Create order on backend
            const orderRes = await api.post('/payments/create-order', {
                bill_id: parseInt(billId),
                plan: "DISPUTE_LETTER"
            });
            const order = orderRes.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
                amount: order.amount * 100, // Amount is in currency subunits
                currency: order.currency,
                name: "BillSentry Health",
                description: "Premium Dispute Letter",
                order_id: order.order_id,
                handler: async function (response: any) {
                    try {
                        const verifyToast = toast.loading('Verifying payment...');
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        toast.success('Payment successful!', { id: verifyToast });
                        setShowPaymentModal(false);

                        // Auto-trigger download
                        handleDownloadDispute(true);
                    } catch (err) {
                        toast.error('Payment verification failed');
                    }
                },
                theme: {
                    color: "#3b82f6" // brand-blue
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.error('Failed to initialize payment checkout');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleDownloadDispute = async (skipToast = false) => {
        setDownloading(true);
        const downloadToast = skipToast ? null : toast.loading('Generating your legal dispute letter...');
        try {
            const res = await api.get(`/bills/${billId}/dispute-letter`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Dispute_Letter_Bill_${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            if (!skipToast) toast.success('Dispute letter downloaded securely', { id: downloadToast as string });
        } catch (error: any) {
            if (downloadToast) toast.dismiss(downloadToast);

            if (error.response?.status === 402) {
                // Payment Required
                setShowPaymentModal(true);
            } else {
                console.error('Download failed', error);
                toast.error('Failed to generate letter. No actionable overcharges found.');
            }
        } finally {
            setDownloading(false);
        }
    };

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
                        <button
                            onClick={() => handleDownloadDispute(false)}
                            disabled={downloading}
                            className="btn-primary bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 flex items-center gap-2"
                        >
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {downloading ? 'Generating...' : 'Generate Dispute Letter'}
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

            {/* Payment Modal Override */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-brand-navy border border-brand-blue/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-teal"></div>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-brand-gray hover:text-white"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6 mt-4">
                            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue/30">
                                <FileText className="w-8 h-8 text-brand-blue" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Unlock Dispute Letter</h2>
                            <p className="text-brand-gray mt-2 text-sm">
                                Generate a formal legal document tailored to this specific bill, citing government benchmarks and actionable recovery steps.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 flex justify-between items-center">
                            <span className="text-white font-medium">Premium PDF Generate</span>
                            <span className="text-xl font-bold text-brand-teal">₹299</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processingPayment}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                        >
                            {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            {processingPayment ? 'Processing...' : 'Pay Securely with Razorpay'}
                        </button>
                        <p className="text-center text-xs text-brand-gray/60 mt-4">
                            Secured by Razorpay. 100% money-back guarantee if the document fails to generate.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
