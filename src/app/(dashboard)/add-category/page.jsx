'use client'
import axios from 'axios';
import { ArrowLeft, FolderPlus, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AddCategoryPage = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setName('');
        setDescription('');
    };

    const handleSuccessSwal = () => {
        Swal.fire({
            title: "Category Saved Successfully!",
            text: "What would you like to do next?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "View All Categories",
            cancelButtonText: "Add Another Category",
            confirmButtonColor: "#4f46e5",
            cancelButtonColor: "#64748b",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.push("/category");
            } else {
                resetForm();
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Please enter a category name");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Saving category...");

        try {
            const formData = {
                name: trimmedName,
                description: description.trim()
            };

            const { data: result } = await axios.post("http://localhost:5000/category", formData);

            if (!result.insertedId) {
                throw new Error("Failed to save category");
            }

            toast.dismiss(toastId);
            resetForm();
            handleSuccessSwal();
        } catch (error) {
            toast.error(error.message || "Failed to add category", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Link href="/category" className="btn btn-sm btn-ghost p-1.5 hover:bg-slate-100 text-slate-700">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Add New Category</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Create a product category to organize your inventory.</p>
                        </div>
                    </div>

                    <Link href="/category" className="btn btn-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300">
                        All Categories
                    </Link>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600">
                            <FolderPlus size={18} />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Category Details</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Provide a name and an optional description for this category.</p>
                        </div>
                    </div>

                    {/* Category Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Category Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Smartphones, Laptops, Audio, Accessories..."
                            className="input w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Description <span className="text-slate-400 text-[11px] font-normal lowercase">(optional)</span>
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what kind of products belong in this category..."
                            className="textarea textarea-bordered w-full resize-none border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <Link href="/category" className="btn btn-sm border-slate-300 text-slate-600 bg-white hover:bg-slate-100">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm gap-2 px-5 disabled:bg-slate-200 disabled:text-slate-400"
                        >
                            {submitting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <Save size={16} />
                            )}
                            <span>Save Category</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddCategoryPage;

