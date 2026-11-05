'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Barcode, PauseCircle, Phone, Search, ShoppingCart, Trash, User, UserRound, X } from 'lucide-react';
import React, { useState } from 'react';

const Pos = () => {
    // * filter related code 
    const [selectedCategory, setSelectedCategory] = useState()

    const { data: categoriesName, refetch } = useQuery({
        queryKey: ["categoriesName"],
        queryFn: async () => {
            const { data: result } = await axios.get("http://localhost:5000/categories/names");
            return result;
        }
    });

    return (
        <div className='p-5'>
            <div className='flex gap-5'>
                {/*  */}
                <div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
                            <div className="relative w-full sm:w-72 md:w-80">
                                <input type="text" placeholder="Scan barcode, IMEI, or search product..." className="input input-sm h-10 w-full pl-10 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all" />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>

                            {/* Category Filter Select */}
                            <select onChange={(e) => { setSelectedCategory(e.target.value); }} defaultValue={""} className="select select-sm h-10 w-full sm:w-44 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none">
                                <option value="">All</option>
                                {categoriesName?.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button type="button" className="btn btn-sm h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-medium gap-1.5">
                                <PauseCircle size={16} className="text-amber-600" />
                                <span>Held Orders</span>
                            </button>
                        </div>
                    </div>
                    <div className='bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0'>

                    </div>
                </div>
                {/*  */}
                <div className='bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <ShoppingCart size={18} className="text-indigo-600" />
                                <h2 className="text-base font-bold text-slate-900">Current Sale</h2>
                            </div>
                            <span suppressHydrationWarning className="text-[11px] font-mono text-slate-400">IN-10430</span>
                        </div>
                        <Trash size={18} className='text-red-500' />
                    </div>


                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Customer name"
                                className="input input-xs h-8 w-full pl-7 pr-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                            />
                            <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Phone (e.g. 017...)"
                                className="input input-xs h-8 w-full pl-7 pr-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                            />
                            <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <form className="relative col-span-2">
                            <input
                                type="text"
                                placeholder="Scan barcode or enter & press Enter to add..."
                                className="input input-xs h-8 w-full pl-7 pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                            />
                            <Barcode size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Pos;