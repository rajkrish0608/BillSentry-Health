'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: 'test@billsentry.com',
        password: 'Test1234!'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Get the token
            const res = await api.post('/auth/login', formData);
            const token = res.data.access_token;

            // 2. Fetch user profile
            const userRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Save to global store
            login(token, userRes.data);

            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to login');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-brand-navy-light/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-brand-gray">Sign in to access your audit dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-brand-gray mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-gray mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Sign In <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-brand-gray text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-brand-blue hover:text-white transition-colors">
                    Create an account
                </Link>
            </div>
        </div>
    );
}
