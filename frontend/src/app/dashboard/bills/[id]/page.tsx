'use client';

import { useState, useEffect, useRef } from 'react';
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
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

function Counter({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { bounce: 0, duration: 2500 });
    const display = useTransform(spring, (current) =>
        `${prefix}${Math.round(current).toLocaleString()}${suffix}`
    );

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, spring, value]);

    return <motion.span ref={ref}>{display}</motion.span>;
}

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
                <Loader2 className="w-12 h-12 text-black animate-spin" />
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-black mb-4">Report Not Found</h2>
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
                        className="text-gray-600 hover:text-black flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-black">Audit Report</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border
              ${bill.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-brand-blue/10 text-black border-brand-blue/20'}
            `}>
                            {bill.status}
                        </span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {bill.hospital_name || 'Unknown Hospital'} • {format(new Date(bill.created_at), 'MMM dd, yyyy')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-black font-medium hover:bg-white transition-colors">Download PDF</button>
                    {report && (isHighRisk || isMediumRisk) && (
                        <button
                            onClick={() => handleDownloadDispute(false)}
                            disabled={downloading}
                            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-black font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                        >
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {downloading ? 'Generating...' : 'Generate Dispute Letter'}
                        </button>
                    )}
                </div>
            </div>

            {report ? (
                <>
                    {/* Executive Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white backdrop-blur-xl border border-gray-200 p-6 rounded-3xl shadow-sm">
                            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Billed</p>
                            <h3 className="text-4xl font-bold text-black tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                <Counter value={bill.total_amount || 0} prefix="₹" />
                            </h3>
                            <p className="text-sm text-gray-500 mt-3 bg-white inline-block px-3 py-1 rounded-md">{items.length} line items analyzed</p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`bg-white backdrop-blur-xl border p-6 rounded-3xl shadow-sm ${isHighRisk ? 'border-red-500/30' : isMediumRisk ? 'border-amber-500/30' : 'border-gray-300'}`}>
                            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Overcharges Found</p>
                            <h3 className={`text-4xl font-bold tracking-tight ${isHighRisk ? 'text-red-500 drop-shadow-[0_4px_20px_rgba(0,0,0,0.1)]' : isMediumRisk ? 'text-amber-500' : 'text-[#111827] drop-shadow-sm'}`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                <Counter value={report.total_flagged_amount} prefix="₹" />
                            </h3>
                            <p className="text-sm text-gray-500 mt-3">
                                Potential recovery: <span className="text-black font-semibold">₹{report.potential_recovery_amount.toLocaleString()}</span>
                            </p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white backdrop-blur-xl border border-gray-200 p-6 rounded-3xl shadow-sm">
                            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2">Risk Level</p>
                            <div className="flex items-center gap-4 mt-1">
                                {isHighRisk ? <AlertTriangle className="w-10 h-10 text-red-500 drop-shadow-sm" /> :
                                    isMediumRisk ? <AlertCircle className="w-10 h-10 text-amber-500" /> :
                                        <ShieldCheck className="w-10 h-10 text-black drop-shadow-[0_4px_20px_rgba(0,0,0,0.1)]" />}
                                <h3 className={`text-3xl font-bold tracking-tight ${isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-black'}`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    {report.risk_level}
                                </h3>
                            </div>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white backdrop-blur-xl border border-gray-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white blur-[40px] rounded-full"></div>
                            <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">AI Confidence</p>
                            <div className="flex items-center gap-4 mt-1 relative z-10">
                                <Activity className="w-10 h-10 text-black drop-shadow-[0_4px_20px_rgba(0,0,0,0.1)]" />
                                <h3 className="text-3xl font-bold text-black tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    <Counter value={report.confidence_score * 100} suffix="%" />
                                </h3>
                            </div>
                        </motion.div>
                    </div>

                    {/* AI Summary Narrative */}
                    <div className="glass-card p-8 rounded-2xl border border-brand-blue/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue"></div>
                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-black" /> AI Auditor Summary
                        </h3>
                        <div className="prose prose-invert max-w-none">
                            {report.plain_language_summary.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                        <h3 className="text-xl font-bold text-black mb-6" style={{ fontFamily: "'Satoshi', sans-serif" }}>Line Item Analysis</h3>
                        <div className="bg-white backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-200">
                                            <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">Description & Flag</th>
                                            <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                            <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Billed Amount</th>
                                            <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Gov Limit (Max)</th>
                                            <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {items.map((item, i) => (
                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.7 + (i * 0.05) }}
                                                key={item.id}
                                                className="hover:bg-black/[0.04] transition-colors group cursor-default"
                                            >
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-semibold text-black tracking-wide">{item.raw_description}</p>
                                                    {item.flag_reason && item.flag !== 'OK' && (
                                                        <p className="text-xs text-red-400/80 mt-2 bg-red-500/10 inline-block px-2 py-1 rounded-md border border-red-500/20">{item.flag_reason}</p>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className="text-[11px] font-medium text-gray-500 bg-white px-3 py-1.5 rounded-md border border-gray-200 tracking-wider uppercase">
                                                        {item.normalized_category.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right">
                                                    <span className="text-sm font-bold text-black tracking-wide">₹{item.total_price.toLocaleString()}</span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        {item.benchmark_max ? `₹${item.benchmark_max.toLocaleString()}` : '--'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {item.flag === 'OK' && <CheckCircle2 className="w-5 h-5 text-black" />}
                                                        {item.flag === 'SUSPICIOUS' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                                        {item.flag === 'OVERCHARGED' && <XCircle className="w-5 h-5 text-red-500 drop-shadow-sm" />}

                                                        <span className={`text-[11px] font-bold tracking-widest uppercase ${item.flag === 'OK' ? 'text-black' :
                                                            item.flag === 'SUSPICIOUS' ? 'text-amber-500' :
                                                                'text-red-500'
                                                            }`}>
                                                            {item.flag}
                                                        </span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : (
                <div className="glass-card p-12 text-center rounded-2xl border border-gray-200">
                    <Loader2 className="w-12 h-12 text-black animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-black mb-2">Analysis in Progress</h3>
                    <p className="text-gray-600">Our AI is extracting line items and checking them against government benchmarks...</p>
                </div>
            )}

            {/* Payment Modal Override */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-50 border border-brand-blue/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-teal"></div>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6 mt-4">
                            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue/30">
                                <FileText className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-2xl font-bold text-black">Unlock Dispute Letter</h2>
                            <p className="text-gray-600 mt-2 text-sm">
                                Generate a formal legal document tailored to this specific bill, citing government benchmarks and actionable recovery steps.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 flex justify-between items-center">
                            <span className="text-black font-medium">Premium PDF Generate</span>
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
                        <p className="text-center text-xs text-gray-600/60 mt-4">
                            Secured by Razorpay. 100% money-back guarantee if the document fails to generate.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
