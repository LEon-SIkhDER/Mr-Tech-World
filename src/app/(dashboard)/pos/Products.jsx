import customizeImageWidth from '@/app/lib/customizeImageWidth';
import { BangladeshiTaka, Layers, Minus, Package, Plus, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Products = ({ products, priceType = 'mrp', cart = [], setCart }) => {
    const [selectedProductForModal, setSelectedProductForModal] = useState(null);

    // Standardized cart item structure (best practice for POS)
    const addItemToCart = (product, variant) => {
        if (!setCart) return;

        const availableStock = Number(variant?.quantity) || 0;
        if (availableStock <= 0) {
            toast.error("This item is out of stock!");
            return;
        }

        const itemKey = `${product._id}-${variant?.barcode || variant?.title || 'default'}`;
        const retailPrice = Number(variant?.retailPrice) || 0;
        const mrp = Number(variant?.mrp) || retailPrice;
        const currentPriceType = priceType || 'mrp';
        const unitPrice = currentPriceType === 'retailPrice' ? retailPrice : mrp;

        let toastMessage = '';
        let isError = false;

        setCart((prev) => {
            const currentCart = Array.isArray(prev) ? prev : (Array.isArray(cart) ? cart : []);
            const existingIndex = currentCart.findIndex((item) => item.itemKey === itemKey);

            if (existingIndex > -1) {
                const existingItem = currentCart[existingIndex];
                if (existingItem.quantity >= availableStock) {
                    toastMessage = `Cannot add more than ${availableStock} units available in stock!`;
                    isError = true;
                    return currentCart;
                }
                const newQty = existingItem.quantity + 1;
                const updated = [...currentCart];
                updated[existingIndex] = {
                    ...existingItem,
                    quantity: newQty,
                    total: newQty * existingItem.unitPrice
                };
                // toastMessage = `Updated ${product.name} quantity to ${newQty}`;
                return updated;
            }

            const newItem = {
                itemKey,
                productId: product._id,
                name: product.name || 'Unnamed Product',
                brand: product.brand || '',
                model: product.model || '',
                image: product.image || '',
                variantTitle: variant?.title || '',
                barcode: variant?.barcode || '',
                retailPrice,
                mrp,
                priceType: currentPriceType,
                unitPrice,
                quantity: 1,
                total: unitPrice,
                maxStock: availableStock,
                hasImei: Boolean(product.hasImei),
                availableImeis: Array.isArray(variant?.imeis) ? variant.imeis : [],
                selectedImeis: [],
                warranty: product.warranty || 0
            };

            // toastMessage = `Added ${product.name}${variant?.title ? ` (${variant.title})` : ''} to cart`;
            return [newItem, ...currentCart];
        });

        // Trigger toast outside of the React state updater to prevent cross-component setState during render
        setTimeout(() => {
            if (toastMessage) {
                if (isError) {
                    toast.error(toastMessage);
                } else {
                    toast.success(toastMessage);
                }
            }
        }, 0);
    };

    const handleProductCardClick = (product) => {
        const totalStock = product.variants?.reduce((acc, current) => acc + (Number(current.quantity) || 0), 0) || 0;
        if (totalStock <= 0) {
            toast.error("This product is completely out of stock!");
            return;
        }

        const hasVariants = product.productType === 'variable' || (Array.isArray(product.variants) && product.variants.length > 1);

        if (hasVariants) {
            setSelectedProductForModal(product);
        } else {
            const singleVariant = (Array.isArray(product.variants) && product.variants[0]) || {
                title: 'Standard',
                barcode: product.barcode || '',
                retailPrice: Number(product.retailPrice) || 0,
                mrp: Number(product.mrp) || 0,
                quantity: totalStock,
                imeis: Array.isArray(product.imeis) ? product.imeis : []
            };
            addItemToCart(product, singleVariant);
        }
    };
    console.log(cart)

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 pb-4">
                {products?.map((product) => {
                    const validPrices = product.variants?.map(item => Number(item[priceType]) || 0).filter(Boolean) || [];
                    const price = validPrices.length > 0 ? Math.min(...validPrices) : 0;
                    const totalStock = product.variants?.reduce((acc, current) => acc + (Number(current.quantity) || 0), 0) || 0;
                    const isVariable = product.productType === 'variable' || (Array.isArray(product.variants) && product.variants.length > 1);

                    return (
                        <div
                            key={product._id}
                            onClick={() => handleProductCardClick(product)}
                            className={`group bg-white rounded-2xl p-3 border transition-all duration-200 select-none shadow-xs ${
                                totalStock > 0
                                    ? "cursor-pointer border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                                    : "border-rose-200 bg-slate-50/60 opacity-60 cursor-not-allowed"
                            }`}
                        >
                            <div className="relative bg-slate-50 border border-slate-100 rounded-xl p-2 aspect-square flex justify-center items-center">
                                {product.brand && (
                                    <span className="absolute top-0 left-0 z-10 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-slate-900/85 text-white rounded-tl-xl rounded-br-lg rounded-tr-none rounded-bl-none shadow-2xs">
                                        {product.brand}
                                    </span>
                                )}
                                {product.image ? (
                                    <Image
                                        src={customizeImageWidth(product.image, 200)} alt={product.name || 'product'}
                                        width={40} height={40} unoptimized
                                        className="w-full h-full object-contain duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <Package size={26} className="text-slate-400" />
                                )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate group-hover:text-blue-700 mt-2">
                                {product.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {product.model || <Minus size={18} />}
                            </p>
                            <div className="border-t border-t-slate-200 my-2"></div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-xs font-extrabold text-slate-900 inline-flex items-center"><BangladeshiTaka size={13} className="shrink-0" />{Number(price || 0).toLocaleString()}</span>
                                    <h6 className={`text-[10px] font-medium ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {totalStock > 0 ? `${totalStock} In Stock` : "Out Of Stock"}
                                    </h6>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-colors">
                                    {isVariable ? <Layers size={13} /> : <Plus size={14} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DaisyUI Variant Selection Modal */}
            {selectedProductForModal && (
                <dialog className="modal modal-open z-50">
                    <div className="modal-box bg-white border border-slate-200 shadow-2xl max-w-md p-5 rounded-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2.5">
                                {selectedProductForModal.image && (
                                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        <Image
                                            src={customizeImageWidth(selectedProductForModal.image, 46)} alt={selectedProductForModal.name || 'product'}
                                            width={36} height={36} unoptimized className="object-cover h-full"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{selectedProductForModal.name}</h3>
                                    <p className="text-xs text-slate-500">Select variant to add to current sale</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProductForModal(null)}
                                className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Variants List */}
                        <div className="py-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            {selectedProductForModal.variants?.map((variant, index) => {
                                const vStock = Number(variant?.quantity) || 0;
                                const vRetail = Number(variant?.retailPrice) || 0;
                                const vMrp = Number(variant?.mrp) || vRetail;
                                const currentPriceType = priceType || 'mrp';
                                const activePrice = currentPriceType === 'retailPrice' ? vRetail : vMrp;

                                return (
                                    <div
                                        key={variant._id || index}
                                        onClick={() => {
                                            if (vStock > 0) {
                                                addItemToCart(selectedProductForModal, variant);
                                                setSelectedProductForModal(null);
                                            }
                                        }}
                                        className={`p-3 rounded-xl border flex items-center justify-between transition-all select-none ${
                                            vStock > 0
                                                ? 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer active:scale-[0.99]'
                                                : 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                                <span>{variant.title || 'Standard'}</span>
                                                {vStock > 0 ? (
                                                    <span className="badge badge-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                                                        {vStock} in stock
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-xs bg-rose-50 text-rose-600 border-rose-200 font-semibold">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-400">
                                                Barcode: {variant.barcode || 'N/A'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <div className="text-right">
                                                <span className="text-xs font-extrabold text-slate-900 inline-flex items-center">
                                                    <BangladeshiTaka size={13} className="shrink-0" />{Number(activePrice || 0).toLocaleString()}
                                                </span>
                                                <div className="text-[9px] text-slate-400 uppercase font-semibold">
                                                    {currentPriceType === 'retailPrice' ? 'Retail' : 'MRP'}
                                                </div>
                                            </div>
                                            {/* <button
                                                type="button"
                                                disabled={vStock <= 0}
                                                className="btn btn-xs h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg border-none font-semibold disabled:opacity-40"
                                            >
                                                <Plus size={13} />
                                            </button> */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 border-t border-slate-200 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedProductForModal(null)}
                                className="btn btn-sm border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={() => setSelectedProductForModal(null)}>close</button>
                    </form>
                </dialog>
            )}
        </>
    );
};

export default Products;
