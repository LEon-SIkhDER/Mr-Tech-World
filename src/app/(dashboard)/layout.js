"use client"
import NavLink from '@/Components/NavLink/NavLink';
import { LayoutDashboard, LayoutGrid, Package, PanelLeftClose, Timeline, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSession } from '../lib/auth-client';
import userImage from "../../../public/user.png"
import Authenticating from '@/Components/Loading/Authenticating';

const DashboardLayout = ({ children }) => {
    const router = useRouter()
    const { data: user, isPending } = useSession()
    console.log(user);


    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const links = [
        { icon: LayoutDashboard, label: "Overview", to: "/" },
        { icon: Timeline, label: "Categories", to: "/category" },
        { icon: Package, label: "Products", to: "/product" },
        { icon: TrendingUp, label: "Sales Report", to: "/sales-report" }
    ]
    useEffect(() => {
        if (!isPending && !user) {
            return router.push('/sign-in')
        }

    }, [user, isPending])

    if (isPending) {
        return <Authenticating></Authenticating>
    }
    return (
        <div className="drawer lg:drawer-open min-h-screen ">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            {/* â”€â”€ Main content â”€â”€ */}
            <div className="drawer-content flex flex-col">
                {/* Page content */}
                <main className="flex-1 p-5 lg:p-8 space-y-8">
                    {children}
                </main>
            </div>

            {/* â”€â”€ Sidebar â”€â”€ */}
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
                                <NavLink to={link.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 hover:text-violet-600 hover:bg-violet-50 active:bg-violet-100 transition-colors duration-150">
                                    <Icon size={18} className="shrink-0" />
                                    {link.label}
                                </NavLink>
                            </li>
                        )
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