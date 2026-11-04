"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EllipsisVertical } from 'lucide-react';

const ActionDropdown = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: null, bottom: null, right: 0 });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const opensUpward = spaceBelow < 170 && rect.top > 170;

            setPosition({
                top: opensUpward ? null : rect.bottom + 4,
                bottom: opensUpward ? window.innerHeight - rect.top + 4 : null,
                right: Math.max(8, window.innerWidth - rect.right),
            });
            setIsOpen(true);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleCloseOnScrollOrResize = () => {
            setIsOpen(false);
        };

        window.addEventListener('mousedown', handleOutsideClick);
        window.addEventListener('scroll', handleCloseOnScrollOrResize, true);
        window.addEventListener('resize', handleCloseOnScrollOrResize);

        return () => {
            window.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('scroll', handleCloseOnScrollOrResize, true);
            window.removeEventListener('resize', handleCloseOnScrollOrResize);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left">
            <button ref={buttonRef} type="button" onClick={toggleDropdown} aria-haspopup="true" aria-expanded={isOpen} className="cursor-pointer p-1.5 rounded-full hover:bg-slate-200/60 text-slate-600 transition-colors">
                <EllipsisVertical size={18} />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: position.top !== null ? `${position.top}px` : 'auto',
                        bottom: position.bottom !== null ? `${position.bottom}px` : 'auto',
                        right: `${position.right}px`,
                        zIndex: 9999,
                    }}
                    className="w-44 bg-base-100 rounded-box shadow-xl border border-slate-200 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                >
                    <ul onClick={() => setIsOpen(false)} className="menu menu-sm p-0 gap-0.5 w-full">
                        {children}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ActionDropdown;
