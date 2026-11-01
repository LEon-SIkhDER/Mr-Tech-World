'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, RefreshCw, Scan, Smartphone, X } from 'lucide-react';
import React, { useContext, useRef, useState } from 'react';
import AddCategory from '../category/AddCategory';
import DataContext from '@/Context/DataContext';
import Link from 'next/link';

const AddProduct2 = () => {
    const { selectRef } = useContext(DataContext);
    const [variantCount, setVariantCount] = useState([{ id: crypto.randomUUID(), value: [] }]);
    const [combinations, setCombinations] = useState([]);
    const removedCombination = useRef([]);

    // ── IMEI Tracking States ──
    const [hasImei, setHasImei] = useState(false);
    const [imeiMap, setImeiMap] = useState({}); // e.g. { "Red,128GB": ["354892019482710", "354892019482711"] }
    const [activeComboKey, setActiveComboKey] = useState(null);
    const imeiModalRef = useRef(null);
    const [imeiInput, setImeiInput] = useState('');

    const { data: categoriesName, refetch } = useQuery({
        queryKey: ["categoriesName"],
        queryFn: async () => {
            const { data: result } = await axios.get("http://localhost:5000/categories/names");
            return result;
        }
    });

    const handleAddProduct = (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));

        const variants = combinations.map((combination, index) => {
            const key = combination.join(",");
            const comboImeis = imeiMap[key] || [];

            const variantObj = {
                combination,
                title: combination.join(" / "),
                barcode: formData[`barcode${index + 1}`],
                purchasePrice: Number(formData[`purchasePrice${index + 1}`]) || 0,
                retailPrice: Number(formData[`retailPrice${index + 1}`]) || 0,
                mrp: Number(formData[`mrp${index + 1}`]) || 0,
                quantity: hasImei ? comboImeis.length : (Number(formData[`quantity${index + 1}`]) || 0),
                imeis: hasImei ? comboImeis : []
            };

            delete formData[`barcode${index + 1}`];
            delete formData[`purchasePrice${index + 1}`];
            delete formData[`retailPrice${index + 1}`];
            delete formData[`mrp${index + 1}`];
            delete formData[`quantity${index + 1}`];

            return variantObj;
        });

        formData.hasImei = hasImei;
        formData.variants = variants;
        console.log("FINAL PRODUCT PAYLOAD:", formData);
    };

    const addNewVariant = () => {
        let tempId;
        do {
            tempId = crypto.randomUUID();
        } while ((() => {
            const isIncluded = variantCount.filter((variant) => variant.id === tempId);
            return isIncluded.length !== 0;
        })());

        setVariantCount(prev => [...prev, { id: tempId, value: [] }]);
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

            const newVariantValue = variantCount.map((value) => {
                if (value.id === id) {
                    if (value.value) {
                        return { id: value.id, value: [...value.value, theInput] };
                    }
                    return { id: value.id, value: [theInput] };
                }
                return value;
            });
            setVariantCount(newVariantValue);
            e.target.value = "";
            newCombination(newVariantValue);
        }
    };

    const newCombination = (variantValue) => {
        const allVariantValueArray = variantValue.map(item => item.value).filter(item => item && item.length > 0);
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

    const removeVariantValue = (id, value) => {
        setVariantCount((prev) => {
            const newVariantValue = prev.map(obj => {
                if (obj.id === id) {
                    const tempValue = obj.value.filter((prevValue) => prevValue !== value);
                    return { id: obj.id, value: tempValue };
                }
                return obj;
            });
            newCombination(newVariantValue);
            return newVariantValue;
        });
    };

    const regenerateCombination = () => {
        removedCombination.current = [];
        newCombination(variantCount);
    };

    // ── IMEI Management Functions ──
    const openImeiModal = (combination) => {
        const key = combination.join(",");
        setActiveComboKey(key);
        setImeiInput('');
        imeiModalRef.current?.showModal();
    };

    const handleAddImei = (e) => {
        if (e.key === "Enter" || e.key === ',') {
            e.preventDefault();
            const raw = imeiInput.trim();
            if (!raw || !activeComboKey) return;

            // Support pasting multiple IMEIs (separated by comma, space, or newline)
            const splitImeis = raw.split(/[\s,\n]+/).map(s => s.trim()).filter(Boolean);
            const currentList = imeiMap[activeComboKey] || [];

            // Add unique IMEIs only
            const uniqueNew = splitImeis.filter(i => !currentList.includes(i));
            setImeiMap(prev => ({
                ...prev,
                [activeComboKey]: [...currentList, ...uniqueNew]
            }));

            setImeiInput('');
        }
    };

    const removeImei = (comboKey, imeiToRemove) => {
        setImeiMap(prev => ({
            ...prev,
            [comboKey]: (prev[comboKey] || []).filter(i => i !== imeiToRemove)
        }));
    };

    return (
        <div className=''>
            <form onSubmit={handleAddProduct} className='max-w-300 mx-auto'>
                <div className='rounded-2xl shadow p-5 border border-gray-200'>
                    <div>
                        <h1 className='text-lg font-bold'>1. Add Product</h1>
                        <p className='text-xs text-gray-500'>Basic information of the parent product.</p>
                    </div>

                    <div className='grid grid-cols-4 gap-5 mt-4'>
                        <div className='col-span-2'>
                            <label className='block text-xs font-medium mb-1'>Product Name</label>
                            <input className='input w-full' type="text" name='name' placeholder='Enter Product Name' />
                        </div>
                        <div className='flex gap-1 items-end'>
                            <div className='w-full'>
                                <label className='block text-xs font-medium mb-1'>Product Category</label>
                                <select className='select w-full' ref={selectRef} name='category'>
                                    <option value="">Select Category</option>
                                    {categoriesName?.map((category) =>
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <AddCategory className='btn btn-square' refetch={refetch}><Plus size={18} /></AddCategory>
                            </div>
                        </div>
                        <div>
                            <label className='block text-xs font-medium mb-1'>Brand</label>
                            <input name='brand' type="text" className='input w-full' placeholder='Enter Product Brand' />
                        </div>
                        <div>
                            <label className='block text-xs font-medium mb-1'>Model</label>
                            <input name='model' type="text" className='input w-full' placeholder='Enter Product Model' />
                        </div>
                        <div>
                            <label className='block text-xs font-medium mb-1'>Warranty (month)</label>
                            <input name='warranty' type="text" className='input w-full' placeholder='Enter Product Warranty in month' />
                        </div>
                        <div>
                            <label className='block text-xs font-medium mb-1'>Condition</label>
                            <select name='condition' className='select w-full'>
                                <option value="new">New</option>
                                <option value="refurbished">Refurbished</option>
                                <option value="used">Used</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-medium mb-1'>Supplier</label>
                            <input name='supplier' type="text" className='input w-full' placeholder='Enter Supplier Name' />
                        </div>

                        {/* Full width Description */}
                        <div className='col-span-4'>
                            <label className="block text-xs font-medium mb-1">Product Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                className='textarea textarea-bordered w-full resize-none'
                                placeholder='Enter product specifications, key features, or box contents...'
                            />
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Variants ── */}
                <div className='rounded-2xl shadow p-5 border border-gray-200 mt-5'>
                    <div>
                        <h1 className='text-lg font-bold'>2. Add Variants</h1>
                        <p className='text-xs text-gray-500'>Add variants like Color, Size, RAM, ROM. Each value will multiply into combinations.</p>
                    </div>
                    <div className='space-y-5 mt-5'>
                        {variantCount.map((variant) =>
                            <div key={variant.id} className='rounded-2xl flex items-end gap-2 p-5 border border-gray-300 bg-gray-100'>
                                <div className='shrink-0'>
                                    <label className='block text-xs font-medium mb-1'>Variant Name</label>
                                    <input className='input' type="text" placeholder='Enter variant name' />
                                </div>
                                <div className='w-full ml-2'>
                                    <label className='block text-xs font-medium mb-1'>Variant Value</label>
                                    <div className='input gap-0 w-full'>
                                        {variant.value?.length > 0 &&
                                            variant.value.map((value) =>
                                                <div key={value} className='flex items-center mr-1 bg-mist-300 rounded font-medium px-1'>
                                                    <span className='-mt-0.5'>{value}</span>
                                                    <button onClick={() => removeVariantValue(variant.id, value)} type='button' className='cursor-pointer hover:scale-110'><X size={12} /></button>
                                                </div>
                                            )
                                        }
                                        <input onKeyDown={(e) => addVariantValue(e, variant.id)} className='w-full' type="text" placeholder='Enter variant name (Type & press Enter)' />
                                    </div>
                                </div>
                                <button type='button' onClick={() => removeVariant(variant.id)} className='cursor-pointer hover:bg-red-200 p-2 rounded duration-200 hover:scale-110 mb-1.25'><X size={16} /></button>
                            </div>
                        )}
                        <button type='button' onClick={addNewVariant} className='btn'><Plus size={18} />Add new variant</button>
                    </div>
                </div>

                {/* ── Section 3: Pricing, Inventory & IMEI ── */}
                <div className='rounded-2xl shadow p-5 border border-gray-200 mt-5'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-lg font-bold'>3. Variant Pricing & Inventory</h1>
                            <p className='text-xs text-gray-500'>Set individual price, stock quantity, and barcode for each variant.</p>
                        </div>
                        <div className='flex items-center gap-3'>
                            {/* ── IMEI TRACKING TOGGLE ── */}
                            <label className='flex items-center gap-2 cursor-pointer bg-violet-50 hover:bg-violet-100 transition-colors px-3 py-1.5 rounded-xl border border-violet-200'>
                                <input
                                    type="checkbox"
                                    checked={hasImei}
                                    onChange={(e) => setHasImei(e.target.checked)}
                                    className='checkbox checkbox-primary checkbox-sm'
                                />
                                <span className='text-xs font-semibold text-violet-800 flex items-center gap-1.5'>
                                    <Smartphone size={14} /> Track IMEI
                                </span>
                            </label>

                            <button onClick={regenerateCombination} type='button' className='btn bg-blue-500/10 text-blue-500 border border-blue-500 group hover:shadow hover:shadow-blue-200'>
                                <RefreshCw size={16} className='group-hover:rotate-180 duration-300' /> Regenerate
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="table">
                            <thead>
                                <tr className="uppercase text-xs text-gray-500">
                                    <th>S/N</th>
                                    <th>Variant Combinations</th>
                                    <th>Barcode</th>
                                    <th>Purchase Price</th>
                                    <th>Retail Price</th>
                                    <th>MRP</th>
                                    <th>QTY</th>
                                    {hasImei && <th className='text-center'>IMEI Numbers</th>}
                                    <th className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {combinations.map((combination, index) => {
                                    const comboKey = combination.join(",");
                                    const currentImeis = imeiMap[comboKey] || [];

                                    return (
                                        <tr key={comboKey} className="hover:bg-base-200/40">
                                            <th>{index + 1}</th>
                                            <td className="min-w-40">
                                                <div className='flex flex-wrap gap-1.5'>
                                                    {combination.map((value, i) =>
                                                        <span key={i} className='badge badge-sm bg-gray-200 text-gray-700 font-medium'>{value}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td><input name={`barcode${index + 1}`} type="text" className="input input-sm input-bordered w-40" placeholder="Scan barcode" /></td>
                                            <td><input name={`purchasePrice${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-28" placeholder="0.00" /></td>
                                            <td><input name={`retailPrice${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-28" placeholder="0.00" /></td>
                                            <td><input name={`mrp${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-28" placeholder="0.00" /></td>

                                            {/* Quantity: If IMEI is enabled, quantity matches the count of scanned IMEIs */}
                                            <td>
                                                <input
                                                    name={`quantity${index + 1}`}
                                                    type="number"
                                                    min="0"
                                                    value={hasImei ? currentImeis.length : undefined}
                                                    readOnly={hasImei}
                                                    className={`input input-sm input-bordered w-20 ${hasImei ? 'bg-violet-50 font-bold text-violet-700 cursor-not-allowed' : ''}`}
                                                    placeholder="0"
                                                />
                                            </td>

                                            {/* ── IMEI Action Button Column ── */}
                                            {hasImei && (
                                                <td className='text-center'>
                                                    {currentImeis.length > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openImeiModal(combination)}
                                                            className="btn btn-xs bg-violet-100 hover:bg-violet-200 text-violet-700 border-none rounded-lg gap-1 font-semibold"
                                                        >
                                                            <Smartphone size={13} /> {currentImeis.length} IMEIs
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openImeiModal(combination)}
                                                            className="btn btn-xs btn-outline border-dashed text-violet-600 hover:bg-violet-50 hover:border-violet-400 gap-1"
                                                        >
                                                            <Scan size={13} /> + Add IMEI
                                                        </button>
                                                    )}
                                                </td>
                                            )}

                                            <td className='text-center'>
                                                <button onClick={() => removeCombination(combination)} type='button' className='btn btn-ghost btn-xs btn-square text-error hover:bg-error/20'><X size={15} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                    <Link href="/product" className="btn btn-ghost">Cancel</Link>
                    <button type="submit" className="btn bg-violet-600 hover:bg-violet-700 text-white shadow-sm">Save Product</button>
                </div>
            </form>

            {/* ── IMEI SCANNING MODAL ── */}
            <dialog ref={imeiModalRef} className="modal">
                <div className="modal-box max-w-lg">
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <Smartphone className="text-violet-600" size={18} />
                                Add IMEIs for <span className="text-violet-700 underline">{activeComboKey?.split(",").join(" / ")}</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">Scan with barcode scanner or type 15-digit IMEI and press Enter</p>
                        </div>
                        <button type="button" onClick={() => imeiModalRef.current?.close()} className="btn btn-sm btn-circle btn-ghost">✕</button>
                    </div>

                    {/* Scanner Input */}
                    <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Scan or Enter IMEI</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={imeiInput}
                                onChange={(e) => setImeiInput(e.target.value)}
                                onKeyDown={handleAddImei}
                                placeholder="Scan IMEI or paste multiple (Enter to add)..."
                                className="input input-bordered w-full pr-10 font-mono text-sm focus:border-violet-400 focus:outline-none"
                                autoFocus
                            />
                            <Scan size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">Tip: You can paste multiple IMEIs separated by spaces, commas, or new lines.</span>
                    </div>

                    {/* Scanned IMEIs List */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-700">Scanned IMEIs ({(imeiMap[activeComboKey] || []).length})</span>
                            {(imeiMap[activeComboKey] || []).length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setImeiMap(prev => ({ ...prev, [activeComboKey]: [] }))}
                                    className="text-[11px] text-red-500 hover:underline"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-wrap gap-2">
                            {(imeiMap[activeComboKey] || []).length === 0 ? (
                                <p className="text-xs text-gray-400 w-full text-center py-4">No IMEIs scanned yet. Ready to scan.</p>
                            ) : (
                                (imeiMap[activeComboKey] || []).map((imei, idx) => (
                                    <div key={imei} className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-xs font-mono text-xs text-gray-800">
                                        <span className="text-gray-400 text-[10px]">#{idx + 1}</span>
                                        <span>{imei}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeImei(activeComboKey, imei)}
                                            className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-100">
                        <span className="text-xs font-medium text-violet-700">
                            Quantity will be set to: <strong>{(imeiMap[activeComboKey] || []).length}</strong>
                        </span>
                        <button
                            type="button"
                            onClick={() => imeiModalRef.current?.close()}
                            className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default AddProduct2;
