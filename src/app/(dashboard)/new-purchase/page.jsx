'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Check, ChevronDown, Plus, RefreshCw, Save, Scan, Search, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import AddSupplier from '../supplier/AddSupplier';

const NewPurchase = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Fetch existing catalog products so the user can select which product this purchase is for
    const { data: productsName } = useQuery({
        queryKey: ["productsName"],
        queryFn: async () => {
            const { data } = await axios.get("http://localhost:5000/products-name-id");
            return Array.isArray(data) ? data : [];
        }
    });

    // Fetch existing suppliers (name and id) for dropdown selection
    const { data: suppliersName, refetch: refetchSuppliers } = useQuery({
        queryKey: ["suppliersName"],
        queryFn: async () => {
            const { data } = await axios.get("http://localhost:5000/suppliers/names");
            return Array.isArray(data) ? data : [];
        }
    });

    const [selectedSupplierId, setSelectedSupplierId] = useState("");

    // Target Product Search & Select Combobox State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState(() => new Date().toLocaleDateString('en-CA'));
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter products from existing catalog products
    const filteredProducts = productsName?.filter((prod) =>
        prod?.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    ) || [];

    // Variants & Combinations State (Moved from Add Product)
    const [variantCount, setVariantCount] = useState([{ id: crypto.randomUUID(), name: "", value: [] }]);
    const [combinations, setCombinations] = useState([]);
    const removedCombination = useRef([]);

    // IMEI tracking state (Moved from Add Product)
    const modalRef = useRef();
    const [hasIMEI, setHasIMEI] = useState(false);
    const [activeComboModal, setActiveComboModal] = useState("");
    const [IMEIs, setIMEIs] = useState([]);

    const successSwal = () => {
        Swal.fire({
            title: "Purchase Recorded Successfully!",
            text: "Stock and variant inventory have been updated.",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "View Products",
            cancelButtonText: "Add Another Purchase",
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
        setVariantCount([{ id: crypto.randomUUID(), name: "", value: [] }]);
        setCombinations([]);
        setIMEIs([]);
        setHasIMEI(false);
        removedCombination.current = [];
        setSelectedProduct(null);
        setSearchQuery("");
        setIsDropdownOpen(false);
        setSelectedSupplierId("");
        setPurchaseDate(new Date().toLocaleDateString('en-CA'));
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
        const newVariant = variantCount.filter((variant) => variant.id !== tempId);
        newCombination(newVariant);
        setVariantCount(newVariant);
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

            const newVariantValue = variantCount.map((value) => {
                if (value.id === id) {
                    return { ...value, value: [...(value.value || []), theInput] };
                }
                return value;
            });

            setVariantCount(newVariantValue);
            e.target.value = "";
            newCombination(newVariantValue);
        }
    };

    const removeVariantValue = (id, value) => {
        setVariantCount((prev) => {
            const newVariantValue = prev.map(obj => {
                if (obj.id === id) {
                    const tempValue = obj.value.filter((prevValue) => prevValue !== value);
                    return { ...obj, value: tempValue };
                }
                return obj;
            });
            newCombination(newVariantValue);
            return newVariantValue;
        });
    };

    const newCombination = (variantValue) => {
        const allVariantValueArray = variantValue.map(item => item.value).filter(item => item && item.length > 0);
        if (allVariantValueArray.length === 0) {
            setCombinations([]);
            return;
        }

        let combination = [[]];
        for (let singleArrayValue of allVariantValueArray) {
            combination = combination.flatMap(a =>
                singleArrayValue.map(b => [...a, b])
            );
        }

        const removedCombinationInStr = removedCombination?.current?.map(item => item.join(","));
        const filteredCombination = combination.filter((item) => !removedCombinationInStr.includes(item.join(",")));
        setCombinations(filteredCombination);
    };

    const removeCombination = (single) => {
        removedCombination.current.push(single);
        setCombinations((prev) =>
            prev.filter((combination) => combination.join(",") !== single.join(","))
        );
    };

    const regenerateCombination = () => {
        removedCombination.current = [];
        newCombination(variantCount);
    };

    // IMEI Handlers
    const openModal = (activeKey) => {
        setActiveComboModal(activeKey.join(","));
        modalRef.current?.showModal();
    };

    const handleAddIMEI = (e) => {
        const value = e.target.value.trim();
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (!value) return;

            const isDuplicate = IMEIs.some(obj => Object.values(obj)[0]?.includes(value));
            if (isDuplicate) {
                toast.error(`IMEI "${value}" has already been added!`);
                return;
            }
            e.target.value = "";

            setIMEIs(prev => {
                const prevIMEI = prev.find(obj => obj[activeComboModal])?.[activeComboModal] || [];
                if (prev.length > 0) {
                    const prevObj = prev.find(obj => obj[activeComboModal]);
                    if (prevObj) {
                        return prev.map(obj =>
                            obj[activeComboModal] ? { [activeComboModal]: [...obj[activeComboModal], value] } : obj
                        );
                    }
                    return [...prev, { [activeComboModal]: [...prevIMEI, value] }];
                }
                return [{ [activeComboModal]: [...prevIMEI, value] }];
            });
        }
    };

    const handleRemoveIMEI = (imei) => {
        const thisIsTheObj = IMEIs.find(obj => obj[activeComboModal]);
        if (!thisIsTheObj) return;
        const filteredArray = thisIsTheObj[activeComboModal].filter(value => value !== imei);

        setIMEIs(prev => {
            return prev.map(obj => obj[activeComboModal] ? { [activeComboModal]: filteredArray } : obj);
        });
    };

    const IMEIsToMap = IMEIs.find(obj => obj[activeComboModal])?.[activeComboModal] || [];

    // Form Submission
    const handleSavePurchase = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = Object.fromEntries(new FormData(form));

        if (!selectedProduct?._id) {
            toast.error("Please select a target catalog product!");
            return;
        }

        if (!formData.supplierId) {
            toast.error("Please select a supplier!");
            return;
        }

        const matchedSupplier = suppliersName?.find(s => s._id === formData.supplierId);
        if (matchedSupplier) {
            formData.supplier = matchedSupplier.name;
            formData.supplierName = matchedSupplier.name;
        }

        const activeVariants = variantCount.filter(v => v.value && v.value.length > 0);

        const variants = combinations.map((combination, index) => {
            const attributes = combination.map((val, i) => ({
                name: activeVariants[i]?.name || `Option ${i + 1}`,
                value: val
            }));

            const variantObj = {
                combination,
                title: combination.join(" / "),
                attributes,
                barcode: formData[`barcode${index + 1}`] || "",
                purchasePrice: Number(formData[`purchasePrice${index + 1}`]) || 0,
                retailPrice: Number(formData[`retailPrice${index + 1}`]) || 0,
                mrp: Number(formData[`mrp${index + 1}`]) || 0,
                imeis: IMEIs.find(obj => obj[combination.join(",")])?.[combination.join(",")] || [],
                quantity: Number(formData[`quantity${index + 1}`]) || 0,
            };

            delete formData[`barcode${index + 1}`];
            delete formData[`purchasePrice${index + 1}`];
            delete formData[`retailPrice${index + 1}`];
            delete formData[`mrp${index + 1}`];
            delete formData[`quantity${index + 1}`];

            return variantObj;
        });

        // Numeric conversions & structure
        formData.warranty = Number(formData.warranty) || 0;
        formData.shippingCost = Number(formData.shippingCost) || 0;
        formData.extraCost = Number(formData.extraCost) || 0;
        formData.variantTypes = activeVariants.map(v => v.name);
        formData.variants = variants;
        formData.hasImei = formData.hasImei === "on";

        const toastId = toast.loading("Saving purchase record...");
        setSubmitting(true);
        try {
            const { data: result } = await axios.post("http://localhost:5000/purchase", formData);
            if (!result.insertedId && !result.acknowledged) {
                throw new Error("Failed to save purchase");
            }
            toast.dismiss(toastId);
            resetFormPage(form);
            successSwal();
        } catch (error) {
            toast.error(error.message || "Something went wrong", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };








    return (
        <div className="min-h-screen bg-slate-50">
            <form onSubmit={handleSavePurchase} className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Link href="/product" className="btn btn-sm btn-ghost p-1.5 hover:bg-slate-100 text-slate-700">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">New Purchase</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Receive inventory stock, set supplier terms, and register hardware IMEIs.</p>
                        </div>
                    </div>

                    <Link href="/product" className="btn btn-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300">
                        View Products
                    </Link>
                </div>

                {/* Section 1: Purchase & Product Details */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="pb-4 border-b border-slate-200 flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">1</span>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Purchase Information</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Select the target catalog product and specify supplier terms.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Select Catalog Product (Search & Select Combobox) */}
                        <div ref={dropdownRef} className="md:col-span-2 flex flex-col gap-1.5 relative">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Target Product <span className="text-rose-500">*</span>
                            </label>

                            {/* Hidden input to pass productId with standard form submission */}
                            <input type="hidden" name="productId" value={selectedProduct?._id || ""} />

                            <div className="relative flex items-center">
                                <input type="text" placeholder="Search existing catalog products..." value={selectedProduct ? selectedProduct.name : searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (selectedProduct) setSelectedProduct(null); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} className="input w-full pl-9 pr-16 border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                                <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />

                                <div className="absolute right-3 flex items-center gap-1.5">
                                    {selectedProduct && (
                                        <button type="button" onClick={() => { setSelectedProduct(null); setSearchQuery(""); setIsDropdownOpen(true); }} title="Clear selection" className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer">
                                            <X size={14} />
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setIsDropdownOpen(prev => !prev)} title="Toggle dropdown" className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer">
                                        <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <ul className="absolute z-30 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-sm">
                                    {filteredProducts.length === 0 ? (
                                        <li className="px-4 py-3 text-xs text-slate-400 text-center">
                                            No product found matching &quot;{searchQuery}&quot;
                                        </li>
                                    ) : (
                                        filteredProducts.map((prod) => {
                                            const isSelected = selectedProduct?._id === prod._id;
                                            return (
                                                <li key={prod._id} onClick={() => { setSelectedProduct(prod); setSearchQuery(""); setIsDropdownOpen(false); }} className={`px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-indigo-50/60 transition-colors ${isSelected ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-800"}`}>
                                                    <span>{prod.name}</span>
                                                    {isSelected && <Check size={16} className="text-indigo-600" />}
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Supplier with Add Supplier Quick Modal */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Supplier / Vendor <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex gap-2 items-center">
                                <select required name="supplierId" value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className="select w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 text-sm">
                                    <option value="">Select Supplier</option>
                                    {suppliersName?.map((sup) => (
                                        <option key={sup._id} value={sup._id}>{sup.name}</option>
                                    ))}
                                </select>
                                <AddSupplier onSuccess={(newId) => setSelectedSupplierId(newId)} refetch={refetchSuppliers} className="btn btn-square shrink-0 border-slate-300 hover:bg-slate-100">
                                    <Plus size={18} />
                                </AddSupplier>
                            </div>
                        </div>

                        {/* Invoice / Bill No */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Purchase Invoice / Challan #
                            </label>
                            <input name="invoiceNo" type="text" placeholder="e.g. PO-2026-001" className="w-full input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>

                        {/* Purchase Date */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Purchase Date
                            </label>
                            <input name="purchaseDate" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 text-sm" />
                        </div>

                        {/* Condition */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Condition
                            </label>
                            <select name="condition" className="select w-full border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 text-sm">
                                <option value="new">New</option>
                                <option value="refurbished">Refurbished</option>
                                <option value="used">Used</option>
                            </select>
                        </div>

                        {/* Warranty */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Warranty (Months)
                            </label>
                            <input name="warranty" type="number" min="0" placeholder="e.g. 12" className="w-full input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>

                        {/* Shipping Cost */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Shipping Cost
                            </label>
                            <input name="shippingCost" type="number" step="0.01" min="0" placeholder="0.00" className="w-full input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>

                        {/* Extra Cost */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                Extra Cost
                            </label>
                            <input name="extraCost" type="number" step="0.01" min="0" placeholder="0.00" className="w-full input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                        </div>
                    </div>
                </div>

                {/* * ========================================================= */}
                {/* * SECTION 2: Dynamic Variant Attributes (Color, RAM, Storage) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="pb-4 border-b border-slate-200 flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">2</span>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Add Variants</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Define attributes like Color, Storage, or RAM. Values will multiply into individual stock combinations.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {variantCount?.map((variant) => (
                            <div key={variant.id} className="rounded-xl flex items-end gap-3 p-4 border border-slate-200 bg-slate-50">
                                <div className="shrink-0 flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Variant Name</label>
                                    <input value={variant.name || ""} onChange={(e) => handleVariantName(variant.id, e.target.value)} type="text" placeholder="e.g. Color" className="input border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm" />
                                </div>
                                <div className="w-full flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Variant Values</label>
                                    <div className="input gap-0 w-full border-slate-300 bg-white flex items-center  min-h-10">
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
                </div>

                {/* Section 3: Variant Pricing & Inventory */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">3</span>
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Variant Pricing &amp; Inventory</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Set purchase cost, retail price, stock quantity, barcode, and IMEI tracking.</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <label className="btn btn-sm border-slate-300 text-slate-700 bg-white hover:bg-slate-100 gap-2 cursor-pointer">
                                <input onChange={(e) => setHasIMEI(e.target.checked)} checked={hasIMEI} type="checkbox" name="hasImei" className="checkbox checkbox-sm" />
                                <span className="text-xs font-semibold tracking-wide">TRACK IMEI</span>
                            </label>
                            <button onClick={regenerateCombination} type="button" className="btn btn-sm bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 group gap-1.5">
                                <RefreshCw size={15} className="group-hover:rotate-180 duration-300" /> Regenerate
                            </button>
                        </div>
                    </div>

                    <div className="">
                        <table className="table">
                            <thead>
                                <tr className="text-xs text-slate-600 uppercase tracking-wide border-b border-slate-200 *:px-3">
                                    <th>S/N</th>
                                    <th>Variant Combination</th>
                                    <th>Barcode</th>
                                    <th>Purchase Price</th>
                                    <th>Retail Price</th>
                                    <th>MRP</th>
                                    <th>QTY</th>
                                    {hasIMEI && <th>IMEI</th>}
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {combinations.length === 0 ? (
                                    <tr>
                                        <td colSpan={hasIMEI ? 9 : 8} className="text-center py-6 text-xs text-slate-400">
                                            No combinations generated yet. Add variant values above to create inventory combinations.
                                        </td>
                                    </tr>
                                ) : (
                                    combinations.map((combination, index) => {
                                        const IMEI = IMEIs.find(obj => obj[combination.join(',')])?.[combination.join(",")] || [];

                                        return (
                                            <tr key={combination.join(",")} className="hover:bg-slate-50 *:px-3 border-b border-slate-100">
                                                <th className="text-slate-500 font-normal">{index + 1}</th>
                                                <td className="min-w-40">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {combination.map((value, i) => (
                                                            <span key={i} className="badge badge-sm bg-slate-100 text-slate-700 border-slate-200 font-medium">
                                                                {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <input name={`barcode${index + 1}`} type="text" placeholder="Scan or enter barcode" className="input input-sm input-bordered border-slate-300 w-44 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none" />
                                                </td>
                                                <td>
                                                    <input name={`purchasePrice${index + 1}`} type="number" step="0.01" placeholder="0.00" className="input input-sm input-bordered border-slate-300 w-32 text-slate-800 focus:border-indigo-400 focus:outline-none" />
                                                </td>
                                                <td>
                                                    <input name={`retailPrice${index + 1}`} type="number" step="0.01" placeholder="0.00" className="input input-sm input-bordered border-slate-300 w-32 text-slate-800 focus:border-indigo-400 focus:outline-none" />
                                                </td>
                                                <td>
                                                    <input name={`mrp${index + 1}`} type="number" step="0.01" placeholder="0.00" className="input input-sm input-bordered border-slate-300 w-32 text-slate-800 focus:border-indigo-400 focus:outline-none" />
                                                </td>
                                                <td>
                                                    {hasIMEI ? (
                                                        <input key="imei-qty" name={`quantity${index + 1}`} value={IMEI.length} type="number" min="0" readOnly className="input input-sm input-bordered w-20 bg-indigo-50 font-bold text-indigo-700 border-indigo-200 cursor-not-allowed focus:outline-none" />
                                                    ) : (
                                                        <input key="manual-qty" name={`quantity${index + 1}`} defaultValue="0" type="number" min="0" placeholder="0" className="input input-sm input-bordered w-20 border-slate-300 text-slate-800 focus:border-indigo-400 focus:outline-none" />
                                                    )}
                                                </td>
                                                {hasIMEI && (
                                                    <td>
                                                        <button onClick={() => openModal(combination)} type="button" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none font-medium">
                                                            Add IMEIs
                                                        </button>
                                                    </td>
                                                )}
                                                <td className="text-center">
                                                    <button onClick={() => removeCombination(combination)} type="button" className="btn btn-ghost btn-xs btn-square text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                                                        <X size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                    <Link href="/product" className="btn btn-sm border-slate-300 text-slate-600 bg-white hover:bg-slate-100">
                        Cancel
                    </Link>
                    <button disabled={submitting} type="submit" className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm gap-2 px-6">
                        <Save size={16} /> Save Purchase
                    </button>
                </div>
            </form>

            {/* IMEI Modal */}
            <dialog ref={modalRef} className="modal z-50">
                <div className="modal-box bg-white border border-slate-200 shadow-xl text-slate-900">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-slate-500 hover:bg-slate-100">✕</button>
                    </form>
                    <h3 className="font-bold text-base text-slate-900 mb-4">Add IMEI Serials</h3>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Scan or Enter IMEI</label>
                    <div className="relative">
                        <input autoFocus type="text" onKeyDown={handleAddIMEI} placeholder="Scan IMEI or paste multiple (Enter to add)..." className="input input-bordered w-full pr-10 font-mono text-sm border-slate-300 focus:border-indigo-400 focus:outline-none text-slate-900 placeholder:text-slate-400" />
                        <Scan size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 mt-5">
                        Scanned IMEIs ({IMEIsToMap.length})
                    </label>
                    <div className="w-full min-h-28 max-h-96 overflow-y-auto rounded-lg bg-slate-50 border border-slate-200 p-3 flex gap-1.5 flex-wrap items-start">
                        {IMEIsToMap.map((item) => (
                            <div key={item} className="bg-white px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1.5 text-xs font-mono text-slate-800">
                                <span>{item}</span>
                                <button onClick={() => handleRemoveIMEI(item)} className="cursor-pointer text-slate-400 hover:text-rose-500 transition-colors">
                                    <X size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default NewPurchase;
