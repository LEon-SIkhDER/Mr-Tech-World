import React from 'react';
import Image from 'next/image';

const Authenticating = () => {
    return (
        <div className="min-h-screen bg-base-100 flex flex-col relative overflow-hidden">
            {/* 1. Psychological Momentum: Top high-speed indeterminate progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-base-200 overflow-hidden z-50">
                <div className="h-full bg-violet-600 rounded-full animate-pulse w-3/4"></div>
            </div>

            <div className="drawer lg:drawer-open min-h-screen">
                <input id="skeleton-drawer" type="checkbox" className="drawer-toggle" />

                {/* ── Main Content Skeleton ── */}
                <div className="drawer-content flex flex-col">
                    <main className="flex-1 p-5 lg:p-8 space-y-6">

                        {/* Top Bar / Breadcrumb Skeleton */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
                            <div className="space-y-2">
                                <div className="skeleton h-7 w-48 rounded-lg"></div>
                                <div className="skeleton h-3.5 w-64 rounded-md opacity-60"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="skeleton h-9 w-28 rounded-xl"></div>
                                <div className="skeleton h-9 w-32 rounded-xl"></div>
                            </div>
                        </div>

                        {/* 4 Quick Stat Cards Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="card bg-base-100 border border-base-200 p-5 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="skeleton h-3.5 w-20 rounded-md"></div>
                                        <div className="skeleton h-8 w-8 rounded-lg"></div>
                                    </div>
                                    <div className="skeleton h-7 w-28 rounded-md"></div>
                                    <div className="skeleton h-3 w-36 rounded-md opacity-50"></div>
                                </div>
                            ))}
                        </div>

                        {/* Large Data Table Skeleton */}
                        <div className="card bg-base-100 border border-base-200 shadow-xs p-6 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-base-200">
                                <div className="skeleton h-5 w-36 rounded-md"></div>
                                <div className="skeleton h-8 w-24 rounded-lg"></div>
                            </div>

                            {/* Table Rows Skeleton */}
                            <div className="space-y-3 pt-2">
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <div key={row} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-base-200/40 gap-4">
                                        <div className="flex items-center gap-3 w-1/3">
                                            <div className="skeleton h-8 w-8 rounded-lg shrink-0"></div>
                                            <div className="skeleton h-3.5 w-full max-w-[140px] rounded-md"></div>
                                        </div>
                                        <div className="skeleton h-3.5 w-24 rounded-md"></div>
                                        <div className="skeleton h-3.5 w-20 rounded-md"></div>
                                        <div className="skeleton h-3.5 w-16 rounded-md"></div>
                                        <div className="skeleton h-6 w-12 rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </main>
                </div>

                {/* ── Sidebar Skeleton (Matches DashboardLayout Exactly) ── */}
                <div className="drawer-side z-40">
                    <div className="menu bg-base-100 border-r border-base-300 min-h-full w-64 p-4 text-base gap-1 flex flex-col">

                        {/* Anchoring: Keep the real logo and branding visible immediately */}
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <Image src="/logo.jpeg" alt="Logo" width={42} height={42} className="rounded-xl shadow-xs" priority />
                            <div>
                                <h1 className="font-bold text-base-content leading-tight text-sm">Mr Tech World</h1>
                                <p className="text-xs text-base-content/40">Admin Panel</p>
                            </div>
                        </div>

                        {/* Menu Title */}
                        <div className="px-2 mb-2">
                            <div className="skeleton h-3 w-20 rounded-md opacity-40"></div>
                        </div>

                        {/* 4 Nav Items Skeletons */}
                        <div className="space-y-1.5">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-base-200/30">
                                    <div className="skeleton h-4 w-4 rounded-md shrink-0"></div>
                                    <div className="skeleton h-3.5 w-24 rounded-md"></div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom User Card Skeleton */}
                        <div className="mt-auto pt-4 border-t border-base-300">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="skeleton h-9 w-9 rounded-full shrink-0"></div>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="skeleton h-3.5 w-20 rounded-md"></div>
                                    <div className="skeleton h-2.5 w-28 rounded-md opacity-50"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Authenticating;
