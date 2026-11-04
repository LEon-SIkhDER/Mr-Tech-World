import Link from 'next/link';
import React from 'react';

const Purchase = () => {
    return (
        <div className='p-5'>
            <div className='flex justify-between'>
                <div>
                    <h1>Purchase</h1>
                    <p>Track supplier purchases, incoming inventory stock, and purchase history.</p>
                </div>
                <Link href="/new-purchase" className='btn '>New Purchase</Link>
            </div>
        </div>
    );
};

export default Purchase;