"use client"
import DataContext from '@/Context/DataContext';
import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const AddCategory = ({ className, children, refetch }) => {
    const modalRef = useRef();
    const { selectRef } = useContext(DataContext);
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation()
        modalRef.current.close();

        const formData = { name, description }



        console.log(formData);
        // Handle form submission logic here
        const toastId = toast.loading("Adding category...");
        try {
            const { data: result } = await axios.post("http://localhost:5000/category", formData);
            console.log(result);
            if (!result.insertedId) {
                throw new Error("Failed to add category");
            }

            await refetch?.();
            setName("")
            setDescription("")
            toast.success("Category added successfully.", { id: toastId });
            setTimeout(() => {
                if (selectRef?.current) {
                    selectRef.current.value = result.insertedId // Reset the select input value
                }
            }, 100);

        } catch (error) {
            toast.error(error.message || error.statusText || "Something went wrong", { id: toastId });
        }
    }

    return (
        <>
            <button onClick={() => modalRef.current.showModal()} className={className} type='button'>{children}</button>

            {
                modalRef && mounted &&
                createPortal(
                    <dialog ref={modalRef} className="modal">
                        <div className="modal-box">

                            {/* Close button */}
                            <button onClick={(e) => {
                                e.stopPropagation();
                                modalRef.current.close();
                            }} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" >✕</button>

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-base-content">Add New Category</h3>
                                <p className="text-sm text-base-content/50 mt-0.5">Fill in the details to create a new product category</p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">

                                {/* Category Name */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="name">
                                        <span className="label-text text-sm font-medium text-base-content/80">Category Name</span>
                                    </label>
                                    <input
                                        onChange={(e) => setName(e.target.value)}
                                        type="text"
                                        placeholder="e.g. Smartphones, Laptops"
                                        name='name'
                                        className="input input-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150"
                                        required
                                        value={name}
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-control gap-1.5">
                                    <label className="label py-0" htmlFor="description">
                                        <span className="label-text text-sm font-medium text-base-content/80">Description</span>
                                    </label>
                                    <textarea
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Briefly describe this category..."
                                        rows={3}
                                        className="textarea textarea-bordered w-full focus:border-violet-400 focus:outline-none transition-colors duration-150 resize-none"
                                        value={description}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => modalRef.current.close()} className="btn btn-ghost btn-sm">Cancel</button>
                                    <button onClick={handleSubmit} className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm">Add Category</button>
                                </div>

                            </div>

                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button type='button'>close</button>
                        </form>
                    </dialog>, document.body
                )

            }
        </>
    );
};


export default AddCategory;