"use client"
import { EllipsisVertical,  Plus } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import EditProduct from './EditProduct';
import Link from 'next/link';

const Product = () => {

    const { data: products, error, isLoading, refetch: productRefetch } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:5000/products');
            return data;
        },
    });

    const { data: categories, refetch: categoryRefetch } = useQuery({
        queryKey: ['categoriesName'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:5000/categories/names');
            return data;
        },
    });

    console.log(products);
    console.log(categories);

    return (
        <div className="space-y-6">
            {/* top */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-base-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-base-content tracking-tight">Products</h1>
                    <h2 className="text-sm font-normal text-base-content/60 mt-1">Manage and organize all your products</h2>
                </div>
                <Link href="/add-product" className="btn bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors duration-150">
                    <Plus size={18} />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>Updated At</th>
                            <th className='text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            products?.map((product, index) => (
                                <tr key={product._id}>
                                    <th>{index + 1}</th>
                                    <td className='font-semibold'>{product.productName}</td>
                                    <td>{product.category}</td>
                                    <td>{product.price ? `$${product.price}` : 'N/A'}</td>
                                    <td className="max-w-xs truncate">{product.description || 'N/A'}</td>
                                    <td>{product.updatedAt ? format(product.updatedAt, "PP") : "N/A"}</td>
                                    <th className='text-center'>
                                        <div className="dropdown dropdown-left">
                                            <div tabIndex={0} role="button" className="cursor-pointer duration-200 hover:bg-gray-200 rounded-full hover:shadow-sm p-1">
                                                <EllipsisVertical size={18} />
                                            </div>
                                            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                                <EditProduct product={product} className="w-full"><a>Edit</a></EditProduct>
                                                <li><a>Delete</a></li>
                                            </ul>
                                        </div>
                                    </th>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Product;
