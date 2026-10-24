"use client"
import { LayoutDashboard, Menu, Package, PanelLeftClose, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const DashboardInitialPage = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const links = [
        { icon: LayoutDashboard, label: "Overview" },
        { icon: Package, label: "Products" },
        { icon: TrendingUp, label: "Sales Report" }
    ]
    return (
        <div className="drawer lg:drawer-open min-h-screen ">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            {/* ── Main content ── */}
            <div className="drawer-content flex flex-col">
                {/* Page content */}
                <main className="flex-1 p-5 lg:p-8 space-y-8">
                    {children}
                </main>
            </div>

            {/* ── Sidebar ── */}
            <div className="drawer-side z-40">
                <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-base-100 border-r border-base-300 min-h-full w-64 p-4 text-base gap-1">

                    {/* Logo */}
                    <div className='flex items-center gap-3 mb-6 px-2'>
                        <Image
                            src="/logo.jpeg"
                            alt="Logo"
                            width={42}
                            height={42}
                            className='rounded-xl shadow-sm'
                        />
                        <div>
                            <h1 className="font-bold text-base-content leading-tight text-sm">Mr Tech World</h1>
                            <p className="text-xs text-base-content/40">Admin Panel</p>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen((prev) => !prev)}
                            className='ml-auto opacity-40 hover:opacity-100 duration-300 cursor-pointer lg:flex hidden'>
                            <PanelLeftClose size={18} />
                        </button>
                    </div>

                    <li className="menu-title text-xs uppercase tracking-widest text-base-content/30 px-2 mb-1">Navigation</li>

                    {links.map((link, index) => {
                        const Icon = link.icon;
                        return (
                            <li key={index}>
                                <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 hover:text-violet-600 hover:bg-violet-50 active:bg-violet-100 transition-colors duration-150">
                                    <Icon size={18} className="shrink-0" />
                                    {link.label}
                                </a>
                            </li>
                        )
                    })}

                    
                </ul>
            </div>
        </div>
    );
};

export default DashboardInitialPage;