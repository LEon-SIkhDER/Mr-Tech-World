"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Edit, Eye, Package, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import customizeImageWidth from '@/app/lib/customizeImageWidth';
import ActionDropdown from '@/Components/ActionDropdown';

const Products = () => {
    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data: result } = await axios.get("http://localhost:5000/products");
            return Array.isArray(result) ? result : [];
        }
    });
    

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-base-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-base-content tracking-tight">Products</h1>
                    <h2 className="text-sm font-normal text-base-content/60 mt-1">
                        Manage your product catalog, stock levels, variants, and pricing
                    </h2>
                </div>
                <Link href="/add-product" className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors duration-150">
                    <Plus size={18} />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Products Table Card */}
            <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-200 shadow-xs">
                <table className="table">
                    <thead>
                        <tr className="border-b border-base-200 text-xs font-semibold uppercase text-base-content/70">
                            <th className="w-12 text-center">S/N</th>
                            <th>Product</th>
                            <th>Category</th>
                            <th className="">Variants</th>
                            <th className="">Stock</th>
                            <th className="">Retail Price</th>
                            <th className="">MRP</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-sm text-base-content/50">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <span className="loading loading-spinner loading-md text-indigo-600" />
                                        <span>Loading products...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : !products || products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-sm text-base-content/50">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700">No products found</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Click &quot;Add Product&quot; to register your first catalog item.</p>
                                        </div>
                                        <Link href="/add-product" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none mt-1">
                                            <Plus size={14} /> Add Product
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product, index) => {
                                const stock = Number(product.totalStock) || 0;
                                const variantsCount = Number(product.variantsCount) || 0;
                                const retailPrice = product.retailPriceRange?.formatted && product.retailPriceRange.formatted !== "N/A"
                                    ? product.retailPriceRange.formatted
                                    : "—";
                                const mrpPrice = product.mrpRange?.formatted && product.mrpRange.formatted !== "N/A"
                                    ? product.mrpRange.formatted
                                    : "—";

                                return (
                                    <tr key={product._id || index} className="hover:bg-base-200/40 border-b border-base-200/60 transition-colors">
                                        <th className="text-center font-normal text-base-content/60">{index + 1}</th>
                                        <td className="min-w-[240px]">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle h-12 w-12 bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/80">
                                                        {product.image ? (
                                                            <Image
                                                                src={customizeImageWidth(product.image, 58)}
                                                                alt={product.name || "Product image"}
                                                                width={48}
                                                                height={48}
                                                                unoptimized
                                                                className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Package size={22} className="text-slate-400 m-auto" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 leading-tight">{product.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {[product.brand, product.model].filter(Boolean).join(" • ") || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-sm bg-slate-100 text-slate-700 border-slate-200 font-medium">
                                                {product.categoryName || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="">
                                            <span className="badge badge-sm bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold">
                                                {variantsCount} {variantsCount === 1 ? "Variant" : "Variants"}
                                            </span>
                                        </td>
                                        <td className="">
                                            {stock > 10 ? (
                                                <span className="badge badge-sm badge-success/15 text-emerald-700 font-semibold border-emerald-200">
                                                    {stock} In Stock
                                                </span>
                                            ) : stock > 0 ? (
                                                <span className="badge badge-sm badge-warning/20 text-amber-700 font-semibold border-amber-200">
                                                    {stock} Low Stock
                                                </span>
                                            ) : (
                                                <span className="badge badge-sm bg-rose-50 text-rose-600 font-semibold border-rose-200">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className=" text-xs text-slate-500 font-medium">
                                            {retailPrice}
                                        </td>
                                        <td className=" font-bold text-slate-800">
                                            {mrpPrice}
                                        </td>
                                        <th className="text-center">
                                            <ActionDropdown>
                                                <li>
                                                    <a className="flex items-center gap-2 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">
                                                        <Eye size={15} /> View Details
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex items-center gap-2 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">
                                                        <Edit size={15} /> Edit Product
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex items-center gap-2 py-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                        <Trash2 size={15} /> Delete
                                                    </a>
                                                </li>
                                            </ActionDropdown>
                                        </th>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
