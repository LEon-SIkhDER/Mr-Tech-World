"use client"
import axios from 'axios';
import React, { useRef } from 'react';
import toast from 'react-hot-toast';

const AddCategory = ({ className, children }) => {
    const modalRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        console.log(formData);
        // Handle form submission logic here
        const toastId  = toast.loading("Adding category...");
        try {
            const {data:result} = await axios.post("http://localhost:5000/category", formData);
            console.log(result);
            if(!result.insertedId){
                throw new Error("Failed to add category");
            }
            toast.success("Category added successfully.", { id: toastId });
            modalRef.current.close();
        } catch (error) {
            toast.error("Failed to add category.", { id: toastId });
        }
    }

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
                        <h3 className="text-lg font-bold text-base-content">Add New Category</h3>
                        <p className="text-sm text-base-content/50 mt-0.5">Fill in the details to create a new product category</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

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
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => modalRef.current.close()} className="btn btn-ghost btn-sm">Cancel</button>
                            <button type="submit" className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm">Add Category</button>
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


export default AddCategory;