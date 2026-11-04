"use client"
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React from 'react';

const ProductDetails = () => {
    const { id } = useParams()
    const { data: product } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const { data: result } = await axios.get(`http://localhost:5000/${id}`)
            return result
        },
        disabled: !!id
    })
    console.log(product)
    return (
        <div>

        </div>
    );
};

export default ProductDetails;