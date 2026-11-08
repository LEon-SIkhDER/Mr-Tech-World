"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { TrendingUp, Wallet, AlertCircle, Calendar, Search, RotateCcw, FileText, Eye, ChevronLeft, ChevronRight, ShoppingBag, Package, Tag, DollarSign, Filter, X, CheckCircle2, Clock, ArrowUpDown, Download, Printer, SlidersHorizontal, CreditCard } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";

const DATE_PRESETS = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "last7days", label: "Last 7 Days" },
    { id: "last30days", label: "Last 30 Days" },
    { id: "thisMonth", label: "This Month" },
    { id: "lastMonth", label: "Last Month" },
    { id: "thisYear", label: "This Year" },
    // { id: "custom", label: "Custom Range" }
];

const PAYMENT_METHODS = [
    { value: "all", label: "All Methods" },
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card / POS" },
    { value: "bKash", label: "bKash" },
    { value: "Nagad", label: "Nagad" },
    { value: "Rocket", label: "Rocket" },
    { value: "Bank Transfer", label: "Bank Transfer" }
];

const PAYMENT_STATUSES = [
    { value: "all", label: "All Statuses" },
    { value: "paid", label: "Paid" },
    { value: "due", label: "Due" }
];

const ORDER_STATUSES = [
    { value: "all", label: "All Orders" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
];

const RETURN_STATUSES = [
    { value: "all", label: "All Returns" },
    { value: "none", label: "No Returns" },
    { value: "partial", label: "Partial Return" },
    { value: "fully_returned", label: "Fully Returned" }
];

const SORT_OPTIONS = [
    { value: "createdAt-desc", label: "Sale Date: Newest First" },
    { value: "createdAt-asc", label: "Sale Date: Oldest First" },
    { value: "totalPayable-desc", label: "Sold Amount: High to Low" },
    { value: "totalPayable-asc", label: "Sold Amount: Low to High" },
    { value: "dueAmount-desc", label: "Due Amount: High to Low" },
    { value: "totalCartItems-desc", label: "Items Count: High to Low" }
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function SalesReportPage() {
    // -------------------------------------------------------------
    // Filter State
    // -------------------------------------------------------------
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceTimer = useRef(null);

    const [datePreset, setDatePreset] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [paymentStatus, setPaymentStatus] = useState("all");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [orderStatus, setOrderStatus] = useState("all");
    const [returnStatus, setReturnStatus] = useState("all");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");

    const [sortSetting, setSortSetting] = useState("createdAt-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Debounce search input
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setCurrentPage(1);
        }, 400);
    };

    const clearSearch = () => {
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
    };

    // Apply preset date range
    const handleDatePresetChange = (presetId) => {
        setDatePreset(presetId);
        setCurrentPage(1);
        const now = new Date();

        switch (presetId) {
            case "all":
                setStartDate("");
                setEndDate("");
                break;
            case "today": {
                const todayStr = format(now, "yyyy-MM-dd");
                setStartDate(todayStr);
                setEndDate(todayStr);
                break;
            }
            case "yesterday": {
                const yestStr = format(subDays(now, 1), "yyyy-MM-dd");
                setStartDate(yestStr);
                setEndDate(yestStr);
                break;
            }
            case "last7days": {
                setStartDate(format(subDays(now, 6), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            }
            case "last30days": {
                setStartDate(format(subDays(now, 29), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            }
            case "thisMonth": {
                setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            }
            case "lastMonth": {
                const prevMonthDate = subMonths(now, 1);
                setStartDate(format(startOfMonth(prevMonthDate), "yyyy-MM-dd"));
                setEndDate(format(endOfMonth(prevMonthDate), "yyyy-MM-dd"));
                break;
            }
            case "thisYear": {
                setStartDate(format(startOfYear(now), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            }
            case "custom":
                // Preserve whatever is already selected
                break;
            default:
                break;
        }
    };

    const handleCustomStartDate = (e) => {
        setStartDate(e.target.value);
        setDatePreset("custom");
        setCurrentPage(1);
    };

    const handleCustomEndDate = (e) => {
        setEndDate(e.target.value);
        setDatePreset("custom");
        setCurrentPage(1);
    };

    // Parse Sort Setting
    const [sortBy, sortOrder] = useMemo(() => {
        const parts = sortSetting.split("-");
        return [parts[0] || "createdAt", parts[1] || "desc"];
    }, [sortSetting]);

    // Check if any filter is active
    const isFiltered = useMemo(() => {
        return (
            Boolean(debouncedSearch.trim()) ||
            Boolean(startDate) ||
            Boolean(endDate) ||
            paymentStatus !== "all" ||
            paymentMethod !== "all" ||
            orderStatus !== "all" ||
            returnStatus !== "all" ||
            Boolean(minAmount) ||
            Boolean(maxAmount) ||
            datePreset !== "all"
        );
    }, [
        debouncedSearch,
        startDate,
        endDate,
        paymentStatus,
        paymentMethod,
        orderStatus,
        returnStatus,
        minAmount,
        maxAmount,
        datePreset
    ]);

    // Reset all filters
    const handleResetFilters = () => {
        setSearchInput("");
        setDebouncedSearch("");
        setDatePreset("all");
        setStartDate("");
        setEndDate("");
        setPaymentStatus("all");
        setPaymentMethod("all");
        setOrderStatus("all");
        setReturnStatus("all");
        setMinAmount("");
        setMaxAmount("");
        setSortSetting("createdAt-desc");
        setCurrentPage(1);
    };

    // -------------------------------------------------------------
    // TanStack Query: Super Fast Caching & Aggregated Fetching
    // -------------------------------------------------------------
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (paymentStatus !== "all") params.append("paymentStatus", paymentStatus);
        if (paymentMethod !== "all") params.append("paymentMethod", paymentMethod);
        if (orderStatus !== "all") params.append("orderStatus", orderStatus);
        if (returnStatus !== "all") params.append("returnStatus", returnStatus);
        if (minAmount) params.append("minAmount", minAmount);
        if (maxAmount) params.append("maxAmount", maxAmount);
        params.append("page", currentPage);
        params.append("limit", limit);
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
        return params.toString();
    }, [
        debouncedSearch,
        startDate,
        endDate,
        paymentStatus,
        paymentMethod,
        orderStatus,
        returnStatus,
        minAmount,
        maxAmount,
        currentPage,
        limit,
        sortBy,
        sortOrder
    ]);

    const {
        data: reportData,
        isLoading,
        isFetching,
        refetch
    } = useQuery({
        queryKey: [
            "sales-report",
            {
                search: debouncedSearch,
                startDate,
                endDate,
                datePreset,
                paymentStatus,
                paymentMethod,
                orderStatus,
                returnStatus,
                minAmount,
                maxAmount,
                currentPage,
                limit,
                sortBy,
                sortOrder
            }
        ],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:5000/sales/report?${queryParams}`
            );
            return data;
        },
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000 // Cache for 1 minute
    });

    const sales = useMemo(() => reportData?.sales || [], [reportData?.sales]);
    const filteredStats = reportData?.filteredStats || {
        totalRevenue: 0,
        totalCollection: 0,
        totalDue: 0,
        totalSubtotal: 0,
        totalDiscount: 0,
        totalDeliveryFee: 0,
        totalItemsSold: 0,
        totalOrders: 0
    };
    const overallStats = reportData?.overallStats || filteredStats;
    const pagination = reportData?.pagination || {
        totalCount: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    };

    // Format currency helper
    const fmt = (num) => {
        const val = Number(num) || 0;
        return `৳${val.toLocaleString()}`;
    };

    // Format date helper
    const formatSaleDate = (dateVal) => {
        if (!dateVal) return "—";
        try {
            return format(new Date(dateVal), "dd MMM yyyy, hh:mm a");
        } catch {
            return String(dateVal);
        }
    };

    return (
        <div className="p-1 sm:p-3 lg:p-5 space-y-6">
            {/* -------------------------------------------------------------
                Page Header
            ------------------------------------------------------------- */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-indigo-100">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Sales Report & Analytics
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Real-time sales transactions, revenue performance, collection stats, and order tracking
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-sm bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 gap-2 cursor-pointer transition-colors shadow-2xs" title="Refresh data from server">
                        <RotateCcw size={14} className={isFetching ? "animate-spin text-indigo-600" : "text-slate-500"} />
                        <span>{isFetching ? "Updating..." : "Refresh"}</span>
                    </button>
                </div>
            </div>

            {/* -------------------------------------------------------------
                TOP FILTERS SECTION ("all filter options all means all")
            ------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Filter size={16} className="text-slate-500" />
                        <span>Filter Sales Transactions</span>
                        {isFiltered && (
                            <button type="button" onClick={handleResetFilters} className="group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:shadow-xs active:scale-95 transition-all cursor-pointer ml-1" title="Clear all filters">
                                <RotateCcw size={12} className="shrink-0 transition-transform group-hover:-rotate-45" />
                                <span>Clear all filters</span>
                            </button>
                        )}
                    </div>
                    <button type="button" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="btn btn-ghost btn-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold gap-1">
                        <SlidersHorizontal size={13} />
                        <span>{showAdvancedFilters ? "Hide Extra Filters" : "More Filters"}</span>
                    </button>
                </div>

                {/* Primary Filter Row: Search & Date Presets */}
                <div className="flex justify-between gap-3 items-center">
                    {/* Live Search */}
                    <div className=" relative w-full max-w-1/2 pr-2">
                        <input type="text" value={searchInput} onChange={handleSearchChange} placeholder="Search by invoice #, customer name, phone, barcode, IMEI..." className="input input-sm h-10 w-full pl-9 pr-8 bg-slate-50 border-slate-300 hover:border-slate-400 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-slate-500 focus:outline-none transition-all placeholder:text-slate-400" />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        {searchInput && (
                            <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Quick Date Presets */}
                    <div className=" flex flex-wrap gap-1.5 items-center shrink-0">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
                            Preset:
                        </span>
                        {DATE_PRESETS.map((p) => {
                            const active = datePreset === p.id;
                            return (
                                <button key={p.id} type="button" onClick={() => handleDatePresetChange(p.id)} className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${active ? "bg-indigo-600 text-white border border-indigo-600 shadow-sm shadow-indigo-200 font-semibold" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/80"}`}>
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Granular Filters: Date Range, Statuses, Methods, Sort */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-200/80">
                    {/* Start Date */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            From Date
                        </label>
                        <div className="relative">
                            <input type="date" value={startDate} onChange={handleCustomStartDate} className="input input-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors" />
                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            To Date
                        </label>
                        <div className="relative">
                            <input type="date" value={endDate} onChange={handleCustomEndDate} className="input input-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors" />
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            Payment Status
                        </label>
                        <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setCurrentPage(1); }} className="select select-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors">
                            {PAYMENT_STATUSES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            Payment Method
                        </label>
                        <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setCurrentPage(1); }} className="select select-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors">
                            {PAYMENT_METHODS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            Sort By
                        </label>
                        <select value={sortSetting} onChange={(e) => { setSortSetting(e.target.value); setCurrentPage(1); }} className="select select-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors">
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Limit Per Page */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                            Per Page
                        </label>
                        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }} className="select select-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors">
                            {PAGE_SIZE_OPTIONS.map((sz) => (
                                <option key={sz} value={sz}>
                                    {sz} per page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Advanced Collapsible Filters */}
                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
                        {/* Order Status */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                                Order Status
                            </label>
                            <select value={orderStatus} onChange={(e) => { setOrderStatus(e.target.value); setCurrentPage(1); }} className="select select-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors">
                                {ORDER_STATUSES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Return Status */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                                Return Lifecycle
                            </label>
                            <select value={returnStatus} onChange={(e) => { setReturnStatus(e.target.value); setCurrentPage(1); }} className="select select-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors">
                                {RETURN_STATUSES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Total Amount */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                                Min Sold Amount (৳)
                            </label>
                            <input type="number" min="0" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }} placeholder="e.g. 1000" className="input input-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors" />
                        </div>

                        {/* Max Total Amount */}
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                                Max Sold Amount (৳)
                            </label>
                            <input type="number" min="0" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }} placeholder="e.g. 150000" className="input input-sm h-9 w-full bg-slate-50 border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors" />
                        </div>
                    </div>
                )}

                {/* Filter Tags / Active Chips Bar */}
                {isFiltered && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 text-xs">
                        <span className="text-slate-500 font-medium">Applied Filters:</span>
                        {debouncedSearch && (
                            <span className="badge badge-sm bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 font-medium">
                                Search: &quot;{debouncedSearch}&quot;
                                <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={clearSearch} />
                            </span>
                        )}
                        {(startDate || endDate) && (
                            <span className="badge badge-sm bg-violet-50 text-violet-700 border-violet-200 gap-1 font-medium">
                                Date: {startDate || "Start"} to {endDate || "Today"}
                                <X size={12} className="cursor-pointer hover:text-violet-900" onClick={() => handleDatePresetChange("all")} />
                            </span>
                        )}
                        {paymentStatus !== "all" && (
                            <span className="badge badge-sm bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-medium capitalize">
                                Status: {paymentStatus}
                                <X size={12} className="cursor-pointer hover:text-emerald-900" onClick={() => setPaymentStatus("all")} />
                            </span>
                        )}
                        {paymentMethod !== "all" && (
                            <span className="badge badge-sm bg-sky-50 text-sky-700 border-sky-200 gap-1 font-medium">
                                Method: {paymentMethod}
                                <X size={12} className="cursor-pointer hover:text-sky-900" onClick={() => setPaymentMethod("all")} />
                            </span>
                        )}
                        {orderStatus !== "all" && (
                            <span className="badge badge-sm bg-amber-50 text-amber-700 border-amber-200 gap-1 font-medium capitalize">
                                Order: {orderStatus}
                                <X size={12} className="cursor-pointer hover:text-amber-900" onClick={() => setOrderStatus("all")} />
                            </span>
                        )}
                        {returnStatus !== "all" && (
                            <span className="badge badge-sm bg-orange-50 text-orange-700 border-orange-200 gap-1 font-medium capitalize">
                                Return: {returnStatus}
                                <X size={12} className="cursor-pointer hover:text-orange-900" onClick={() => setReturnStatus("all")} />
                            </span>
                        )}
                        {(minAmount || maxAmount) && (
                            <span className="badge badge-sm bg-rose-50 text-rose-700 border-rose-200 gap-1 font-medium">
                                Amount: ৳{minAmount || 0} - ৳{maxAmount || "∞"}
                                <X size={12} className="cursor-pointer hover:text-rose-900" onClick={() => { setMinAmount(""); setMaxAmount(""); }} />
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* -------------------------------------------------------------
                DYNAMIC STATS CARDS SECTION
                "by default: total revenue, due revenue, total collection...
                 after filter the stat will be like filtered revenue, filtered due and so on."
            ------------------------------------------------------------- */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {isFiltered ? "Filtered Performance Metrics" : "Overall Business Overview"}
                        </h2>
                        {isFiltered ? (
                            <span className="badge badge-xs bg-indigo-600 text-white font-medium">
                                Filtered Dataset
                            </span>
                        ) : (
                            <span className="badge badge-xs bg-indigo-50 text-indigo-600 border-indigo-200 font-medium">
                                Lifetime Totals
                            </span>
                        )}
                    </div>
                    {isFiltered && (
                        <span className="text-xs text-slate-400 font-medium">
                            Matching {filteredStats.totalOrders} of {overallStats.totalOrders} all-time sales
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                    {/* Card 1: Revenue (Total Revenue / Filtered Revenue) */}
                    <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                                    {isFiltered ? "Filtered Revenue" : "Total Revenue"}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                                    {fmt(filteredStats.totalRevenue)}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    {isFiltered ? `All-Time: ${fmt(overallStats.totalRevenue)}` : "Gross invoiced sales"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Collection (Total Collection / Filtered Collection) */}
                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm relative overflow-hidden transition-all hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-50 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                    {isFiltered ? "Filtered Collection" : "Total Collection"}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                                    {fmt(filteredStats.totalCollection)}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    {filteredStats.totalRevenue > 0
                                        ? `${Math.round((filteredStats.totalCollection / filteredStats.totalRevenue) * 100)}% collected`
                                        : "Received cash & digital"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                                <Wallet size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Due (Due Revenue / Filtered Due) */}
                    <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm relative overflow-hidden transition-all hover:border-rose-300 hover:shadow-md hover:shadow-rose-50 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                                    {isFiltered ? "Filtered Due" : "Due Revenue"}
                                </p>
                                <h3 className="text-2xl font-black text-rose-600 mt-1 tracking-tight">
                                    {fmt(filteredStats.totalDue)}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    {isFiltered ? `All-Time Due: ${fmt(overallStats.totalDue)}` : "Pending customer balance"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                                <AlertCircle size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Orders Count (Total Orders / Filtered Orders) */}
                    <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm relative overflow-hidden transition-all hover:border-violet-300 hover:shadow-md hover:shadow-violet-50 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
                                    {isFiltered ? "Filtered Invoices" : "Total Invoices"}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                                    {Number(filteredStats.totalOrders).toLocaleString()}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    {isFiltered ? `Of ${overallStats.totalOrders} total sales` : "Completed transactions"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-violet-100 border border-violet-200/80 flex items-center justify-center text-violet-700 shrink-0">
                                <FileText size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Items Sold (Total Items Sold / Filtered Items Sold) */}
                    <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm relative overflow-hidden transition-all hover:border-sky-300 hover:shadow-md hover:shadow-sky-50 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                                    {isFiltered ? "Filtered Items Sold" : "Total Items Sold"}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                                    {Number(filteredStats.totalItemsSold).toLocaleString()} Units
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    {isFiltered ? `All-Time: ${overallStats.totalItemsSold} units` : "Total products sold"}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200/80 flex items-center justify-center text-sky-700 shrink-0">
                                <Package size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Card 6: Discounts (Total Discounts / Filtered Discounts) */}
                    <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm relative overflow-hidden transition-all hover:border-amber-300 hover:shadow-md hover:shadow-amber-50 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                                    {isFiltered ? "Filtered Discounts" : "Total Discounts"}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                                    {fmt(filteredStats.totalDiscount)}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    Promotional reductions
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
                                <Tag size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* -------------------------------------------------------------
                BOTTOM TABLE SECTION: FILTERED SALES WITH PAGINATION & FOOTER SUM
                "in the bottom show a table show filtered sales. from here user can go to the details page of sales.
                 use pagination for the table and in the table footer show the sum of sold amount."
            ------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Table Header Bar */}
                <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                            {isFiltered ? "Filtered Sales Records" : "All Sales Records"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Showing {(pagination.currentPage - 1) * pagination.limit + (sales.length > 0 ? 1 : 0)} to{" "}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{" "}
                            {pagination.totalCount} transactions
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        {isFetching && (
                            <span className="badge badge-sm bg-indigo-50 border-indigo-200 text-indigo-600 gap-1 font-medium">
                                <span className="loading loading-spinner loading-xs text-indigo-600" />
                                Synchronizing...
                            </span>
                        )}
                        <span className="badge badge-sm bg-white border-indigo-200 text-indigo-700 font-semibold shadow-2xs">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table table-sm md:table-md w-full">
                        <thead>
                            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
                                <th className="text-center w-12">S/N</th>
                                <th>Invoice No</th>
                                <th>Date & Time</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th className="text-right">Sold Amount</th>
                                <th className="text-right">Collection</th>
                                <th className="text-right">Due Amount</th>
                                <th className="text-center">Payment Method</th>
                                <th className="text-center">Status</th>
                                <th className="text-center w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <span className="loading loading-spinner loading-lg text-indigo-600" />
                                            <p className="text-sm font-medium text-slate-600">
                                                Loading sales report data...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                                                <FileText size={28} />
                                            </div>
                                            <p className="text-base font-semibold text-slate-700">
                                                No sales transactions found
                                            </p>
                                            <p className="text-xs text-slate-400 max-w-sm">
                                                {isFiltered
                                                    ? "No transactions match your currently applied filters. Try adjusting your date range or clearing filters."
                                                    : "No sales recorded yet. Process sales in the POS to view records here."}
                                            </p>
                                            {isFiltered && (
                                                <button type="button" onClick={handleResetFilters} className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none mt-1">
                                                    <RotateCcw size={14} /> Clear All Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale, index) => {
                                    const serialNumber = (pagination.currentPage - 1) * pagination.limit + index + 1;
                                    const itemsList = Array.isArray(sale.items) ? sale.items : [];
                                    const itemsPreview = itemsList
                                        .map((i) => `${i.name || "Item"} (x${i.quantity || 1})`)
                                        .join(", ");

                                    return (
                                        <tr key={sale._id || index} className="hover:bg-indigo-50/40 border-b border-slate-100 transition-colors">
                                            {/* S/N */}
                                            <td className="text-center font-medium text-slate-400 text-xs">
                                                {serialNumber}
                                            </td>

                                            {/* Invoice No */}
                                            <td>
                                                <Link href={`/sales-report/${sale._id}`} className="font-bold font-mono text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 transition-colors text-xs sm:text-sm">
                                                    <FileText size={14} className="text-indigo-400 shrink-0" />
                                                    <span className="tracking-tight">
                                                        {sale.invoiceNo || "N/A"}
                                                    </span>
                                                </Link>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="text-xs text-slate-600 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-indigo-300 shrink-0" />
                                                    <span>{formatSaleDate(sale.createdAt || sale.saleDate)}</span>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td>
                                                <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-tight">
                                                    {sale.customer?.name || "Walk-In Customer"}
                                                </div>
                                                {sale.customer?.phone ? (
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        {sale.customer.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">No phone</span>
                                                )}
                                            </td>

                                            {/* Items */}
                                            <td>
                                                <div className="tooltip tooltip-top cursor-help" data-tip={itemsPreview || "No item details"}>
                                                    <span className="badge badge-sm bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 font-medium min-w-[60px]">
                                                        {sale.totalCartItems || itemsList.length}{" "}
                                                        {(sale.totalCartItems || itemsList.length) === 1
                                                            ? "item"
                                                            : "items"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Sold Amount */}
                                            <td className="text-right font-extrabold text-slate-900 text-sm">
                                                {fmt(sale.totalPayable)}
                                            </td>

                                            {/* Collection / Paid Amount */}
                                            <td className="text-right font-semibold text-emerald-700 text-xs sm:text-sm">
                                                {fmt(sale.paidAmount)}
                                            </td>

                                            {/* Due Amount */}
                                            <td className="text-right font-semibold text-xs sm:text-sm">
                                                {Number(sale.dueAmount) > 0 ? (
                                                    <span className="text-rose-600 font-bold">
                                                        {fmt(sale.dueAmount)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">৳0</span>
                                                )}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="text-center">
                                                <span className="badge badge-sm bg-sky-50 text-sky-700 border-sky-200 font-medium min-w-[60px]">
                                                    {sale.paymentMethod || "Cash"}
                                                </span>
                                            </td>

                                            {/* Status: Paid or Due */}
                                            <td className="text-center">
                                                {sale.paymentStatus === "paid" ? (
                                                    <span className="badge badge-sm bg-emerald-100 text-emerald-700 font-bold border-emerald-300 min-w-11.25">
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-sm bg-rose-100 text-rose-700 font-bold border-rose-300 min-w-11.25">
                                                        Due
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions -> Link to Details Page */}
                                            <td className="text-center">
                                                <Link href={`/sales-report/${sale._id}`} className="btn btn-xs bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border-indigo-200 hover:border-indigo-600 font-semibold gap-1 transition-all inline-flex items-center shadow-2xs" title="View complete sale and invoice details">
                                                    <Eye size={13} />
                                                    <span>Details</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* -------------------------------------------------------------
                    PAGINATION & TOTALS FOOTER
                ------------------------------------------------------------- */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 font-medium text-center sm:text-left">
                        Showing{" "}
                        <span className="font-bold text-slate-800">
                            {(pagination.currentPage - 1) * pagination.limit + (sales.length > 0 ? 1 : 0)}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-slate-800">
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                        </span>{" "}
                        of <span className="font-bold text-slate-800">{pagination.totalCount}</span> total sales
                    </div>

                    {/* Grand Totals Summary */}
                    {/* {sales.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-3.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs shadow-sm">
                            <span className="font-bold text-indigo-700 uppercase tracking-wide text-[11px]">
                                {isFiltered ? "Filtered Grand Total:" : "All-Time Grand Total:"}
                            </span>
                            <span className="font-extrabold text-slate-900">
                                Sold: {fmt(filteredStats.totalRevenue)}
                            </span>
                            <span className="text-indigo-200">•</span>
                            <span className="font-bold text-emerald-700">
                                Paid: {fmt(filteredStats.totalCollection)}
                            </span>
                            <span className="text-indigo-200">•</span>
                            <span className="font-bold text-rose-600">
                                Due: {fmt(filteredStats.totalDue)}
                            </span>
                            <span className="text-indigo-200">•</span>
                            <span className="font-semibold text-slate-500">
                                {filteredStats.totalOrders} Invoices Total
                            </span>
                        </div>
                    )} */}

                    <div className="flex items-center gap-1.5">
                        {/* Prev Page Button */}
                        <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage || isFetching} className="btn btn-xs bg-white border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 gap-1 font-semibold text-indigo-600 shadow-2xs transition-all">
                            <ChevronLeft size={14} />
                            <span>Previous</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="join">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter((pageNumber) => {
                                    // Window around current page
                                    const cur = pagination.currentPage;
                                    const tot = pagination.totalPages;
                                    return (
                                        pageNumber === 1 ||
                                        pageNumber === tot ||
                                        (pageNumber >= cur - 1 && pageNumber <= cur + 1)
                                    );
                                })
                                .map((pageNumber, idx, arr) => {
                                    const isPrevEllipsis = idx > 0 && pageNumber - arr[idx - 1] > 1;
                                    return (
                                        <React.Fragment key={pageNumber}>
                                            {isPrevEllipsis && (
                                                <button type="button" disabled className="join-item btn btn-xs btn-disabled bg-white text-slate-400 border-slate-200">
                                                    ...
                                                </button>
                                            )}
                                            <button type="button" onClick={() => setCurrentPage(pageNumber)} className={`join-item btn btn-xs ${pageNumber === pagination.currentPage ? "bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm shadow-indigo-200" : "bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200"}`}>
                                                {pageNumber}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}
                        </div>

                        {/* Next Page Button */}
                        <button type="button" onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNextPage || isFetching} className="btn btn-xs bg-white border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 gap-1 font-semibold text-indigo-600 shadow-2xs transition-all">
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
