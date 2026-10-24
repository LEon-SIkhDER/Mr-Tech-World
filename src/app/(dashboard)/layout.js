"use client"
import { useRouter } from 'next/navigation';
import React from 'react';

const DashboardLayout = ({ children }) => {
    const router = useRouter()
    const isActive = false
    if(isActive){
        return router.push('/signUp')
    }
    return (
        <>
            {children}
        </>
    );
};

export default DashboardLayout;