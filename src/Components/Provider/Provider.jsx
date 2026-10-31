"use client"
import DataProvider from '@/Context/DataProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Toaster } from 'react-hot-toast';
const queryClient = new QueryClient();

const Provider = ({ children }) => {
    return (
        <>
            <Toaster></Toaster>
            <QueryClientProvider client={queryClient}>
                <DataProvider>
                    {children}
                </DataProvider>
            </QueryClientProvider>
        </>
    );
};

export default Provider;