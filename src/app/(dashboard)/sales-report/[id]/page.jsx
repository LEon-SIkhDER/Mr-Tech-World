"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Printer,
    FileText,
    Calendar,
    User,
    Phone,
    CreditCard,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Barcode,
    Tag,
    Clock,
    Package,
    RotateCcw
} from "lucide-react";
import { format } from "date-fns";

export default function SaleDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const {
        data: sale,
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: ["sale-details", id],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:5000/sales/${id}`);
            return data;
        },
        enabled: Boolean(id)
    });

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    const fmt = (num) => {
        const val = Number(num) || 0;
        return `৳${val.toLocaleString()}`;
    };

    const formatSaleDate = (dateVal) => {
        if (!dateVal) return "—";
        try {
            return format(new Date(dateVal), "dd MMMM yyyy, hh:mm a");
        } catch {
            return String(dateVal);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <span className="loading loading-spinner loading-lg text-indigo-600" />
                <p className="text-sm font-medium text-slate-500">Loading invoice details...</p>
            </div>
        );
    }

    if (isError || !sale) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Sale Not Found</h2>
                <p className="text-sm text-slate-500">
                    We could not find the sale invoice with identifier: <span className="font-mono font-semibold">{id}</span>.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push("/sales-report")}
                        className="btn btn-sm btn-outline gap-2"
                    >
                        <ArrowLeft size={16} /> Back to Sales Report
                    </button>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="btn btn-sm bg-indigo-600 text-white border-none gap-2"
                    >
                        <RotateCcw size={16} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const items = Array.isArray(sale.items) ? sale.items : [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Top Navigation & Actions (Hidden when printing) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Link
                        href="/sales-report"
                        className="hover:text-indigo-600 font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft size={14} /> Sales Report
                    </Link>
                    <span>/</span>
                    <span className="font-mono text-slate-800 font-bold">{sale.invoiceNo}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push("/sales-report")}
                        className="btn btn-sm bg-base-100 border border-slate-300 hover:bg-slate-100 text-slate-700 gap-1.5"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-1.5 shadow-xs cursor-pointer"
                    >
                        <Printer size={15} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Printable Invoice Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                MT
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Mr. Tech World
                                </h1>
                                <p className="text-xs text-slate-500">Retail & Wholesale Tech Gadgets</p>
                            </div>
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 block mb-1">
                            Sales Invoice
                        </span>
                        <div className="font-mono text-lg sm:text-xl font-bold text-slate-900">
                            {sale.invoiceNo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center sm:justify-end gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>{formatSaleDate(sale.createdAt || sale.saleDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Customer & Payment Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Customer
                        </span>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            <User size={14} className="text-slate-400 shrink-0" />
                            <span>{sale.customer?.name || "Walk-In Customer"}</span>
                        </div>
                        <div className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{sale.customer?.phone || "No phone provided"}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Payment Method
                        </span>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            <CreditCard size={14} className="text-indigo-500 shrink-0" />
                            <span>{sale.paymentMethod || "Cash"}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">Method applied at POS</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Payment Status
                        </span>
                        <div>
                            {sale.paymentStatus === "paid" ? (
                                <span className="badge badge-sm badge-success font-bold text-white gap-1">
                                    <CheckCircle2 size={12} /> Paid in Full
                                </span>
                            ) : (
                                <span className="badge badge-sm badge-error font-bold text-white gap-1">
                                    <AlertCircle size={12} /> Payment Due
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            Due: <span className="font-bold text-rose-600">{fmt(sale.dueAmount)}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Order Status
                        </span>
                        <div>
                            <span className="badge badge-sm bg-slate-200 text-slate-800 font-bold capitalize">
                                {sale.orderStatus || "Completed"}
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            Return: <span className="capitalize">{sale.returnStatus || "None"}</span>
                        </div>
                    </div>
                </div>

                {/* Items Purchased Table */}
                <div className="overflow-x-auto">
                    <table className="table table-sm w-full border border-slate-200 rounded-xl overflow-hidden">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="text-center w-12">#</th>
                                <th>Item Description</th>
                                <th className="text-center">Serial / IMEI</th>
                                <th className="text-center">Warranty</th>
                                <th className="text-right">Unit Price</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const imeis = Array.isArray(item.imeis) ? item.imeis : [];
                                const imeiStrings = imeis
                                    .map((i) => {
                                        if (typeof i === "object" && i !== null) {
                                            return [i.imei1, i.imei2].filter(Boolean).join(" / ");
                                        }
                                        return String(i || "");
                                    })
                                    .filter(Boolean);

                                return (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="text-center font-medium text-slate-400 text-xs">
                                            {idx + 1}
                                        </td>
                                        <td>
                                            <div className="font-bold text-slate-900 text-sm">
                                                {item.name || "Item"}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                                                {item.brand && <span>Brand: {item.brand}</span>}
                                                {item.variantTitle && (
                                                    <span className="badge badge-xs bg-slate-100 border-slate-200">
                                                        {item.variantTitle}
                                                    </span>
                                                )}
                                                {item.barcode && (
                                                    <span className="font-mono text-[11px] text-slate-400">
                                                        Barcode: {item.barcode}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="text-center text-xs">
                                            {imeiStrings.length > 0 ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {imeiStrings.map((im, iIdx) => (
                                                        <span
                                                            key={iIdx}
                                                            className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                                                        >
                                                            {im}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">—</span>
                                            )}
                                        </td>

                                        <td className="text-center text-xs">
                                            {item.warranty > 0 ? (
                                                <span className="badge badge-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                                                    {item.warranty} Months
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-[11px]">No warranty</span>
                                            )}
                                        </td>

                                        <td className="text-right text-xs font-semibold text-slate-700">
                                            {fmt(item.unitPrice)}
                                        </td>

                                        <td className="text-center text-xs font-bold text-slate-800">
                                            {item.quantity || 1}
                                        </td>

                                        <td className="text-right text-sm font-extrabold text-slate-900">
                                            {fmt(item.total || (item.unitPrice || 0) * (item.quantity || 1))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary Calculation Breakdown */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2 text-xs text-slate-500 max-w-sm">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                                Payment Note
                            </h4>
                            <p>
                                Thank you for shopping with Mr. Tech World! Please preserve this invoice for
                                product warranty claims and official returns.
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-80 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal ({sale.totalCartItems || items.length} items):</span>
                            <span className="font-semibold text-slate-800">{fmt(sale.subtotal)}</span>
                        </div>

                        {Number(sale.discountAmount) > 0 && (
                            <div className="flex justify-between text-rose-600 font-medium">
                                <span>
                                    Discount ({sale.discountType === "percent" ? `${sale.discountValue}%` : "Flat"}):
                                </span>
                                <span>- {fmt(sale.discountAmount)}</span>
                            </div>
                        )}

                        {Number(sale.deliveryFee) > 0 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee:</span>
                                <span className="font-semibold text-slate-800">+{fmt(sale.deliveryFee)}</span>
                            </div>
                        )}

                        <div className="border-t border-slate-200 pt-2 flex justify-between text-sm sm:text-base font-extrabold text-slate-900">
                            <span>Total Payable (Sold Amount):</span>
                            <span className="text-indigo-700">{fmt(sale.totalPayable)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-emerald-700 font-bold">
                            <span>Paid / Collected Amount:</span>
                            <span>{fmt(sale.paidAmount)}</span>
                        </div>

                        {Number(sale.dueAmount) > 0 && (
                            <div className="flex justify-between text-xs text-rose-600 font-bold">
                                <span>Due Amount (বাকি):</span>
                                <span>{fmt(sale.dueAmount)}</span>
                            </div>
                        )}

                        {Number(sale.changeDue) > 0 && (
                            <div className="flex justify-between text-xs text-blue-600 font-semibold">
                                <span>Change Returned (ফেরত):</span>
                                <span>{fmt(sale.changeDue)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Print Invoice Footer */}
                <div className="hidden print:block pt-12 text-center text-xs text-slate-400 border-t border-slate-200 mt-8">
                    <p>Computer Generated Sales Invoice — Mr. Tech World</p>
                    <p className="mt-1">Generated on {format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
                </div>
            </div>
        </div>
    );
}
