import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

const EditCategory = ({ category, children, className }) => {
    const modalRef = useRef()
    const handleEdit = (e) => {
        e.preventDefault()
        const formData = Object.fromEntries(new FormData(e.target))
        console.log(formData);
        // Handle form submission logic here
    }

    return (
        <>
            <li onClick={() => modalRef.current.showModal()} className={className}>{children}</li>
            {
                createPortal(

                    <dialog ref={modalRef} className="modal">
                        <div className="modal-box">

                            {/* Close button */}
                            <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                            </form>

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-base-content">Add New Category</h3>
                                <p className="text-sm text-base-content/50 mt-0.5">Fill in the details to create a new product category</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleEdit} className="space-y-4">

                                {/* Category Name */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="categoryName">
                                        <span className="label-text text-sm font-medium text-base-content/80">Category Name</span>
                                    </label>
                                    <input
                                        name="categoryName"
                                        type="text"
                                        placeholder="e.g. Smartphones, Laptops"
                                        className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                        required
                                        defaultValue={category?.categoryName}
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="description">
                                        <span className="label-text text-sm font-medium text-base-content/80">Description</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Briefly describe this category..."
                                        rows={3}
                                        className="textarea textarea-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150 resize-none"
                                        defaultValue={category?.description}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => modalRef.current.close()} className="btn btn-ghost btn-sm">Cancel</button>
                                    <button type="submit" className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm">Edit Category</button>
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

export default EditCategory;