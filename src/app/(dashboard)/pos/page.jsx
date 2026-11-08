'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, BangladeshiTaka, Barcode, Check, ChevronLeft, ChevronRight, Layers, Minus, Package, PauseCircle, Phone, Plus, Scan, Search, ShoppingCart, Trash, User, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Products from './Products';
import toast from 'react-hot-toast';
import Image from 'next/image';
import customizeImageWidth from '@/app/lib/customizeImageWidth';

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
    // * customer details
    const [customerName, setCustomerName] = useState("Walk-In Customer");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // * discount type code 
    const [discountType, setDiscountType] = useState("flat")
    // * cart related code ===================================================
    const [cart, setCart] = useState([])
    console.log(cart);

    // * IMEI Modal states & auto-focus
    const [imeiModalItem, setImeiModalItem] = useState(null);
    const [modalImeiInput, setModalImeiInput] = useState('');
    const modalImeiInputRef = useRef(null);

    useEffect(() => {
        if (imeiModalItem) {
            const timer = setTimeout(() => {
                modalImeiInputRef.current?.focus();
            }, 120);
            return () => clearTimeout(timer);
        }
    }, [imeiModalItem]);

    //  handle barcode
    const handleBarcode = async (e) => {
        const key = e.key
        if (key !== "Enter") return
        const value = e.target.value
        if (!value) return

        if (key === "Enter") {
            try {
                const { data } = await axios.get(`http://localhost:5000/product/scan/barcode/${value}`)
                if (!data || !data.itemKey) {
                    throw new Error("Product not found")
                }
                if (data.maxStock <= 0) {
                    throw new Error(`"${data.name} is out of stock!"`)
                }
                e.target.value = ""

                let toastMessage = "";
                let isError = false;
                setCart((prevCart) => {
                    const currentCart = Array.isArray(prevCart) ? prevCart : [];
                    const existingIndex = currentCart.findIndex((item) => item.itemKey === data.itemKey);
                    if (existingIndex > -1) {
                        const existingItem = currentCart[existingIndex];
                        if (existingItem.quantity >= data.maxStock) {
                            toastMessage = `Cannot add more than ${data.maxStock} units available in stock!`;
                            isError = true;
                            return currentCart;
                        }
                        const newQty = existingItem.quantity + 1;
                        const updated = [...currentCart];
                        updated[existingIndex] = {
                            ...existingItem,
                            quantity: newQty,
                            total: newQty * existingItem.unitPrice
                        };
                        // toastMessage = `Updated ${data.name} quantity to ${newQty}`;
                        return updated;
                    }
                    // New item added to cart
                    // toastMessage = `Added ${data.name} to cart`;
                    return [data, ...currentCart];
                });
                // Trigger toast cleanly outside render
                setTimeout(() => {
                    if (toastMessage) {
                        isError ? toast.error(toastMessage) : toast.success(toastMessage);
                    }
                }, 0);

            } catch (error) {
                toast.error(error.message || "Something went wrong")
                e.target.select?.()
            }
            // console.log(data)
        }
    }
    // Remove single item from cart
    const removeItemFromCart = (itemKey) => {
        setCart((prevCart) => prevCart.filter((item) => item.itemKey !== itemKey));
    };

    // Cart item quantity increment / decrement (+1 / -1)
    const updateQuantity = (itemKey, delta) => {
        let errorMessage = '';

        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.itemKey !== itemKey) return item;

                    const newQty = item.quantity + delta;

                    // 1. If quantity reaches 0, remove item from cart
                    if (newQty <= 0) return null;

                    // 2. Prevent exceeding available stock when clicking (+)
                    if (delta > 0 && newQty > item.maxStock) {
                        errorMessage = `Cannot add more than ${item.maxStock} units in stock!`;
                        return item; // Keep current quantity
                    }

                    // 3. Update quantity, recalculate line total, and sync IMEIs
                    return {
                        ...item,
                        quantity: newQty,
                        total: newQty * item.unitPrice,
                        selectedImeis: (item.selectedImeis || []).slice(0, newQty)
                    };
                })
                .filter(Boolean) // Cleans out null items (removed when qty reaches 0)
        );

        if (errorMessage) {
            setTimeout(() => toast.error(errorMessage), 0);
        }
    };

    // Helper functions for IMEI comparison and formatting
    const getImeiKey = (item) => {
        if (!item) return '';
        if (typeof item === 'object') return (item.imei1 || item.imei || '').trim().toLowerCase();
        return String(item).trim().toLowerCase();
    };

    const getImeiDisplayText = (item) => {
        if (!item) return '';
        if (typeof item === 'object') {
            const im1 = item.imei1 || item.imei || '';
            const im2 = item.imei2 || '';
            return im2 ? `${im1} / ${im2}` : im1;
        }
        return String(item);
    };

    // Assign IMEI to cart item & sync modal state
    const handleAssignImei = (imeiToAssign) => {
        if (!imeiModalItem) return false;

        const current = [...(imeiModalItem.selectedImeis || [])];
        const assignKey = getImeiKey(imeiToAssign);

        if (current.some((i) => getImeiKey(i) === assignKey)) {
            toast.error(`IMEI "${getImeiDisplayText(imeiToAssign)}" is already assigned!`);
            return false;
        }

        if (current.length >= imeiModalItem.quantity) {
            toast.error(`All ${imeiModalItem.quantity} unit(s) are already assigned! Increase cart quantity if selling more.`);
            return false;
        }

        const updated = [...current, imeiToAssign];
        setCart((prev) =>
            prev.map((item) => (item.itemKey === imeiModalItem.itemKey ? { ...item, selectedImeis: updated } : item))
        );
        setImeiModalItem((prev) => ({ ...prev, selectedImeis: updated }));
        return true;
    };

    // Remove IMEI from cart item & sync modal state
    const handleRemoveAssignedImei = (imeiToRemove) => {
        if (!imeiModalItem) return;

        const removeKey = getImeiKey(imeiToRemove);
        const updated = (imeiModalItem.selectedImeis || []).filter((i) => getImeiKey(i) !== removeKey);

        setCart((prev) =>
            prev.map((item) => (item.itemKey === imeiModalItem.itemKey ? { ...item, selectedImeis: updated } : item))
        );
        setImeiModalItem((prev) => ({ ...prev, selectedImeis: updated }));
    };

    // Handle scan or manual typing in IMEI modal input
    const handleModalImeiScan = (e) => {
        e.preventDefault();
        const code = modalImeiInput.trim();
        if (!code) return;

        const available = Array.isArray(imeiModalItem?.availableImeis) ? imeiModalItem.availableImeis : [];

        const matched = available.find((i) => {
            if (typeof i === 'object' && i !== null) {
                return (
                    (i.imei1 && i.imei1.toLowerCase() === code.toLowerCase()) ||
                    (i.imei2 && i.imei2.toLowerCase() === code.toLowerCase())
                );
            }
            return String(i).toLowerCase() === code.toLowerCase();
        });

        if (matched) {
            const assigned = handleAssignImei(matched);
            if (assigned) {
                setModalImeiInput('');
            } else {
                modalImeiInputRef.current?.select();
            }
        } else {
            toast.error(`IMEI "${code}" does not exist in stock for this product!`);
            modalImeiInputRef.current?.select();
        }
    };

    // Toggle individual cart item between Retail Price and MRP
    const toggleItemPriceType = (itemKey) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.itemKey !== itemKey) return item;
                const newType = item.priceType === 'mrp' ? 'retailPrice' : 'mrp';
                const newUnitPrice = newType === 'mrp'
                    ? (item.mrp || item.retailPrice || item.unitPrice)
                    : (item.retailPrice || item.mrp || item.unitPrice);
                return {
                    ...item,
                    priceType: newType,
                    unitPrice: newUnitPrice,
                    total: newUnitPrice * item.quantity
                };
            })
        );
    };
    // * DISCOUNT & TOTALS RELATED CODE
    const [discountValue, setDiscountValue] = useState(0);
    const [deliveryFee, setDeliveryFee] = useState(0);

    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
    }, [cart]);

    const totalCartItems = useMemo(() => {
        return cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    }, [cart]);

    // Calculate discount amount based on flat (৳) or percent (%)
    const discountAmount = useMemo(() => {
        if (!discountValue || discountValue <= 0) return 0;
        if (discountType === 'percent') {
            const pct = Math.min(100, Number(discountValue));
            return (subtotal * pct) / 100;
        }
        return Math.min(Number(discountValue), subtotal);
    }, [subtotal, discountType, discountValue]);

    // Handle discount typing & validation
    const handleDiscount = (e) => {
        const raw = e.target.value;
        if (raw === '') {
            setDiscountValue(0);
            return;
        }
        const val = Number(raw) || 0;
        if (val < 0) {
            setDiscountValue(0);
            return;
        }
        const maxLimit = discountType === 'percent' ? 100 : subtotal;

        if (val > maxLimit) {
            toast.error(discountType === 'percent' ? 'Discount cannot exceed 100%!' : 'Discount cannot exceed subtotal!');
            setDiscountValue(raw.slice(0, -1) ? Number(raw.slice(0, -1)) : 0);
        } else {
            setDiscountValue(val);
        }
    };

    const handleDeliveryFee = (e) => {
        const val = Number(e.target.value) || 0;
        if (val < 0) {
            setDeliveryFee(0);
            return;
        }
        setDeliveryFee(val);
    };

    const totalPayable = useMemo(() => {
        const total = subtotal - discountAmount + Number(deliveryFee || 0);
        return Math.max(0, Math.round(total));
    }, [subtotal, discountAmount, deliveryFee]);

    // * Payment, Received & Due calculations
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState('');

    const handlePaidAmount = (e) => {
        const raw = e.target.value;
        if (raw === '') {
            setPaidAmount('');
            return;
        }
        const num = Number(raw) || 0;
        if (num < 0) {
            setPaidAmount('');
            return;
        }
        if (num > totalPayable) {
            toast.error("Received amount cannot exceed total payable!");
            setPaidAmount(raw.slice(0, -1));
            return;
        }
        setPaidAmount(raw);
    };

    // When customer pays less than totalPayable -> Due (বাকি)
    const dueAmount = useMemo(() => {
        if (paidAmount === '' || paidAmount === null) return 0;
        const tendered = Number(paidAmount);
        if (isNaN(tendered) || tendered >= totalPayable) return 0;
        return Math.max(0, totalPayable - tendered);
    }, [paidAmount, totalPayable]);

    // When customer pays extra cash -> Change Due (ফেরত)
    const changeDue = useMemo(() => {
        const tendered = Number(paidAmount) || 0;
        if (tendered <= totalPayable) return 0;
        return tendered - totalPayable;
    }, [paidAmount, totalPayable]);

    // * Complete Sale Handler (Pre-sale validation & data assembly)
    const handleCompleteSale = async () => {
        if (!cart || cart.length === 0) {
            toast.error("Cart is empty! Add products to proceed.");
            return;
        }

        const unassignedImeiItem = cart.find(
            (item) => Boolean(item.hasImei) && (item.selectedImeis?.length || 0) < item.quantity
        );
        if (unassignedImeiItem) {
            toast.error(`Please assign all IMEIs for "${unassignedImeiItem.name}" before completing the sale!`);
            setImeiModalItem(unassignedImeiItem);
            return;
        }

        const finalPaid = paidAmount === '' ? totalPayable : Number(paidAmount);
        const finalDue = Math.max(0, totalPayable - finalPaid);

        // Standardized enterprise Sale Payload with full return & warranty tracking support
        const saleData = {
            customer: {
                name: customerName.trim() || 'Walk-In Customer',
                phone: customerPhone.trim() || ''
            },
            items: cart.map((item) => {
                const itemImeis = (item.selectedImeis || []).map((i) => {
                    if (typeof i === 'object' && i !== null) {
                        return {
                            imei1: (i.imei1 || i.imei || '').trim(),
                            imei2: (i.imei2 || '').trim()
                        };
                    }
                    return { imei1: String(i).trim(), imei2: '' };
                }).filter((i) => Boolean(i.imei1));

                return {
                    productId: item.productId,
                    name: item.name,
                    brand: item.brand || '',
                    model: item.model || '',
                    image: item.image || '',
                    variantTitle: item.variantTitle || '',
                    barcode: item.barcode || '',
                    priceType: item.priceType || priceType,
                    unitPrice: Number(item.unitPrice) || 0,
                    quantity: Number(item.quantity) || 1,
                    total: Number(item.total) || 0,
                    warranty: Number(item.warranty) || 0,
                    hasImei: Boolean(item.hasImei),
                    imeis: itemImeis,
                    // Return & warranty lifecycle fields
                    returnedQuantity: 0,
                    returnedImeis: [],
                    returnStatus: 'none' // 'none' | 'partial' | 'fully_returned'
                };
            }),
            totalCartItems,
            subtotal,
            discountType,
            discountValue: Number(discountValue) || 0,
            discountAmount,
            deliveryFee: Number(deliveryFee) || 0,
            totalPayable,
            paymentMethod,
            paidAmount: finalPaid,
            dueAmount: finalDue,
            changeDue: finalPaid > totalPayable ? finalPaid - totalPayable : 0,
            paymentStatus: finalDue === 0 ? 'paid' : finalPaid > 0 ? 'partial' : 'due',

            // Return & order lifecycle management
            orderStatus: 'completed', // 'completed' | 'cancelled'
            returnStatus: 'none',    // 'none' | 'partial' | 'fully_returned'
            refundAmount: 0,         // Accumulated refund amount if items are returned
            returns: [],             // Audit trail of returns [{ returnId, returnDate, items, refundAmount, reason }]

            saleDate: new Date().toISOString()
        };
        const toastId = toast.loading("Processing sale and updating inventory...");
        setIsSubmitting(true);
        try {
            const { data } = await axios.post("http://localhost:5000/sale", saleData);
            toast.success(`Sale completed! Invoice: ${data.invoiceNo || ''}`, { id: toastId });
            // Reset POS for next customer
            setCart([]);
            setPaidAmount('');
            setDiscountValue(0);
            setDeliveryFee(0);
            setCustomerName("Walk-In Customer");
            setCustomerPhone("");
            // (Optional: Open Invoice/Print Modal here)
        } catch (error) {
            console.error("Sale error:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to complete sale", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };



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
                                <span className="text-[11px] font-mono text-slate-400">New Sale</span>
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
                                <input type="text" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input input-xs h-8 w-full pl-7 pr-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none" />
                                <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            <div className="relative">
                                <input type="text" placeholder="Phone (e.g. 017...)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input input-xs h-8 w-full pl-7 pr-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none" />
                                <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>

                            <div className="relative col-span-2">
                                <input type="text" placeholder="Scan barcode or IMEI & press Enter to add..." onKeyDown={handleBarcode} className="input input-xs h-8 w-full pl-7 pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none" />
                                <Barcode size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 space-y-2 p-2'>
                        {
                            cart?.length > 0 ?
                                cart.map((product, index) => {
                                    const isImeiMissing = Boolean(product.hasImei) && (product.selectedImeis?.length || 0) < product.quantity;
                                    return (
                                        <div key={product.itemKey} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2">
                                            <div className="flex items-start justify-between gap-2.5">


                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {product.image ? (
                                                        <Image src={customizeImageWidth(product.image, 60)} alt={product.name || 'Cart item'} width={40} height={40} unoptimized className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                                                        {product.name}
                                                    </h4>
                                                    {product.variantTitle && (
                                                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                            {product.variantTitle}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItemFromCart(product.itemKey)}
                                                    className="text-slate-300 cursor-pointer hover:text-rose-500 p-0.5 rounded transition-colors shrink-0"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                            {/* IMEI Assignment row if product is IMEI-tracked */}
                                            {product.hasImei && (
                                                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Scan size={14} className={isImeiMissing ? 'text-amber-500' : 'text-emerald-500'} />
                                                        <span className="text-[11px] font-medium text-slate-600">
                                                            IMEIs: <strong className={isImeiMissing ? 'text-amber-600' : 'text-emerald-700'}>{(product.selectedImeis?.length || 0)}/{product.quantity}</strong>
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setImeiModalItem(product)}
                                                        className={`btn btn-xs h-6 px-2 text-[10px] rounded border font-semibold ${isImeiMissing
                                                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 animate-pulse'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            }`}
                                                    >
                                                        {isImeiMissing ? 'Assign IMEIs' : 'Edit IMEIs'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Quantity & Price calculations */}
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                                    <button
                                                        onClick={() => updateQuantity(product.itemKey, -1)}
                                                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                                                        {product.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(product.itemKey, 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* <button
                                                            type="button"
                                                            onClick={() => toggleItemPriceType(product.itemKey)}
                                                            title="Click to toggle between Retail Price and MRP for this item"
                                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${product.priceType === 'mrp' ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
                                                        >
                                                            {product.priceType === 'mrp' ? 'MRP' : 'Retail'}
                                                        </button> */}
                                                        <span className="text-xs font-bold text-slate-900 inline-flex items-center">
                                                            <BangladeshiTaka size={13} className="shrink-0" />{Number(product.total || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 flex items-center justify-end">
                                                        <BangladeshiTaka size={10} className="shrink-0" />{Number(product.unitPrice || 0).toLocaleString()} each
                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                    )

                                }) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                                            <Barcode size={28} />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600">Cart is empty</p>
                                        <p className="text-xs text-slate-400 mt-1 max-w-50">Click products or scan barcodes on the left to begin</p>
                                    </div>
                                )

                        }


                    </div>

                    <div className=' p-3.5 bg-slate-50/70 rounded-b-2xl border-t border-t-slate-200 space-y-2'>
                        {/* Breakdown */}
                        <div className="space-y-1 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal ({totalCartItems} items)</span>
                                <span className="font-semibold text-slate-800 inline-flex items-center"><BangladeshiTaka size={13} className="shrink-0" />{subtotal.toLocaleString()}</span>
                            </div>

                            {/* Discount & Delivery row */}
                            <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                                <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span>Discount</span>
                                        <div className="flex gap-1 text-[10px] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDiscountType('flat');
                                                    if (discountValue > subtotal) setDiscountValue(subtotal);
                                                }}
                                                className={`px-1.5 py-0.5 rounded ${discountType === 'flat' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                                            >
                                                <BangladeshiTaka size={11} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDiscountType('percent');
                                                    if (discountValue > 100) setDiscountValue(100);
                                                }}
                                                className={`px-1.5 py-0.5 rounded ${discountType === 'percent' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                                            >
                                                %
                                            </button>
                                        </div>
                                    </div>
                                    <input type="number" min="0" placeholder="0" value={discountValue || ''} onChange={handleDiscount} className="input input-xs h-7 w-full border border-slate-200 bg-white rounded text-xs text-slate-800 focus:outline-none" />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span>Delivery / Courier</span>
                                    </div>
                                    <input type="number" min="0" placeholder="0" value={deliveryFee || ''} onChange={handleDeliveryFee} className="input input-xs h-7 w-full border border-slate-200 bg-white rounded text-xs text-slate-800 focus:outline-none" />
                                </div>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Discount Applied {discountType === 'percent' && `(${discountValue}%)`}</span>
                                    <span className="inline-flex items-center">-<BangladeshiTaka size={13} className="shrink-0" />{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            {Number(deliveryFee) > 0 && (
                                <div className="flex justify-between text-indigo-600 font-medium">
                                    <span>Delivery / Courier Fee</span>
                                    <span className="inline-flex items-center">+<BangladeshiTaka size={13} className="shrink-0" />{Number(deliveryFee).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        {/*  */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payable Amount</span>
                                <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-0.5">
                                    <BangladeshiTaka size={20} className="shrink-0" /><span>{totalPayable.toLocaleString()}</span>
                                </div>
                            </div>
                            <div>

                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Payment method</span>

                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="select select-xs w-32 h-8 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none">
                                    {['Cash', 'bKash', 'Nagad', 'Card', "Others"].map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>

                        </div>
                        {/*  */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-slate-600 font-medium inline-flex items-center gap-0.5">Received (<BangladeshiTaka size={11} className="shrink-0" />):</span>
                                <input type="number" min="0" step="any" placeholder={totalPayable ? `${totalPayable.toLocaleString()}` : "0.00"} value={paidAmount} onChange={handlePaidAmount} onFocus={(e) => e.target.select()} className="input input-xs h-7 w-28 border border-slate-300 text-right font-bold text-slate-900 text-xs focus:border-indigo-500 focus:outline-none rounded-lg" />
                            </div>

                            {/* Due Amount Banner */}
                            {dueAmount > 0 && (
                                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-xs">
                                    <span className="font-bold text-amber-700">Due Amount :</span>
                                    <span className="font-black text-rose-600 text-sm inline-flex items-center"><BangladeshiTaka size={15} className="shrink-0" />{dueAmount.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Change Return Banner (if customer overpaid) */}
                            {Number(paidAmount) > totalPayable && (
                                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-xs">
                                    <span className="font-semibold text-slate-600">Change Return :</span>
                                    <span className="font-bold text-emerald-600 text-sm inline-flex items-center"><BangladeshiTaka size={15} className="shrink-0" />{changeDue.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Paid in Full Badge */}
                            {/* {(paidAmount === '' || Number(paidAmount) === totalPayable) && totalPayable > 0 && (
                                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-xs">
                                    <span className="text-slate-500 font-medium">Status:</span>
                                    <span className="font-bold text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ Paid in Full
                                    </span>
                                </div>
                            )} */}
                        </div>
                        {/*  */}
                        <button type="button" disabled={isSubmitting || cart.length === 0} onClick={handleCompleteSale} className='btn btn-primary rounded-xl w-full'>{isSubmitting ? 'Processing...' : 'Complete sale'} <ArrowRight className='mt-1' size={18} /></button>

                    </div>

                </div>
            </div>

            {/* DaisyUI IMEI Assignment Modal */}
            {imeiModalItem && (
                <dialog className="modal modal-open z-50">
                    <div className="modal-box bg-white border border-slate-200 shadow-2xl max-w-md p-5 rounded-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Assign IMEI Serials</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {imeiModalItem.name} {imeiModalItem.variantTitle ? `(${imeiModalItem.variantTitle})` : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setImeiModalItem(null)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="py-4 space-y-3.5">
                            {/* Status indicator banner */}
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                                <div className="text-xs text-slate-600">
                                    Units in cart: <strong className="text-slate-900">{imeiModalItem.quantity}</strong>
                                </div>
                                <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${(imeiModalItem.selectedImeis?.length || 0) === imeiModalItem.quantity
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}>
                                    {(imeiModalItem.selectedImeis?.length || 0)} / {imeiModalItem.quantity} Assigned
                                </div>
                            </div>

                            {/* Barcode / IMEI Scanner input */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Scan IMEI Barcode
                                </label>
                                <form onSubmit={handleModalImeiScan} className="relative">
                                    <input
                                        ref={modalImeiInputRef} type="text"
                                        placeholder="Scan barcode or type IMEI & press Enter..."
                                        value={modalImeiInput} onChange={(e) => setModalImeiInput(e.target.value)}
                                        className="input input-sm h-10 w-full pl-9 pr-20 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                                    />
                                    <Scan size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        type="submit"
                                        className="btn btn-xs h-7 absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg border-none text-[11px] px-3 font-semibold"
                                    >
                                        Assign
                                    </button>
                                </form>
                            </div>

                            {/* Currently Assigned IMEIs */}
                            {(imeiModalItem.selectedImeis?.length || 0) > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-semibold text-slate-700">Currently Assigned:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCart((prev) => prev.map((item) => item.itemKey === imeiModalItem.itemKey ? { ...item, selectedImeis: [] } : item));
                                                setImeiModalItem((prev) => ({ ...prev, selectedImeis: [] }));
                                            }}
                                            className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {imeiModalItem.selectedImeis.map((imei, idx) => (
                                            <span
                                                key={getImeiKey(imei) || idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-semibold"
                                            >
                                                <Check size={12} className="text-emerald-600" />
                                                <span>{getImeiDisplayText(imei)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAssignedImei(imei)}
                                                    className="text-emerald-500 hover:text-rose-600 cursor-pointer"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available Stock Serials to click directly */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                                    Or Click from Stock ({imeiModalItem.availableImeis?.length || 0})
                                </label>
                                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                    {imeiModalItem.availableImeis?.length > 0 ? (
                                        imeiModalItem.availableImeis.map((imei, idx) => {
                                            const isSelected = (imeiModalItem.selectedImeis || []).some(
                                                (s) => getImeiKey(s) === getImeiKey(imei)
                                            );
                                            return (
                                                <div
                                                    key={getImeiKey(imei) || idx}
                                                    onClick={() => (isSelected ? handleRemoveAssignedImei(imei) : handleAssignImei(imei))}
                                                    className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Barcode size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                                                        <span>{getImeiDisplayText(imei)}</span>
                                                    </div>
                                                    <span className="text-[10px]">{isSelected ? 'Assigned ✓' : 'Click to add'}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4 text-xs text-slate-400">
                                            No pre-registered IMEIs in stock. Scan or type above.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-action border-t border-slate-200 pt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">
                                {(imeiModalItem.selectedImeis?.length || 0) < imeiModalItem.quantity
                                    ? `Need ${imeiModalItem.quantity - (imeiModalItem.selectedImeis?.length || 0)} more`
                                    : '✓ All assigned'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setImeiModalItem(null)}
                                className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={() => setImeiModalItem(null)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default Pos;