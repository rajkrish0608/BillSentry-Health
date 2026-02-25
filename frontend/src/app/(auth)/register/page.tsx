'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Register the user
            await api.post('/auth/register', formData);
            toast.success('Account created successfully!');

            // 2. Immediately login with the same credentials to get the token
            const loginRes = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });
            const token = loginRes.data.access_token;

            // 3. Fetch user profile
            const userRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 4. Save to global store and redirect
            login(token, userRes.data);
            router.push('/dashboard');

        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Registration failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50-light/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
                <p className="text-gray-600">Join BillSentry to uncover hospital overcharges</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-black placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        placeholder="Raj Kumar"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-black placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-black placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 group mt-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Sign Up <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-black hover:text-black transition-colors">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
