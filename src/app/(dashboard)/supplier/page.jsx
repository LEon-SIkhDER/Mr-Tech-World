"use client"
import React from 'react';
import { EllipsisVertical, Phone, Plus, User } from 'lucide-react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import AddSupplier from './AddSupplier';
import EditSupplier from './EditSupplier';

const Supplier = () => {
    const { data: suppliers, isLoading, refetch } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:5000/suppliers');
            return Array.isArray(data) ? data : [];
        },
    });

    const handleDelete = (supplier) => {
        Swal.fire({
            title: "Delete Supplier?",
            text: `Are you sure you want to remove "${supplier.name}"? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#e11d48",
            cancelButtonColor: "#64748b",
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const toastId = toast.loading("Deleting supplier...");
                try {
                    const { data } = await axios.delete(`http://localhost:5000/supplier/${supplier._id}`);
                    if (!data.acknowledged && !data.deletedCount) {
                        throw new Error("Failed to delete supplier");
                    }
                    toast.success("Supplier deleted successfully", { id: toastId });
                    refetch();
                } catch (error) {
                    toast.error(error?.response?.data?.message || error.message || "Failed to delete supplier", { id: toastId });
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-base-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-base-content tracking-tight">Suppliers</h1>
                    <h2 className="text-sm font-normal text-base-content/60 mt-1">Manage and organize all your vendors, suppliers, and contacts</h2>
                </div>
                <AddSupplier refetch={refetch} className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors duration-150">
                    <Plus size={18} />
                    <span>Add Supplier</span>
                </AddSupplier>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-200 shadow-xs">
                <table className="table">
                    <thead>
                        <tr className="border-b border-base-200 text-xs font-semibold uppercase text-base-content/70">
                            <th>S/N</th>
                            <th>Supplier Name</th>
                            <th>Contact Person</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Notes</th>
                            <th>Updated</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-sm text-base-content/50">
                                    Loading suppliers...
                                </td>
                            </tr>
                        ) : !suppliers || suppliers.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-sm text-base-content/50">
                                    No suppliers registered yet. Click &quot;Add Supplier&quot; to add your first vendor.
                                </td>
                            </tr>
                        ) : (
                            suppliers.map((supplier, index) => (
                                <tr key={supplier._id || index} className="hover:bg-base-200/40 border-b border-base-200/60 transition-colors">
                                    <th className="text-base-content/60 font-normal">{index + 1}</th>
                                    <td className="font-semibold text-base-content">
                                        <div className="flex items-center gap-2">
                                            <span>{supplier.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {supplier.contactPerson ? (
                                            <span className="inline-flex items-center gap-1.5 text-sm text-base-content/80">
                                                <User size={14} className="text-base-content/40" /> {supplier.contactPerson}
                                            </span>
                                        ) : (
                                            <span className="text-base-content/30 text-xs">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {supplier.phone ? (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-mono text-base-content/80">
                                                <Phone size={13} className="text-base-content/40" /> {supplier.phone}
                                            </span>
                                        ) : (
                                            <span className="text-base-content/30 text-xs">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {supplier.email ? (
                                            <span className="text-sm text-base-content/70">{supplier.email}</span>
                                        ) : (
                                            <span className="text-base-content/30 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="max-w-xs truncate text-sm text-base-content/70">
                                        {supplier.address || <span className="text-base-content/30 text-xs">—</span>}
                                    </td>
                                    <td className="max-w-xs truncate text-xs text-base-content/60">
                                        {supplier.notes || <span className="text-base-content/30 text-xs">—</span>}
                                    </td>
                                    <td className="text-xs text-base-content/60 whitespace-nowrap">
                                        {supplier.updatedAt ? format(new Date(supplier.updatedAt), "PP") : "—"}
                                    </td>
                                    <th className="text-center">
                                        <div className="dropdown dropdown-left">
                                            <div tabIndex={0} role="button" className="cursor-pointer duration-200 hover:bg-base-200 rounded-full p-1.5 inline-flex items-center justify-center text-base-content/70 hover:text-base-content">
                                                <EllipsisVertical size={18} />
                                            </div>
                                            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-20 w-44 p-1.5 shadow-md border border-base-200">
                                                <EditSupplier supplier={supplier} refetch={refetch} className="w-full">
                                                    <a className="text-sm">Edit Supplier</a>
                                                </EditSupplier>
                                                <li>
                                                    <a onClick={() => handleDelete(supplier)} className="text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700">Delete</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </th>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Supplier;

