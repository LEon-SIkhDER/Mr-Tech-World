import React, { useRef } from 'react';
import DataContext from './DataContext';
import { useSession } from '@/app/lib/auth-client';

const DataProvider = ({ children }) => {


    const selectRef = useRef(null);

    const value = {
        selectRef
    }
    return (
        <DataContext value={value}>
            {children}
        </DataContext>
    );
};

export default DataProvider;