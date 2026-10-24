"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Toaster } from 'react-hot-toast';
const queryClient = new QueryClient();

const Provider = ({ children }) => {
    return (
        <>
            <Toaster></Toaster>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </>
    );
};

export default Provider;