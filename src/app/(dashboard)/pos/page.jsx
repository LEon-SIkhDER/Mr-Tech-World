'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, Barcode, ChevronLeft, ChevronRight, Layers, Minus, Package, PauseCircle, Phone, Plus, Search, ShoppingCart, Trash, User, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import Products from './Products';

const limit = 12

const Pos = () => {
    const { data: categoriesName, refetch } = useQuery({
        queryKey: ["categoriesName"],
        queryFn: async () => {
            const { data: result } = await axios.get("http://localhost:5000/categories/names");
            return result;
        }
    });

    // * filter related code 
    const [selectedCategory, setSelectedCategory] = useState("")
    console.log(selectedCategory);
    const [search, setSearch] = useState("")
    const timeOutId = useRef()
    const handleSearch = (e) => {
        const value = e.target.value
        clearTimeout(timeOutId.current)
        timeOutId.current = setTimeout(() => {
            setSearch(value)
        }, 500);
    }
    // * pagination
    const [currentPage, setCurrentPage] = useState(1)
    const skip = (currentPage * limit) - limit


    // * product related code

    const { data: productsData } = useQuery({
        queryKey: ["products-for-pos", search, selectedCategory, currentPage],
        queryFn: async () => {
            const { data: result } = await axios.get(`http://localhost:5000/products/pos?search=${search}&category=${selectedCategory}&limit=${limit}&skip=${skip}`);
            return result
        }
    })
    const products = productsData?.products || []
    const totalProductCounts = productsData?.totalProductCounts || 0
    console.log()
    // * sale price type 
    const [priceType, setPriceType] = useState("mrp")
    // * pagination
    const totalPages = Math.ceil((totalProductCounts || 0) / limit) || 1
    const endIndex = limit * currentPage > totalProductCounts ? totalProductCounts : limit * currentPage
    const startIndex = totalProductCounts === 0 ? 0 : (limit * currentPage) - limit + 1
    console.log(startIndex)
    console.log(priceType)

    // ? right section ============================================================== 
    // * discount type code 
    const [discountType, setDiscountType] = useState("flat")
    // * cart related code
    const [cart, setCart] = useState([])
    console.log(cart);




    return (
        <div className='p-2 h-dvh overflow-hidden flex flex-col'>
            <div className='flex gap-5 flex-1 min-h-0'>
                {/*  */}
                <div className='flex-1 flex flex-col min-h-0'>
                    {/*  header */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
                            <div className="relative w-full sm:w-72 md:w-80">
                                <input onChange={handleSearch} type="text" placeholder="Scan barcode, IMEI, or search product..." className="input input-sm h-10 w-full pl-10 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all" />
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
                    {/* products */}
                    <div className='pt-2 flex-1 overflow-y-auto min-h-0'>
                        {
                            (!products || products.length === 0) ? (
                                <div className="overflow-y-auto w-full py-10  px-4 flex flex-col items-center justify-center text-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                                        <Package size={26} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-semibold text-slate-800">No products found</h3>
                                        <p className="text-xs text-slate-400 max-w-xs">
                                            There are no products in your catalog. Add products to start selling in POS.
                                        </p>
                                    </div>
                                    <Link href="/add-product" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm gap-1.5 px-4 mt-1">
                                        <Plus size={16} />
                                        <span>Add New Product</span>
                                    </Link>
                                </div>
                            ) : (


                                <Products products={products} priceType={priceType} cart={cart} setCart={setCart}></Products>

                            )
                        }
                    </div>
                    {productsData?.products?.length > 0 && (
                        <div className="bg-white p-2.5 px-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 mt-auto z-10">
                            {/* <span className="text-xs text-slate-500 font-medium">
                                Showing <strong className="text-slate-800">{startIndex + 1}</strong>–<strong className="text-slate-800">{endIndex}</strong> of <strong className="text-slate-800">{totalFilteredItems}</strong> products
                            </span> */}

                            {/* <div className="flex items-center justify-between "> */}
                            <span className="text-xs text-slate-500 font-medium">
                                Showing <strong className="text-slate-800">{startIndex}</strong>–<strong className="text-slate-800">{endIndex}</strong> of <strong className="text-slate-800">{totalProductCounts}</strong> products
                                {/* Showing <strong className="text-slate-800">1</strong>–<strong className="text-slate-800">8</strong> of <strong className="text-slate-800">30</strong> products */}
                            </span>
                            <div className='flex items-center gap-1.5'>

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="btn btn-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:bg-slate-50 gap-1 font-medium"
                                >
                                    <ChevronLeft size={14} />
                                    <span className="hidden sm:inline">Prev</span>
                                </button>

                                <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`btn btn-xs h-7 w-7 p-0 rounded-lg border font-bold text-xs ${currentPage === i + 1
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="btn btn-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:bg-slate-50 gap-1 font-medium"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                            {/* </div> */}
                        </div>
                    )}
                </div>
                {/* right section ==========================================================================================  */}
                <div className='bg-white flex flex-col  rounded-2xl border border-slate-200 shadow-xs w-full lg:w-105 xl:w-115'>
                    <div className=' p-3.5 bg-slate-50/70 rounded-t-2xl border-b border-b-slate-200'>
                        <div className='flex justify-between items-center'>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <ShoppingCart size={18} className="text-indigo-600" />
                                    <h2 className="text-base font-bold text-slate-900">Current Sale</h2>
                                </div>
                                <span suppressHydrationWarning className="text-[11px] font-mono text-slate-400">IN-10430</span>
                            </div>
                            <div className='flex gap-5 items-center'>
                                <div className="flex items-center bg-slate-200/90 p-0.5 rounded-lg border border-slate-300/70 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => setPriceType('retailPrice')}
                                        title="Apply standard Retail Price to current sale"
                                        className={`cursor-pointer px-2 py-0.5 rounded-md transition-all font-bold ${priceType === 'retailPrice' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                    >
                                        Retail
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriceType('mrp')}
                                        title="Apply Maximum Retail Price (MRP) to current sale"
                                        className={`cursor-pointer px-2 py-0.5 rounded-md transition-all font-bold ${priceType === 'mrp' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                    >
                                        MRP
                                    </button>
                                </div>
                                <Trash size={16} className='text-red-500 ' />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-2 mt-2">
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

                    <div className='flex-1'>
                        {
                            cart &&
                            cart.map((product, index) => {

                                return (
                                    <div key={product.itemKey}>
                                        <h1>{product.name}</h1>
                                    </div>
                                )
                            })
                        }
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                                <Barcode size={28} />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Cart is empty</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-50">Click products or scan barcodes on the left to begin</p>
                        </div>

                    </div>

                    <div className=' p-3.5 bg-slate-50/70 rounded-b-2xl border-t border-t-slate-200 space-y-2'>
                        {/* Breakdown */}
                        <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal (0 items)</span>
                                <span className="font-semibold text-slate-800">৳{0}</span>
                            </div>

                            {/* Discount & Delivery row */}
                            <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                                <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span>Discount</span>
                                        <div className="flex gap-1 text-[10px] font-bold">
                                            <button
                                                onClick={() => setDiscountType('flat')}
                                                className={`px-1.5 py-0.5 rounded ${discountType === 'flat' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                                            >
                                                ৳
                                            </button>
                                            <button
                                                onClick={() => setDiscountType('percent')}
                                                className={`px-1.5 py-0.5 rounded ${discountType === 'percent' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                                            >
                                                %
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        // value={discountValue || ''}
                                        // onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                                        className="input input-xs h-7 w-full border border-slate-200 bg-white rounded text-xs text-slate-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span>Delivery / Courier</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        // value={deliveryFee || ''}
                                        // onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                                        className="input input-xs h-7 w-full border border-slate-200 bg-white rounded text-xs text-slate-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Discount Applied</span>
                                    <span>-৳{discountAmount.toLocaleString()}</span>
                                </div>
                            )} */}
                        </div>
                        {/*  */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payable Amount</span>
                                <div className="text-xl font-black text-slate-900 tracking-tight">
                                    ৳ 0
                                </div>
                            </div>


                            <select className="select select-xs w-32 h-8 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none">
                                {['Cash', 'bKash', 'Nagad', 'Card', "Others"].map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>

                        </div>
                        {/*  */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-600 font-medium">Received (৳):</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    // value={paidAmount}
                                    // onChange={(e) => setPaidAmount(e.target.value)}
                                    className="input input-xs h-7 w-28 border border-slate-300 text-right font-bold text-slate-900 text-xs focus:border-indigo-500 focus:outline-none rounded-lg"
                                />
                            </div>
                        </div>
                        {/*  */}
                        <button className='btn btn-primary rounded-xl w-full '>Complete sale <ArrowRight className='mt-1' size={18} /></button>

                    </div>

                </div>
            </div>

        </div>
    );
};

export default Pos;