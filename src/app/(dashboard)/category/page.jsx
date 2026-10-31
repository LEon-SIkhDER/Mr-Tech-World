"use client"
import { EllipsisVertical, Plus } from 'lucide-react';
import React from 'react';
import AddCategory from './AddCategory';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import EditCategory from './EditCategory';

const Category = () => {

    const { data: categories, error, isLoading, refetch } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:5000/categories');
            return data
        },
    });
    console.log(categories);

    return (
        <div className="space-y-6">
            {/* top */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-base-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-base-content tracking-tight">Categories</h1>
                    <h2 className="text-sm font-normal text-base-content/60 mt-1">Manage and organize all your product categories</h2>
                </div>
                <AddCategory refetch={refetch} className="btn bg-violet-600 hover:bg-violet-700 text-white border-none shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors duration-150">
                    <Plus size={18} />
                    <span>Add Category</span>
                </AddCategory>
            </div>

            <div className="">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Products</th>
                            <th>Updated At</th>
                            <th className='text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            categories?.map((category, index) => (


                                < tr key={index} >
                                    <th className=''>{index + 1}</th>
                                    <td className='font-semibold'>{category.name}</td>
                                    <td>{category.description}</td>
                                    <td>107</td>
                                    <td>{format(category.updatedAt, "PP")}</td>
                                    <th className='text-center'>
                                        <div className="dropdown dropdown-left">
                                            <div tabIndex={0} role="button" className="cursor-pointer duration-200  hover:bg-gray-200 rounded-full hover:shadow-sm  p-1">
                                                <EllipsisVertical size={18} />
                                            </div>
                                            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                                <EditCategory category={category} className="w-full"><a>Edit</a></EditCategory>
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






        </div >
    );
};

export default Category;