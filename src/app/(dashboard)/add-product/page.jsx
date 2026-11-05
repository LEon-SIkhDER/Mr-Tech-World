'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Layers, Package, Plus, Save, UploadCloud, X } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import AddCategory from '../category/AddCategory';
import DataContext from '@/Context/DataContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import upLoadImagesToCloudinary from '@/app/lib/upLoadImagesToCloudinary';

const AddProduct = () => {
    const router = useRouter();
    const { selectRef } = useContext(DataContext);
    const [submitting, setSubmitting] = useState(false);
    // Stores an array of { file, preview } objects (previews generated from original files)
    const [images, setImages] = useState([]);
    // Holds quietly compressed File objects in background, ready for Cloudinary upload
    const compressedImagesRef = useRef([]);
    const compressedCache = useRef(new Map());
    const fileInputRef = useRef(null);
    const imagesRef = useRef([]);

    // Product Type State ('simple' | 'variable')
    const [productType, setProductType] = useState("simple");

    // Variants State
    const [variantCount, setVariantCount] = useState([{ id: crypto.randomUUID(), name: "", value: [] }]);

    const { data: categoriesName, refetch } = useQuery({
        queryKey: ["categoriesName"],
        queryFn: async () => {
            const { data: result } = await axios.get("http://localhost:5000/categories/names");
            return result;
        }
    });

    const successSwal = () => {
        Swal.fire({
            title: "Product Saved Successfully!",
            text: "What would you like to do next?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "View All Products",
            cancelButtonText: "Add Another Product",
            confirmButtonColor: "#4f46e5",
            cancelButtonColor: "#64748b",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.push("/product");
            }
        });
    };

    const resetFormPage = (formEl) => {
        if (formEl?.reset) {
            formEl.reset();
        }
        images.forEach(img => {
            if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
        });
        setImages([]);
        compressedImagesRef.current = [];
        compressedCache.current.clear();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setVariantCount([{ id: crypto.randomUUID(), name: "", value: [] }]);
        setProductType("simple");
    };

    // Variant Handlers
    const addNewVariant = () => {
        let tempId;
        do {
            tempId = crypto.randomUUID();
        } while (variantCount.some((variant) => variant.id === tempId));

        setVariantCount(prev => [...prev, { id: tempId, name: "", value: [] }]);
    };

    const handleVariantName = (id, name) => {
        setVariantCount(prev => prev.map(variant => variant.id === id ? { ...variant, name } : variant));
    };

    const removeVariant = (tempId) => {
        setVariantCount(prev => prev.filter((variant) => variant.id !== tempId));
    };

    const addVariantValue = (e, id) => {
        if (e.key === "Enter" || e.key === ',') {
            e.preventDefault();
            const theInput = e.target.value.trim();
            if (!theInput) return;

            const currentVariant = variantCount.find(v => v.id === id);
            const isDuplicate = currentVariant?.value?.some(
                val => val.toLowerCase() === theInput.toLowerCase()
            );

            if (isDuplicate) {
                toast.error(`"${theInput}" has already been added to this variant!`);
                e.target.value = "";
                return;
            }

            setVariantCount(prev => prev.map((item) => {
                if (item.id === id) {
                    return { ...item, value: [...(item.value || []), theInput] };
                }
                return item;
            }));
            e.target.value = "";
        }
    };

    const removeVariantValue = (id, value) => {
        setVariantCount((prev) => {
            return prev.map(obj => {
                if (obj.id === id) {
                    const tempValue = obj.value.filter((prevValue) => prevValue !== value);
                    return { ...obj, value: tempValue };
                }
                return obj;
            });
        });
    };

    // Keep imagesRef updated for unmount cleanup
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    // Clean up temporary blob object URLs only when component unmounts
    useEffect(() => {
        return () => {
            imagesRef.current.forEach(img => {
                if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
            });
        };
    }, []);

    // Quietly compress images in the background whenever images change
    useEffect(() => {
        const compressQuietly = async () => {
            const currentFiles = images.map(img => img.file).filter(Boolean);
            if (currentFiles.length === 0) {
                compressedImagesRef.current = [];
                return;
            }

            // Immediately map ref using any already cached compressed files or original fallback
            compressedImagesRef.current = currentFiles.map(file => compressedCache.current.get(file) || file);

            // Compress newly added files quietly in background via web worker
            await Promise.all(
                currentFiles.map(async (file) => {
                    if (compressedCache.current.has(file)) return;
                    try {
                        const options = {
                            maxSizeMB: 0.3,
                            maxWidthOrHeight: 1200,
                            useWebWorker: true,
                            fileType: 'image/webp',
                            initialQuality: 0.8,
                        };
                        const compressed = await imageCompression(file, options);
                        compressedCache.current.set(file, compressed);
                    } catch (err) {
                        console.warn('Quiet compression fallback for:', file.name, err);
                        compressedCache.current.set(file, file);
                    }
                })
            );

            // Keep ref strictly synchronized with current images order
            compressedImagesRef.current = currentFiles.map(file => compressedCache.current.get(file) || file);
        };

        compressQuietly();
    }, [images]);

    // Only handles image validation and creating the visual preview
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const validFiles = files.filter(file => {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 10MB size limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Creates preview URL for screen and preserves the raw file for handleAddProduct
        const newItems = validFiles.map(file => ({
            file: file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newItems]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        const item = images[indexToRemove];
        if (item?.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(item.preview);
        }
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleClearAllImages = () => {
        images.forEach(img => {
            if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
        });
        setImages([]);
        compressedImagesRef.current = [];
        compressedCache.current.clear();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // You handle upload related things here!
    const handleAddProduct = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = Object.fromEntries(new FormData(form));
        console.log("Form Data:", formData);
        console.log("Original Images (for previews):", images);
        console.log("Compressed Images in Ref (ready for Cloudinary):", compressedImagesRef.current);

        formData.productType = productType;

        if (productType === "variable") {
            const activeVariants = variantCount.filter(v => v.name?.trim() && v.value && v.value.length > 0);
            if (activeVariants.length === 0) {
                toast.error("Please add at least one variant attribute (with name and values), or switch to Simple Product.");
                return;
            }
            formData.variantTypes = activeVariants.map(v => v.name.trim());
            formData.variantAttributes = activeVariants.map(v => ({
                name: v.name.trim(),
                values: v.value
            }));
            formData.variants = [];
        } else {
            formData.variantTypes = [];
            formData.variantAttributes = [];
            formData.variants = [
                {
                    title: "Standard",
                    combination: [],
                    attributes: [],
                    barcode: "",
                    retailPrice: 0,
                    mrp: 0,
                    quantity: 0,
                    batches: [],
                    imeis: []
                }
            ];
        }

        try {
            setSubmitting(true);
            toast.loading("Uploading Images", { id: 'toastId' });
            const imageURLs = await upLoadImagesToCloudinary(compressedImagesRef.current);
            toast.loading('Uploading Product', { id: "toastId" });
            formData.images = imageURLs;
            const { data } = await axios.post("http://localhost:5000/product", formData);
            if (!data.insertedId) {
                throw new Error("Failed to add product");
            }
            successSwal();
            toast.dismiss("toastId");
            resetFormPage(form);
            setSubmitting(false);
        } catch (error) {
            toast.error(error.message || "Something went wrong", { id: 'toastId' });
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <form onSubmit={handleAddProduct} className="max-w-5xl mx-auto py-8 px-4 space-y-6">

                {/* Page Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Link href="/product" className="btn btn-sm btn-ghost p-1.5 hover:bg-slate-100 text-slate-700">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Define general product details and catalog variants. Inventory stock is received in Purchases.</p>
                        </div>
                    </div>

                    <Link href="/product" className="btn btn-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300">
                        All Products
                    </Link>
                </div>

                {/* Basic Product Info Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="pb-4 border-b border-slate-200 flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">1</span>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">General Information</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Basic information of the parent catalog product.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Product Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Product Name <span className="text-rose-500">*</span>
                            </label>
                            <input required type="text" name="name" placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra..." className="input w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>

                        {/* Product Category with Add Category Quick Modal */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Product Category <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex gap-2 items-center">
                                <select required ref={selectRef} name="category" className="select w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 text-sm">
                                    <option value="">Select Category</option>
                                    {categoriesName?.map((category) => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))}
                                </select>
                                <AddCategory className="btn btn-square shrink-0 border-slate-300 hover:bg-slate-100" refetch={refetch}>
                                    <Plus size={18} />
                                </AddCategory>
                            </div>
                        </div>

                        {/* Brand */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Brand
                            </label>
                            <input name="brand" type="text" placeholder="e.g. Apple, Samsung, Xiaomi..." className="input w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>

                        {/* Model */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Model / Model Number
                            </label>
                            <input name="model" type="text" placeholder="e.g. A3106, SM-S928B..." className="input w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>

                        {/* Product Images Field with Multiple Preview and Remove */}
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                    Product Images {images.length > 0 && <span className="text-slate-400 font-normal">({images.length} selected)</span>}
                                </label>
                                {images.length > 0 && (
                                    <button type="button" onClick={handleClearAllImages} className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline">
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {images.length > 0 ? (
                                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        {images.map((imgItem, index) => (
                                            <div key={imgItem.preview || index} className="relative w-24 h-24 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden group shadow-2xs">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imgItem.preview || imgItem} alt={`Preview ${index + 1}`} className="w-full h-full object-contain rounded-lg" />
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                                                        Thumbnail
                                                    </span>
                                                )}
                                                <button type="button" onClick={() => handleRemoveImage(index)} title="Remove this image" className="absolute top-1 right-1 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-500 rounded-full p-1 border border-rose-200 shadow-xs transition-colors cursor-pointer">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add More button */}
                                        <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-indigo-600 gap-1 shrink-0">
                                            <Plus size={20} />
                                            <span className="text-[11px] font-medium">Add More</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">First image will be used as the primary thumbnail across POS and product tables.</p>
                                </div>
                            ) : (
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-xl p-6 text-center cursor-pointer transition-colors duration-150 flex flex-col items-center justify-center gap-1.5 bg-slate-50/60">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1">
                                        <UploadCloud size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload product images</p>
                                    <p className="text-xs text-slate-400">Select one or multiple images</p>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Product Description &amp; Specifications
                            </label>
                            <textarea name="description" rows={4} placeholder="Enter specifications, key features, or box contents..." className="textarea textarea-bordered w-full resize-none border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Dynamic Variant Attributes / Product Type */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">2</span>
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Product Type &amp; Variants</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Select product type and configure attributes if applicable.</p>
                            </div>
                        </div>

                        {/* Segmented Button: Simple Product vs Variable Product */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                            <button type="button" onClick={() => setProductType("simple")} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${productType === "simple" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
                                <Package size={14} />
                                <span>Simple Product</span>
                            </button>
                            <button type="button" onClick={() => setProductType("variable")} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${productType === "variable" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
                                <Layers size={14} />
                                <span>Variable Product</span>
                            </button>
                        </div>
                    </div>

                    {productType === "simple" ? (
                        <div className="p-5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 flex items-start gap-3.5">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                                <Package size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-indigo-950">Simple Product (No Variants)</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    This product will be created as a standalone item without color, size, or spec variations.
                                    You don&apos;t need to define any variant attributes. Barcode, purchase price, retail price, MRP, stock quantity, and optional IMEI tracking will be configured when recording inventory in <strong>New Purchase</strong>.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {variantCount?.map((variant) => (
                                <div key={variant.id} className="rounded-xl flex items-end gap-3 p-4 border border-slate-200 bg-slate-50">
                                    <div className="shrink-0 flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Variant Name</label>
                                        <input value={variant.name || ""} onChange={(e) => handleVariantName(variant.id, e.target.value)} type="text" placeholder="e.g. Color" className="input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                                    </div>
                                    <div className="w-full flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Variant Values</label>
                                        <div className="input gap-0 w-full border-slate-300 bg-white flex items-center min-h-10">
                                            {variant.value?.length > 0 &&
                                                variant.value.map((value) => (
                                                    <div key={value} className="flex items-center mr-1 bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 text-xs font-medium gap-1">
                                                        <span>{value}</span>
                                                        <button onClick={() => removeVariantValue(variant.id, value)} type="button" className="cursor-pointer hover:scale-110 text-indigo-500 hover:text-indigo-700">
                                                            <X size={11} />
                                                        </button>
                                                    </div>
                                                ))}
                                            <input onKeyDown={(e) => addVariantValue(e, variant.id)} type="text" placeholder="Type a value & press Enter" className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeVariant(variant.id)} className="cursor-pointer hover:bg-rose-100 hover:text-rose-600 text-slate-400 p-2 rounded-lg duration-200 hover:scale-110 mb-0.5">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            <button type="button" onClick={addNewVariant} className="btn btn-sm border-slate-300 text-slate-600 hover:bg-slate-100 bg-white gap-1.5">
                                <Plus size={16} /> Add New Variant
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link href="/product" className="btn btn-sm border-slate-300 text-slate-600 bg-white hover:bg-slate-100">
                        Cancel
                    </Link>
                    <button disabled={submitting} type="submit" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm gap-2 px-6">
                        <Save size={16} /> Save Product
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddProduct;
