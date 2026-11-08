"use client"
import { AnimatePresence, motion } from "motion/react";
import NavLink from '@/Components/NavLink/NavLink';
import { Boxes, ChevronDown, LayoutDashboard, List, ListPlus, Package, PackagePlus, PanelLeftClose, Plus, PlusCircle, ScanBarcode, ShoppingCart, ShoppingCartPlus, Timeline, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSession } from '../lib/auth-client';
import userImage from "../../../public/user.png"
import Authenticating from '@/Components/Loading/Authenticating';

const NAV_LINKS = [
    { icon: LayoutDashboard, label: "Overview", to: "/" },
    { icon: ScanBarcode, label: "Point Of Sales", to: "/pos" },
    // { icon: ScanBarcode, label: "Point Of Sales2", to: "/pos2" },
    {
        icon: Timeline,
        label: "Categories",
        to: "/category"
    },
    {
        icon: Users,
        label: "Suppliers",
        to: "/supplier"
    },
    {
        icon: Package,
        label: "Products",
        subLinks: [
            { icon: Boxes, label: "All Products", to: "/product" },
            { icon: PackagePlus, label: "Add Product", to: "/add-product" }
        ]
    },
    {
        icon: ShoppingCart,
        label: "Purchase",
        subLinks: [
            { icon: List, label: "All Purchase", to: "/purchase" },
            { icon: ShoppingCartPlus, label: "New Purchase", to: "/new-purchase" }
        ]
    },
    { icon: TrendingUp, label: "Sales Report", to: "/sales-report" }
];

const DashboardLayout = ({ children }) => {
    const router = useRouter()
    const { data: user, isPending } = useSession()
    console.log(user);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname();

    // Track open state for each dropdown menu independently
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    // Auto-expand whichever menu contains the current active route
    useEffect(() => {
        NAV_LINKS.forEach((link) => {
            if (link.subLinks) {
                const isMatch = link.subLinks.some(
                    (sub) => pathname === sub.to || (sub.to !== '/' && pathname.startsWith(sub.to))
                );
                if (isMatch) {
                    setOpenMenus((prev) => ({ ...prev, [link.label]: true }));
                }
            }
        });
    }, [pathname]);
    console.log(user, isPending)
    useEffect(() => {
        if (!isPending && !user) {
            return router.push('/sign-in')
        }
    }, [user, isPending, router])

    if (isPending || !user) {
        return <Authenticating></Authenticating>
    }

    return (
        <div className="drawer lg:drawer-open min-h-screen">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            {/* ── Main content ── */}
            <div className="drawer-content flex flex-col">
                {/* Page content */}
                <main className="flex-1  space-y-8">
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

                    {NAV_LINKS.map((link, index) => {
                        const Icon = link.icon;

                        // Dropdown with sublinks (e.g. Categories, Products, Purchase)
                        if (link.subLinks) {
                            const isOpen = Boolean(openMenus[link.label]);
                            const isParentActive = link.subLinks.some(
                                (sub) => pathname === sub.to || (sub.to !== '/' && pathname.startsWith(sub.to))
                            );

                            return (
                                <li key={index}>
                                    {/* Parent Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={() => toggleMenu(link.label)}
                                        className={`flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${isParentActive
                                            ? 'text-indigo-600 bg-indigo-50 font-semibold'
                                            : 'text-base-content/70 hover:text-indigo-600 hover:bg-indigo-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} className="shrink-0" />
                                            <span>{link.label}</span>
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Submenu Links */}
                                    <AnimatePresence initial={false} >

                                        {isOpen && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden ml-4 pl-2 border-l border-base-200 mt-1 space-y-1">
                                                {link.subLinks.map((sub, subIdx) => {
                                                    const SubIcon = sub.icon;
                                                    return (
                                                        <li key={subIdx}>
                                                            <NavLink
                                                                to={sub.to}
                                                                className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium text-base-content/60 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                            >
                                                                {SubIcon && <SubIcon size={14} className="shrink-0 opacity-70" />}
                                                                <span>{sub.label}</span>
                                                            </NavLink>
                                                        </li>
                                                    );
                                                })}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>

                                </li>
                            );
                        }

                        // Single Link (e.g. Overview, POS, Sales Report)
                        return (
                            <li key={index}>
                                <NavLink to={link.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-150">
                                    <Icon size={18} className="shrink-0" />
                                    {link.label}
                                </NavLink>
                            </li>
                        );
                    })}

                    <div className='mt-auto pt-4 border-t border-base-300'>
                        <div className='flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-base-200 transition-colors duration-150 cursor-default'>
                            <div className='relative shrink-0'>
                                <Image
                                    src={user?.user?.image || userImage}
                                    alt={user?.user?.name || "user"}
                                    width={38}
                                    height={38}
                                    className='rounded-full object-cover ring-2 ring-base-300'
                                />
                                <span className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-base-100'></span>
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-semibold text-base-content truncate'>{user?.user?.name}</p>
                                <p className='text-xs text-base-content/40 truncate'>{user?.user?.email}</p>
                            </div>
                        </div>
                    </div>

                </ul>
            </div>
        </div>
    );
};

export default DashboardLayout;
