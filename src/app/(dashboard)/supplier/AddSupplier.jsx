"use client"
import axios from 'axios';
import React, { useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const subscribe = () => () => {};

const AddSupplier = ({ className, children, refetch, onSuccess }) => {
    const modalRef = useRef(null);
    const formRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const form = e.target;
        const formData = Object.fromEntries(new FormData(form));

        if (!formData.name?.trim()) {
            toast.error("Supplier name is required");
            return;
        }

        const toastId = toast.loading("Adding supplier...");
        setSubmitting(true);
        try {
            const { data: result } = await axios.post("http://localhost:5000/supplier", formData);
            if (!result.insertedId) {
                throw new Error("Failed to add supplier");
            }

            await refetch?.();
            onSuccess?.(result.insertedId);
            form.reset();
            modalRef.current?.close();
            toast.success("Supplier added successfully.", { id: toastId });
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button onClick={() => modalRef.current?.showModal()} className={className} type="button">{children}</button>

            {isClient && createPortal(
                <dialog ref={modalRef} className="modal z-50">
                    <div className="modal-box max-w-lg text-left">
                        {/* Close button */}
                        <button onClick={(e) => { e.stopPropagation(); modalRef.current?.close(); }} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                        {/* Header */}
                        <div className="mb-5">
                            <h3 className="text-lg font-bold text-base-content">Add New Supplier</h3>
                            <p className="text-sm text-base-content/60 mt-0.5">Fill in the details to register a new vendor or supplier.</p>
                        </div>

                        {/* Form */}
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Supplier Name */}
                                <div className="sm:col-span-2 form-control gap-1">
                                    <label className="text-xs font-semibold text-base-content/80 uppercase tracking-wide">
                                        Supplier Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input required name="name" type="text" placeholder="e.g. Star Tech Ltd, Apple Gadget BD" className="input input-bordered w-full text-sm focus:border-indigo-400 focus:outline-none" />
                                </div>

                                {/* Phone */}
                                <div className="form-control gap-1">
                                    <label className="text-xs font-semibold text-base-content/80 uppercase tracking-wide">
                                        Phone Number <span className="text-rose-500">*</span>
                                    </label>
                                    <input required name="phone" type="text" placeholder="e.g. 01700000000" className="input input-bordered w-full text-sm focus:border-indigo-400 focus:outline-none" />
                                </div>

                                {/* Contact Person */}
                                <div className="form-control gap-1">
                                    <label className="text-xs font-semibold text-base-content/80 uppercase tracking-wide">
                                        Contact Person
                                    </label>
                                    <input name="contactPerson" type="text" placeholder="e.g. Kamal Hossain" className="input input-bordered w-full text-sm focus:border-indigo-400 focus:outline-none" />
                                </div>

                                {/* Email */}
                                <div className="sm:col-span-2 form-control gap-1">
                                    <label className="text-xs font-semibold text-base-content/80 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <input name="email" type="email" placeholder="e.g. sales@vendor.com" className="input input-bordered w-full text-sm focus:border-indigo-400 focus:outline-none" />
                                </div>

                                {/* Address */}
                                <div className="sm:col-span-2 form-control gap-1">
                                    <label className="text-xs font-semibold text-base-content/80 uppercase tracking-wide">
                                        Address / Shop Location
                                    </label>
                                    <input name="address" type="text" placeholder="e.g. Level 4, Multiplan Center, Dhaka" className="input input-bordered w-full text-sm focus:border-indigo-400 focus:outline-none" />
                                </div>

                                {/* Notes */}
                                <div className="sm:col-span-2 form-control gap-1">
                                    <label className="text-xs font-semibold text-base-content/80 uppercase tracking-wide">
                                        Notes &amp; Terms
                                    </label>
                                    <textarea name="notes" rows={2} placeholder="e.g. 7 days replacement, cash on delivery terms..." className="textarea textarea-bordered w-full text-sm resize-none focus:border-indigo-400 focus:outline-none" />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-base-200">
                                <button type="button" onClick={() => modalRef.current?.close()} className="btn btn-ghost btn-sm">Cancel</button>
                                <button disabled={submitting} type="submit" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm">
                                    {submitting ? "Adding..." : "Add Supplier"}
                                </button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={() => modalRef.current?.close()}>close</button>
                    </form>
                </dialog>,
                document.body
            )}
        </>
    );
};

export default AddSupplier;
