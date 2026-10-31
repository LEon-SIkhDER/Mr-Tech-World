'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, RefreshCw, Save, X } from 'lucide-react';
import React, { useContext, useRef, useState } from 'react';
import AddCategory from '../category/AddCategory';
import DataContext from '@/Context/DataContext';
import Link from 'next/link';

const AddProduct = () => {
    const { selectRef } = useContext(DataContext)
    const [variantCount, setVariantCount] = useState([{ id: crypto.randomUUID(), value: [] }]) // 2, 3, 4
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

        const variants = combinations.map((combination, index) => {
            const variantObj = {
                combination,
                title: combination.join(" / "),
                barcode: formData[`barcode${index + 1}`],
                purchasePrice: formData[`purchasePrice${index + 1}`],
                retailPrice: formData[`retailPrice${index + 1}`],
                mrp: formData[`mrp${index + 1}`],
                quantity: formData[`quantity${index + 1}`],
            }
            delete formData[`barcode${index + 1}`]
            delete formData[`purchasePrice${index + 1}`]
            delete formData[`retailPrice${index + 1}`]
            delete formData[`mrp${index + 1}`]
            delete formData[`quantity${index + 1}`]

            return variantObj
        })
        formData.variants = variants
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

        setVariantCount(prev => [...prev, { id: tempId, value: [] }])
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

            const newVariantValue = variantCount.map((value) => {
                if (value.id === id) {
                    if (value.value) {
                        return { id: value.id, value: [...value.value, theInput] }

                    }
                    return { id: value.id, value: [theInput] }
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
                    return { id: obj.id, value: tempValue }
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
                            variantCount.map((variant) =>
                                <div key={variant.id} className='rounded-2xl flex items-end gap-2 p-5 border border-gray-300 bg-gray-100'>
                                    <div className='shrink-0'>
                                        <label className='block'>Variant Name</label>
                                        <input className='input' type="text" placeholder='Enter variant name' />
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
                        <button onClick={regenerateCombination} type='button' className='btn bg-blue-500/10 text-blue-500 border border-blue-500 group hover:shadow hover:shadow-blue-200' >
                            <RefreshCw size={16} className='group-hover:rotate-180 duration-300' /> Regenerate
                        </button>
                    </div>

                    <div className="">
                        <table className="table">
                            <thead>
                                <tr className="uppercase">
                                    <th>S/N</th>
                                    <th>Variant Combinations</th>
                                    <th>Barcode</th>
                                    <th>Purchase Price</th>
                                    <th>Retail Price</th>
                                    <th>MRP</th>
                                    <th>QTY</th>
                                    <th className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    combinations.map((combination, index) =>
                                        <tr key={combination.join(",")} className="hover:bg-base-200/40">
                                            <th>{index + 1}</th>
                                            <td className="min-w-40">
                                                <div className='flex flex-wrap gap-1.5'>
                                                    {combination.map((value, i) =>
                                                        <span key={i} className='badge badge-sm bg-gray-200 text-gray-700 font-medium'>{value}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td><input name={`barcode${index + 1}`} type="number" className="input input-sm input-bordered w-44" placeholder="Scan or enter barcode" /></td>
                                            <td><input name={`purchasePrice${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-32" placeholder="0.00" /></td>
                                            <td><input name={`retailPrice${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-32" placeholder="0.00" /></td>
                                            <td><input name={`mrp${index + 1}`} type="number" step="0.01" className="input input-sm input-bordered w-32" placeholder="0.00" /></td>
                                            <td><input name={`quantity${index + 1}`} type="number" min="0" className="input input-sm input-bordered w-20" placeholder="0" /></td>
                                            <td className='text-center'>
                                                <button onClick={() => removeCombination(combination)} type='button' className='btn btn-ghost btn-xs btn-square text-error hover:bg-error/20'><X size={15} /></button>
                                            </td>
                                        </tr>
                                    )
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
        </div>
    );
};

export default AddProduct;