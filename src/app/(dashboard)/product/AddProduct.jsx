"use client"
import axios from 'axios';
import React, { useRef } from 'react';
import toast from 'react-hot-toast';

const AddProduct = ({ className, children, refetch }) => {
    const modalRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = Object.fromEntries(new FormData(form));
        console.log(formData);

        const toastId = toast.loading("Adding product...");
        try {
            const { data: result } = await axios.post("http://localhost:5000/product", formData);
            console.log(result);
            if (!result.insertedId) {
                throw new Error("Failed to add product");
            }
            toast.success("Product added successfully.", { id: toastId });
            refetch?.();
            form.reset();
            modalRef.current.close();
        } catch (error) {
            toast.error("Failed to add product.", { id: toastId });
        }
    };

    return (
        <>
            <button onClick={() => modalRef.current.showModal()} className={className}>{children}</button>
            <dialog ref={modalRef} className="modal">
                <div className="modal-box">

                    {/* Close button */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-base-content">Add New Product</h3>
                        <p className="text-sm text-base-content/50 mt-0.5">Fill in the details to create a new product</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Product Name */}
                        <div className="form-control gap-1.5">
                            <label className="label py-0" htmlFor="productName">
                                <span className="label-text text-sm font-medium text-base-content/80">Product Name</span>
                            </label>
                            <input
                                id="productName"
                                name="productName"
                                type="text"
                                placeholder="e.g. iPhone 15 Pro, MacBook Pro"
                                className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="form-control gap-1.5">
                            <label className="label py-0" htmlFor="category">
                                <span className="label-text text-sm font-medium text-base-content/80">Category</span>
                            </label>
                            <input
                                id="category"
                                name="category"
                                type="text"
                                placeholder="e.g. Smartphones, Laptops"
                                className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div className="form-control gap-1.5">
                            <label className="label py-0" htmlFor="price">
                                <span className="label-text text-sm font-medium text-base-content/80">Price ($)</span>
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 999.99"
                                className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-control gap-1.5">
                            <label className="label py-0" htmlFor="description">
                                <span className="label-text text-sm font-medium text-base-content/80">Description</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Briefly describe this product..."
                                rows={3}
                                className="textarea textarea-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150 resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => modalRef.current.close()} className="btn btn-ghost btn-sm">Cancel</button>
                            <button type="submit" className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm">Add Product</button>
                        </div>

                    </form>

                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
};

export default AddProduct;
