'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, RefreshCw, Save, Scan, X } from 'lucide-react';
import React, { useContext, useRef, useState } from 'react';
import AddCategory from '../category/AddCategory';
import DataContext from '@/Context/DataContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AddProduct = () => {
    const { selectRef } = useContext(DataContext)
    const [variantCount, setVariantCount] = useState([{ id: crypto.randomUUID(), name: "", value: [] }]) // 2, 3, 4
    const [combinations, setCombinations] = useState([])
    const removedCombination = useRef([])
    // console.log(variantCount);
    const { data: categoriesName, refetch } = useQuery({
        queryKey: ["categoriesName"],
        queryFn: async () => {
            const { data: result } = await axios.get("http://localhost:5000/categories/names")
            return result
        }
    })
    // console.log(categoriesName);
    const handleAddProduct = (e) => {
        e.preventDefault()
        const formData = Object.fromEntries(new FormData(e.target))
        // console.log(formData);
        console.log(combinations);

        const activeVariants = variantCount.filter(v => v.value && v.value.length > 0)

        const variants = combinations.map((combination, index) => {
            const attributes = combination.map((val, i) => ({
                name: activeVariants[i]?.name || `Option ${i + 1}`,
                value: val
            }))

            const variantObj = {
                combination,
                title: combination.join(" / "),
                attributes,
                barcode: formData[`barcode${index + 1}`],
                purchasePrice: Number(formData[`purchasePrice${index + 1}`]) || 0,
                retailPrice: Number(formData[`retailPrice${index + 1}`]) || 0,
                mrp: Number(formData[`mrp${index + 1}`]) || 0,
                imeis: IMEIs.find(obj => obj[combination.join(",")])?.[combination.join(",")] || [],
                quantity: Number(formData[`quantity${index + 1}`]) || 0,
            }
            delete formData[`barcode${index + 1}`]
            delete formData[`purchasePrice${index + 1}`]
            delete formData[`retailPrice${index + 1}`]
            delete formData[`mrp${index + 1}`]
            delete formData[`quantity${index + 1}`]

            return variantObj
        })
        // number conversation
        formData.warranty = Number(formData.warranty) || 0
        formData.variantTypes = activeVariants.map(v => v.name)
        formData.variants = variants
        formData.hasImei = formData.hasImei === "on" ? true : false

        console.log(formData);
    }
    const addNewVariant = () => {
        let tempId
        do {
            tempId = crypto.randomUUID()
        } while ((() => {
            // variantCount.includes(tempId)
            const isIncluded = variantCount.filter((variant) => variant.id === tempId)
            if (isIncluded.length === 0) {
                return false
            }
            else {
                return true
            }
        })());

        setVariantCount(prev => [...prev, { id: tempId, name: "", value: [] }])
    }

    const handleVariantName = (id, name) => {
        setVariantCount(prev => prev.map(variant => variant.id === id ? { ...variant, name } : variant))
    }

    const removeVariant = (tempId) => {
        // console.log("object");
        const newVariant = variantCount.filter((variant) => variant.id !== tempId)
        // console.log(newVariant);
        newCombination(newVariant)
        setVariantCount(newVariant)

    }
    const addVariantValue = (e, id) => {
        if (e.key === "Enter" || e.key === ',') {
            e.preventDefault()
            // console.log(e.key);
            const theInput = e.target.value.trim()
            if (!theInput) return
            const currentVariant = variantCount.find(v => v.id === id)
            // Prevent duplicate (Case-insensitive check: "Red" vs "red")
            const isDuplicate = currentVariant?.value?.some(
                val => val.toLowerCase() === theInput.toLowerCase()
            )
            if (isDuplicate) {
                toast.error(`"${theInput}" has already been added to this variant!`)
                e.target.value = ""
                return
            }

            const newVariantValue = variantCount.map((value) => {
                if (value.id === id) {
                    if (value.value) {
                        return { ...value, value: [...value.value, theInput] }

                    }
                    return { ...value, value: [theInput] }
                }
                return value
            })
            // console.log(id, newVariantValue);
            setVariantCount(newVariantValue)
            // console.log(e.target);
            e.target.value = ""

            newCombination(newVariantValue)
            // console.log(newVariantValue);



        }
    }
    const newCombination = (variantValue) => {
        // console.log(variantValue);
        const allVariantValueArray = variantValue.map(item => item.value).filter(item => item && item.length > 0)
        // console.log(allVariantValueArray);
        if (allVariantValueArray.length === 0) {
            setCombinations([])
            return
        }
        let combination = [[]]

        for (let singleArrayValue of allVariantValueArray) {
            combination = combination.flatMap(a =>
                singleArrayValue.map(b => [...a, b])
            );
        }
        // console.log(combination);
        const removedCombinationInStr = removedCombination?.current?.map(item => item.join(","))
        const filteredCombination = combination.filter((item) => !removedCombinationInStr.includes(item.join(",")))
        setCombinations(filteredCombination)
    }
    const removeCombination = (single) => {
        removedCombination.current.push(single)
        // console.log(single);
        // console.log(combinations);
        setCombinations((prev) =>
            prev.filter((combination) => combination.join(",") !== single.join(","))
        )

        // console.log(removedCombination.current);

    }
    const removeVariantValue = (id, value) => {
        // console.log(id, value);
        // console.log(variantCount);
        setVariantCount((prev) => {
            const newVariantValue = prev.map(obj => {
                if (obj.id === id) {
                    const tempValue = obj.value.filter((prevValue) => prevValue !== value)
                    return { ...obj, value: tempValue }
                } else {
                    return obj
                }
            })
            newCombination(newVariantValue)
            // console.log(newVariantValue)
            return newVariantValue
        })
    }

    const regenerateCombination = () => {
        removedCombination.current = []
        newCombination(variantCount)

    }
    // console.log(combinations);
    // imei related code
    const modalRef = useRef()
    const [hasIMEI, setHasIMEI] = useState(false)
    const [activeComboModal, setActiveComboModal] = useState("")
    const [IMEIs, setIMEIs] = useState([])

    const openModal = (activeKey) => {
        setActiveComboModal(activeKey.join(","))
        modalRef.current.showModal()
    }

    const handleAddIMEI = (e) => {
        const value = e.target.value.trim()
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            if (!value) return
            const isDuplicate = IMEIs.some(obj => Object.values(obj)[0]?.includes(value))
            if (isDuplicate) {
                toast.error(`IMEI "${value}" has already been added!`)
                return
            }
            e.target.value = ""


            setIMEIs(prev => {
                const prevIMEI = prev.find(obj => obj[activeComboModal])?.[activeComboModal] || []
                // console.log(prevIMEI);
                if (IMEIs.length > 0) {
                    const prevObj = IMEIs.find(obj => obj[activeComboModal])
                    if (prevObj) {
                        return prev.map(obj =>
                            obj[activeComboModal] ? { [activeComboModal]: [...obj[activeComboModal], value] } : obj
                        )
                    }
                    return [...prev, { [activeComboModal]: [...prevIMEI, value] }]
                }
                return [{ [activeComboModal]: [...prevIMEI, value] }]
            })
        }
    }
    const IMEIsToMap = IMEIs.find(obj => obj[activeComboModal])?.[activeComboModal] || []

    const handleRemoveIMEI = (imei) => {
        // console.log("this imei to delete", imei, "from:", IMEIs, "activeModal:", activeComboModal)
        console.log(IMEIs);

        const thisIsTheObj = IMEIs.find(obj => obj[activeComboModal])
        if (!thisIsTheObj) return
        const filteredArray = thisIsTheObj[activeComboModal].filter(value => value !== imei)

        setIMEIs(prev => {
            return prev.map(obj => obj[activeComboModal] ? { [activeComboModal]: filteredArray } : obj)
        })

    }
    // console.log(IMEIs, activeComboModal);
    console.log(variantCount, combinations)

    return (
        <div className=''>
            <form onSubmit={handleAddProduct} className='max-w-300 mx-auto'>
                <div className='rounded-2xl shadow p-5 border border-gray-200'>
                    <div>
                        <h1>1. Add Product</h1>
                        <p>Basic information of the parent product.</p>
                    </div>
                    <div className='grid grid-cols-4 gap-5'>
                        <div className='col-span-2'>
                            <label>Product Name</label>
                            <input className='input w-full' type="text" name='name' placeholder='Enter Product Name' />
                        </div>
                        <div className='flex gap-1 items-end'>
                            <div className='w-full'>
                                <label> Product Category</label>
                                <select className='select w-full' ref={selectRef} name='category'>
                                    <option value="">Select Category</option>
                                    {
                                        categoriesName?.map((category) =>
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        )
                                    }
                                </select>
                                {/* {categoriesName?.length === 0 && <span className='text-xs text-yellow-500'>Please add new category first!</span>} */}
                            </div>
                            <div>
                                <AddCategory className='btn btn-square' refetch={refetch}><Plus size={18} /></AddCategory>
                            </div>
                        </div>
                        <div>
                            <label>Brand</label>
                            <input name='brand' type="text" className='input' placeholder='Enter Product Brand' />
                        </div>
                        <div>
                            <label>Model</label>
                            <input name='model' type="text" className='input' placeholder='Enter Product Model' />
                        </div>
                        <div>
                            <label>Warranty (month)</label>
                            <input name='warranty' type="text" className='input' placeholder='Enter Product Warranty in month' />
                        </div>
                        <div>
                            <label>Condition</label>
                            <select name='condition' className='select'>
                                <option value="new">New</option>
                                <option value="refurbished">Refurbished</option>
                                <option value="used">Used</option>
                            </select>
                        </div>
                        <div>
                            <label>Supplier</label>
                            <input name='supplier' type="text" className='input' placeholder='Enter Supplier Name' />
                        </div>

                        {/* Place this right below Condition inside the grid */}
                        <div className='col-span-4'>
                            <label className="block mb-1">Product Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                className='textarea textarea-bordered w-full resize-none'
                                placeholder='Enter product specifications, key features, or box contents...'
                            />
                        </div>
                    </div>
                </div>
                {/* variants */}
                <div className='rounded-2xl shadow p-5 border border-gray-200 mt-5'>
                    <div>
                        <h1>2. Add Variants</h1>
                        <p>Add variants like Color, Size, RAM, ROM. Each value will multiply into combinations.</p>
                    </div>
                    <div className='space-y-5 mt-5'>
                        {
                            variantCount?.map((variant) =>
                                <div key={variant.id} className='rounded-2xl flex items-end gap-2 p-5 border border-gray-300 bg-gray-100'>
                                    <div className='shrink-0'>
                                        <label className='block'>Variant Name</label>
                                        <input className='input' type="text" placeholder='Enter variant name' value={variant.name || ""} onChange={(e) => handleVariantName(variant.id, e.target.value)} />
                                    </div>
                                    <div className='w-full ml-2'>
                                        <label className='block'>Variant Value</label>
                                        <div className='input gap-0 w-full'>
                                            {
                                                variant.value?.length > 0 &&
                                                variant.value.map((value) =>
                                                    <div key={value} className='flex items-center mr-1  bg-mist-300 rounded font-medium px-1'>
                                                        <span className='-mt-0.5'>
                                                            {value}
                                                        </span>
                                                        <button onClick={() => removeVariantValue(variant.id, value)} type='button' className='cursor-pointer hover:scale-110'><X className='' size={12} /></button>
                                                    </div>
                                                )
                                            }
                                            <input onKeyDown={(e) => addVariantValue(e, variant.id)} className=' w-full' type="text" placeholder='Enter variant name(Type & press Enter)' />
                                        </div>
                                    </div>
                                    <button type='button' onClick={() => removeVariant(variant.id)} className='cursor-pointer hover:bg-red-200 p-2 rounded duration-200 hover:scale-110 mb-1.25 '><X size={16} /></button>
                                </div>
                            )
                        }
                        <button type='button' onClick={addNewVariant} className='btn'><Plus size={18} />Add new variant</button>
                    </div>
                </div>
                {/* Price Code */}
                <div className='rounded-2xl shadow p-5 border border-gray-200 mt-5'>
                    <div className='flex justify-between'>
                        <div>
                            <h1>3. Variant Pricing & Inventory</h1>
                            <p>Set individual price, stock quantity, and barcode for each variant.</p>
                        </div>
                        <div className='flex gap-2'>
                            <label className='btn '>
                                <input onChange={(e) => setHasIMEI(e.target.checked)} type="checkbox" className='checkbox checkbox-sm' name='hasImei' />
                                <span className='text-xs'>
                                    TRACK IMEI
                                </span>
                            </label>
                            <button onClick={regenerateCombination} type='button' className='btn bg-blue-500/10 text-blue-500 border border-blue-500 group hover:shadow hover:shadow-blue-200' >
                                <RefreshCw size={16} className='group-hover:rotate-180 duration-300' /> Regenerate
                            </button>
                        </div>
                    </div>

                    <div className="">
                        <table className="table">
                            <thead>
                                <tr className="uppercase *:px-2">
                                    <th>S/N</th>
                                    <th>Variant Combinations</th>
                                    <th>Barcode</th>
                                    <th>Purchase Price</th>
                                    <th>Retail Price</th>
                                    <th>MRP</th>
                                    <th>QTY</th>
                                    {hasIMEI &&
                                        <th>IMEI</th>
                                    }
                                    <th className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    combinations.map((combination, index) => {
                                        const IMEI = IMEIs.find(obj => obj[combination.join(',')])?.[combination.join(",")] || []
                                        console.log(IMEI);

                                        return (
                                            <tr key={combination.join(",")} className="hover:bg-base-200/40 *:px-2">
                                                <th>{index + 1}</th>
                                                <td className="min-w-40">
                                                    <div className='flex flex-wrap gap-1.5'>
                                                        {combination.map((value, i) =>
                                                            <span key={i} className='badge badge-sm bg-gray-200 text-gray-700 font-medium'>{value}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td><input name={`barcode${index + 1}`} type="text" className="input input-sm input-bordered w-44" placeholder="Scan or enter barcode" /></td>
                                                <td><input name={`purchasePrice${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-32" placeholder="0.00" /></td>
                                                <td><input name={`retailPrice${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-32" placeholder="0.00" /></td>
                                                <td><input name={`mrp${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-32" placeholder="0.00" /></td>
                                                <td><input name={`quantity${index + 1}`} value={hasIMEI ? IMEI.length : undefined} type="number" min="0" className={`input input-sm input-bordered w-20 ${hasIMEI ? "bg-violet-50 font-bold text-violet-700 cursor-not-allowed" : ""}`} placeholder="0" readOnly={hasIMEI} /></td>
                                                {
                                                    hasIMEI &&
                                                    <td>
                                                        <button onClick={() => openModal(combination)} type='button' className='btn btn-sm btn-dash btn-primary'>Add IMEIs</button>
                                                    </td>
                                                }
                                                <td className='text-center'>
                                                    <button onClick={() => removeCombination(combination)} type='button' className='btn btn-ghost btn-xs btn-square text-error hover:bg-error/20'><X size={15} /></button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Action Buttons at the bottom */}
                <div className="flex items-center justify-end gap-3 mt-6">
                    <Link href="/product" className="btn btn-ghost">
                        Cancel
                    </Link>
                    <button type="submit" className="btn bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
                        Save Product
                    </button>
                </div>
            </form>

            {/* modal  */}
            < dialog ref={modalRef} className="modal" >
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scan or Enter IMEI</label>
                    <div className="relative">

                        <input
                            type="text"
                            onKeyDown={handleAddIMEI}
                            placeholder="Scan IMEI or paste multiple (Enter to add)..."
                            className="input input-bordered w-full pr-10 font-mono text-sm focus:border-violet-400 focus:outline-none"
                            autoFocus
                        />
                        <Scan size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 mt-5">Scanned IMEIs ({IMEIsToMap.length})</label>
                    <div className='w-full min-h-28 max-h-96 overflow-y-auto rounded bg-gray-100 border border-gray-200 p-3 flex gap-1 flex-wrap items-start'>
                        {
                            IMEIsToMap.map((item) =>
                                <h1 className='bg-white px-2 rounded border border-gray-300 flex items-center' key={item}>{item} <button className='cursor-pointer hover:text-red-500' onClick={() => handleRemoveIMEI(item)}><X size={16} /></button> </h1>
                            )
                        }
                    </div>
                </div>
            </dialog >
        </div>
    );
};

export default AddProduct;