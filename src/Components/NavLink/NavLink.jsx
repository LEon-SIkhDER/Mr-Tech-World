import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import './NavLink.css';

const NavLink = ({className,  children, to }) => {
    const location  = usePathname();
    console.log(location);
    const isActive = location === to;

    return (
        <Link href={to} className={` ${isActive ? 'active' : ''} ${className}`}>
            {children}
        </Link>
    );
};

export default NavLink;