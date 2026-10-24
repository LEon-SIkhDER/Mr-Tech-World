"use client"
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

const EditProduct = ({ product, children, className }) => {
    const modalRef = useRef();

    const handleEdit = (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        console.log(formData);
        // Handle form submission logic here
    };

    return (
        <>
            <li onClick={() => modalRef.current.showModal()} className={className}>{children}</li>
            {
                typeof document !== 'undefined' && createPortal(
                    <dialog ref={modalRef} className="modal">
                        <div className="modal-box">

                            {/* Close button */}
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-base-content">Edit Product</h3>
                                <p className="text-sm text-base-content/50 mt-0.5">Update the details of this product</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleEdit} className="space-y-4">

                                {/* Product Name */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="productName">
                                        <span className="label-text text-sm font-medium text-base-content/80">Product Name</span>
                                    </label>
                                    <input
                                        name="productName"
                                        type="text"
                                        placeholder="e.g. iPhone 15 Pro, MacBook Pro"
                                        className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                        required
                                        defaultValue={product?.productName}
                                    />
                                </div>

                                {/* Category */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="category">
                                        <span className="label-text text-sm font-medium text-base-content/80">Category</span>
                                    </label>
                                    <input
                                        name="category"
                                        type="text"
                                        placeholder="e.g. Smartphones, Laptops"
                                        className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                        required
                                        defaultValue={product?.category}
                                    />
                                </div>

                                {/* Price */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="price">
                                        <span className="label-text text-sm font-medium text-base-content/80">Price ($)</span>
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 999.99"
                                        className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                        required
                                        defaultValue={product?.price}
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="description">
                                        <span className="label-text text-sm font-medium text-base-content/80">Description</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Briefly describe this product..."
                                        rows={3}
                                        className="textarea textarea-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150 resize-none"
                                        defaultValue={product?.description}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => modalRef.current.close()} className="btn btn-ghost btn-sm">Cancel</button>
                                    <button type="submit" className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm">Edit Product</button>
                                </div>

                            </form>

                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button>close</button>
                        </form>
                    </dialog>,
                    document.body
                )
            }
        </>
    );
};

export default EditProduct;
