"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Premium dashboard layout with collapsible sidebar and glassmorphic top navigation.
 */
export default function DashboardLayout({
    children,
    user = { name: "Demo User", email: "demo@billsentry.health" }
}: {
    children: React.ReactNode;
    user?: { name: string; email: string; avatar?: string };
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: "Overview", href: "/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
        { name: "My Bills", href: "/dashboard/bills", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
        { name: "Audit Reports", href: "/dashboard/reports", icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
        { name: "Disputes", href: "/dashboard/disputes", icon: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M10 10.5l4 4 M14 10.5l-4 4" },
        { name: "Settings", href: "/dashboard/settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative selection:bg-[var(--accent-emerald)] selection:text-black flex overflow-hidden">

            {/* ── Background Gradients ── */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px] pointer-events-none opacity-[0.03]" style={{ background: "var(--accent-emerald)" }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-[0.02]" style={{ background: "var(--accent-amber)" }} />

            {/* ── Mobile Sidebar Overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-white backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border-glass)] bg-[rgba(15,23,42,0.8)] backdrop-blur-3xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-[var(--border-glass)]">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: "linear-gradient(135deg, var(--accent-emerald), #059669)", boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                                <path d="M9 12l2 2 4-4" />
                                <path d="M12 3a9 9 0 1 0 9 9" />
                            </svg>
                        </div>
                        <span className="text-section-title !text-base">BillSentry</span>
                    </Link>

                    <button className="ml-auto lg:hidden text-[var(--text-secondary)] hover:text-black" onClick={() => setSidebarOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Area */}
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
                    <div className="text-micro px-3 mb-2" style={{ color: "var(--text-muted)" }}>Menu</div>

                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                                        ? "bg-[var(--accent-emerald-glow)] text-[var(--accent-emerald)] shadow-[inset_2px_0_0_0_var(--accent-emerald)]"
                                        : "text-[var(--text-secondary)] hover:text-black hover:bg-[rgba(255,255,255,0.05)]"
                                    }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "opacity-100" : "opacity-70"}>
                                    {item.icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : `M${d}`} />)}
                                </svg>
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                {/* User Profile Area */}
                <div className="p-4 border-t border-[var(--border-glass)]">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 border border-[var(--border-glass)] overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold">{user.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.name}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">{user.email}</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] shrink-0">
                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                        </svg>
                    </div>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10 w-full h-screen overflow-y-auto">

                {/* Top Header */}
                <header className="h-20 border-b border-[var(--border-glass)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-[var(--text-secondary)] hover:text-black" onClick={() => setSidebarOpen(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-lg font-semibold capitalize font-display">
                                {pathname.split('/')[2] || "Overview"}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] hover:text-black hover:bg-[rgba(255,255,255,0.1)] transition-colors relative">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-[var(--bg-primary)]"></span>
                        </button>

                        <button className="btn-primary text-sm !px-4 !py-2 hidden sm:flex gap-2 items-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Upload Bill
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6 lg:p-10 mx-auto w-full max-w-7xl animate-fade-in-up">
                    {children}
                </div>
            </main>

        </div>
    );
}
