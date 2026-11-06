'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import customizeImageWidth from '@/app/lib/customizeImageWidth';
import {
    ArrowRight,
    Barcode,
    Check,
    ChevronLeft,
    ChevronRight,
    Layers,
    Minus,
    Package,
    PauseCircle,
    Phone,
    Plus,
    Printer,
    Scan,
    Search,
    ShoppingBag,
    ShoppingCart,
    Trash2,
    User,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Sample fallback catalog for inspiration if database is empty or loading
const SAMPLE_PRODUCTS = [
    {
        _id: 'sample-1',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        model: 'A3106',
        category: 'Smartphones',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80',
        variantTypes: ['Storage', 'Color'],
        variants: [
            {
                title: '256GB / Natural Titanium',
                combination: ['256GB', 'Natural Titanium'],
                barcode: '8806091234567',
                purchasePrice: 135000,
                retailPrice: 152000,
                mrp: 155000,
                quantity: 1,
                imeis: ['352948110948271', '352948110948272', '352948110948273', '352948110948274']
            },
            {
                title: '512GB / Blue Titanium',
                combination: ['512GB', 'Blue Titanium'],
                barcode: '8806091234588',
                purchasePrice: 155000,
                retailPrice: 174000,
                mrp: 178000,
                quantity: 0,
                imeis: ['352948110948301', '352948110948302']
            }
        ]
    },
    {
        _id: 'sample-2',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        model: 'SM-S928B',
        category: 'Smartphones',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&q=80',
        variantTypes: ['Storage', 'Color'],
        variants: [
            {
                title: '256GB / Titanium Gray',
                combination: ['256GB', 'Titanium Gray'],
                barcode: '8806098765432',
                purchasePrice: 128000,
                retailPrice: 142000,
                mrp: 145000,
                quantity: 3,
                imeis: ['354892019482011', '354892019482012', '354892019482013']
            }
        ]
    },
    {
        _id: 'sample-3',
        name: 'MacBook Air M3 15-inch',
        brand: 'Apple',
        model: 'A3114',
        category: 'Laptops',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80',
        variantTypes: ['RAM/SSD', 'Color'],
        variants: [
            {
                title: '16GB / 512GB / Midnight',
                combination: ['16GB/512GB', 'Midnight'],
                barcode: '194253998811',
                purchasePrice: 175000,
                retailPrice: 198000,
                mrp: 202000,
                quantity: 2,
                imeis: ['C02TM001MD32', 'C02TM002MD32']
            }
        ]
    },
    {
        _id: 'sample-4',
        name: 'AirPods Pro (2nd Gen, USB-C)',
        brand: 'Apple',
        model: 'MTJV3',
        category: 'Audio',
        condition: 'new',
        warranty: 6,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&q=80',
        variantTypes: [],
        retailPrice: 28500,
        purchasePrice: 24000,
        mrp: 29990,
        quantity: 8,
        variants: [
            {
                title: 'Standard',
                combination: ['White'],
                barcode: '195949052553',
                purchasePrice: 24000,
                retailPrice: 28500,
                mrp: 29990,
                quantity: 8,
                imeis: ['H3T9488102', 'H3T9488103', 'H3T9488104', 'H3T9488105']
            }
        ]
    },
    {
        _id: 'sample-5',
        name: 'Anker 65W GaN Fast Charger',
        brand: 'Anker',
        model: 'Nano II',
        category: 'Accessories',
        condition: 'new',
        warranty: 18,
        hasImei: false,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80',
        variantTypes: ['Color'],
        variants: [
            {
                title: 'Black',
                combination: ['Black'],
                barcode: '194644062118',
                purchasePrice: 2800,
                retailPrice: 3800,
                mrp: 4200,
                quantity: 15,
                imeis: []
            },
            {
                title: 'White',
                combination: ['White'],
                barcode: '194644062125',
                purchasePrice: 2800,
                retailPrice: 3800,
                mrp: 4200,
                quantity: 11,
                imeis: []
            }
        ]
    },
    {
        _id: 'sample-6',
        name: 'Baseus 20000mAh 65W Power Bank',
        brand: 'Baseus',
        model: 'Blade HD',
        category: 'Accessories',
        condition: 'new',
        warranty: 6,
        hasImei: false,
        image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=300&q=80',
        variantTypes: [],
        variants: [
            {
                title: 'Default',
                combination: ['Black'],
                barcode: '6932172605882',
                purchasePrice: 4200,
                retailPrice: 5600,
                mrp: 5990,
                quantity: 6,
                imeis: []
            }
        ]
    },
    {
        _id: 'sample-7',
        name: 'Google Pixel 8 Pro',
        brand: 'Google',
        model: 'GC3VE',
        category: 'Smartphones',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&q=80',
        variantTypes: ['Storage', 'Color'],
        variants: [
            {
                title: '128GB / Obsidian',
                combination: ['128GB', 'Obsidian'],
                barcode: '842776100101',
                purchasePrice: 82000,
                retailPrice: 94000,
                mrp: 98000,
                quantity: 5,
                imeis: ['358941029481001', '358941029481002', '358941029481003']
            },
            {
                title: '256GB / Bay Blue',
                combination: ['256GB', 'Bay Blue'],
                barcode: '842776100102',
                purchasePrice: 93000,
                retailPrice: 106000,
                mrp: 110000,
                quantity: 3,
                imeis: ['358941029481004', '358941029481005']
            }
        ]
    },
    {
        _id: 'sample-8',
        name: 'OnePlus 12 5G',
        brand: 'OnePlus',
        model: 'CPH2581',
        category: 'Smartphones',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',
        variantTypes: ['Storage', 'Color'],
        variants: [
            {
                title: '12GB / 256GB / Silky Black',
                combination: ['12GB/256GB', 'Silky Black'],
                barcode: '692181562010',
                purchasePrice: 72000,
                retailPrice: 82000,
                mrp: 85000,
                quantity: 4,
                imeis: ['864910294810001', '864910294810002']
            },
            {
                title: '16GB / 512GB / Flowy Emerald',
                combination: ['16GB/512GB', 'Flowy Emerald'],
                barcode: '692181562011',
                purchasePrice: 82000,
                retailPrice: 93000,
                mrp: 96000,
                quantity: 3,
                imeis: ['864910294810003', '864910294810004']
            }
        ]
    },
    {
        _id: 'sample-9',
        name: 'iPad Pro 11-inch M4',
        brand: 'Apple',
        model: 'A2836',
        category: 'Tablets',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80',
        variantTypes: ['Storage', 'Color'],
        variants: [
            {
                title: '256GB / Space Black',
                combination: ['256GB', 'Space Black'],
                barcode: '195949281001',
                purchasePrice: 118000,
                retailPrice: 134000,
                mrp: 138000,
                quantity: 3,
                imeis: ['DMPY48102948', 'DMPY48102949']
            },
            {
                title: '512GB / Silver',
                combination: ['512GB', 'Silver'],
                barcode: '195949281002',
                purchasePrice: 139000,
                retailPrice: 158000,
                mrp: 162000,
                quantity: 2,
                imeis: ['DMPY48102950', 'DMPY48102951']
            }
        ]
    },
    {
        _id: 'sample-10',
        name: 'Apple Watch Ultra 2',
        brand: 'Apple',
        model: 'A2986',
        category: 'Smartwatches',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&q=80',
        variantTypes: ['Band Style'],
        variants: [
            {
                title: '49mm Titanium / Orange Ocean Band',
                combination: ['Orange Ocean Band'],
                barcode: '195949018274',
                purchasePrice: 95000,
                retailPrice: 108000,
                mrp: 112000,
                quantity: 3,
                imeis: ['G98401928401', 'G98401928402']
            },
            {
                title: '49mm Titanium / Blue Trail Loop',
                combination: ['Blue Trail Loop'],
                barcode: '195949018275',
                purchasePrice: 95000,
                retailPrice: 108000,
                mrp: 112000,
                quantity: 2,
                imeis: ['G98401928403', 'G98401928404']
            }
        ]
    },
    {
        _id: 'sample-11',
        name: 'Samsung Galaxy Watch 6 Classic',
        brand: 'Samsung',
        model: 'SM-R960',
        category: 'Smartwatches',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
        variantTypes: ['Size', 'Color'],
        variants: [
            {
                title: '47mm / Black',
                combination: ['47mm', 'Black'],
                barcode: '880609503921',
                purchasePrice: 31000,
                retailPrice: 36500,
                mrp: 38000,
                quantity: 5,
                imeis: ['R54N81928401', 'R54N81928402']
            },
            {
                title: '43mm / Silver',
                combination: ['43mm', 'Silver'],
                barcode: '880609503922',
                purchasePrice: 28500,
                retailPrice: 33500,
                mrp: 35000,
                quantity: 4,
                imeis: ['R54N81928403', 'R54N81928404']
            }
        ]
    },
    {
        _id: 'sample-12',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        brand: 'Sony',
        model: 'WH1000XM5/B',
        category: 'Audio',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80',
        variantTypes: ['Color'],
        variants: [
            {
                title: 'Black',
                combination: ['Black'],
                barcode: '027242923980',
                purchasePrice: 33000,
                retailPrice: 38500,
                mrp: 41000,
                quantity: 6,
                imeis: ['S01594819281', 'S01594819282']
            },
            {
                title: 'Silver',
                combination: ['Silver'],
                barcode: '027242923981',
                purchasePrice: 33000,
                retailPrice: 38500,
                mrp: 41000,
                quantity: 4,
                imeis: ['S01594819283', 'S01594819284']
            }
        ]
    },
    {
        _id: 'sample-13',
        name: 'Marshall Emberton II Bluetooth Speaker',
        brand: 'Marshall',
        model: 'Emberton II',
        category: 'Audio',
        condition: 'new',
        warranty: 12,
        hasImei: false,
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&q=80',
        variantTypes: ['Color'],
        variants: [
            {
                title: 'Black and Brass',
                combination: ['Black and Brass'],
                barcode: '734005538600',
                purchasePrice: 16500,
                retailPrice: 19800,
                mrp: 21500,
                quantity: 7,
                imeis: []
            },
            {
                title: 'Cream',
                combination: ['Cream'],
                barcode: '734005538601',
                purchasePrice: 16500,
                retailPrice: 19800,
                mrp: 21500,
                quantity: 5,
                imeis: []
            }
        ]
    },
    {
        _id: 'sample-14',
        name: 'Logitech MX Master 3S Wireless Mouse',
        brand: 'Logitech',
        model: 'MX Master 3S',
        category: 'Accessories',
        condition: 'new',
        warranty: 12,
        hasImei: false,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80',
        variantTypes: ['Color'],
        variants: [
            {
                title: 'Graphite',
                combination: ['Graphite'],
                barcode: '097855174482',
                purchasePrice: 9500,
                retailPrice: 11800,
                mrp: 12500,
                quantity: 12,
                imeis: []
            },
            {
                title: 'Pale Gray',
                combination: ['Pale Gray'],
                barcode: '097855174483',
                purchasePrice: 9500,
                retailPrice: 11800,
                mrp: 12500,
                quantity: 8,
                imeis: []
            }
        ]
    },
    {
        _id: 'sample-15',
        name: 'PlayStation 5 Slim (Disc Edition)',
        brand: 'Sony',
        model: 'CFI-2000',
        category: 'Gaming',
        condition: 'new',
        warranty: 12,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&q=80',
        variantTypes: [],
        retailPrice: 68000,
        purchasePrice: 59000,
        mrp: 72000,
        quantity: 3,
        variants: [
            {
                title: '1TB / White',
                combination: ['1TB White'],
                barcode: '711719574422',
                purchasePrice: 59000,
                retailPrice: 68000,
                mrp: 72000,
                quantity: 3,
                imeis: ['PS5-8192840192', 'PS5-8192840193', 'PS5-8192840194']
            }
        ]
    },
    {
        _id: 'sample-16',
        name: 'Nintendo Switch OLED Model',
        brand: 'Nintendo',
        model: 'HEG-001',
        category: 'Gaming',
        condition: 'new',
        warranty: 6,
        hasImei: true,
        image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300&q=80',
        variantTypes: ['Color'],
        variants: [
            {
                title: 'Neon Blue & Red',
                combination: ['Neon Blue & Red'],
                barcode: '045496883386',
                purchasePrice: 31000,
                retailPrice: 36500,
                mrp: 38500,
                quantity: 4,
                imeis: ['XKW109284019', 'XKW109284020']
            },
            {
                title: 'White',
                combination: ['White'],
                barcode: '045496883387',
                purchasePrice: 31000,
                retailPrice: 36500,
                mrp: 38500,
                quantity: 5,
                imeis: ['XKW109284021', 'XKW109284022']
            }
        ]
    }
];

const generateInvoiceNumber = () => `INV-${Math.floor(100000 + Math.random() * 900000)}`;

const PointOfSales = () => {
    // Invoice number & timestamp
    const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
    const [saleDate, setSaleDate] = useState('');

    // 1. Data fetching from backend
    const { data: dbProducts, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/products');
                return Array.isArray(data) && data.length > 0 ? data : null;
            } catch {
                return null;
            }
        }
    });

    const { data: dbCategories } = useQuery({
        queryKey: ['categoriesName'],
        queryFn: async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/categories/names');
                return Array.isArray(data) ? data : null;
            } catch {
                return null;
            }
        }
    });

    // Merge database data with sample inspiration data so test catalog is always populated
    const catalog = useMemo(() => {
        const dbItems = Array.isArray(dbProducts) ? dbProducts : [];
        return [...dbItems, ...SAMPLE_PRODUCTS];
    }, [dbProducts]);

    // Helper to safely resolve category name (handles ObjectId strings and raw names)
    const getCategoryName = useCallback((catIdOrName) => {
        if (!catIdOrName) return 'Uncategorized';
        if (Array.isArray(dbCategories)) {
            const found = dbCategories.find(c => c._id === catIdOrName || c.name === catIdOrName);
            if (found?.name) return found.name;
        }
        return String(catIdOrName);
    }, [dbCategories]);

    // Categories list for tabs
    const categoriesList = useMemo(() => {
        const catSet = new Set(['All']);
        if (Array.isArray(dbCategories)) {
            dbCategories.forEach(c => {
                if (c?.name) catSet.add(c.name);
            });
        }
        catalog.forEach(p => {
            const name = getCategoryName(p.category);
            if (name && name !== 'Uncategorized') catSet.add(name);
        });
        return Array.from(catSet);
    }, [dbCategories, catalog, getCategoryName]);

    // UI & Filter States
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [salePriceType, setSalePriceType] = useState('retail'); // 'retail' or 'mrp'

    // Cart / Ticket State
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '', note: '' });

    // Financial modifiers
    const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
    const [discountValue, setDiscountValue] = useState(0);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, bKash, Nagad, Card
    const [paidAmount, setPaidAmount] = useState('');

    // Modals
    const [variantModalProduct, setVariantModalProduct] = useState(null);
    const [imeiModalItem, setImeiModalItem] = useState(null);
    const [modalImeiInput, setModalImeiInput] = useState('');
    const modalImeiInputRef = useRef(null);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [heldOrders, setHeldOrders] = useState([]);
    const [heldOrdersModalOpen, setHeldOrdersModalOpen] = useState(false);

    // Auto-focus barcode scanner input whenever IMEI Modal is opened
    useEffect(() => {
        if (imeiModalItem) {
            const timer = setTimeout(() => {
                modalImeiInputRef.current?.focus();
            }, 120);
            return () => clearTimeout(timer);
        }
    }, [imeiModalItem]);

    // Filter catalog with full safety against non-string types
    const filteredProducts = useMemo(() => {
        return catalog.filter(product => {
            const prodCatName = getCategoryName(product.category);
            const matchesCategory = selectedCategory === 'All' || prodCatName === selectedCategory;
            const query = searchQuery.trim().toLowerCase();
            if (!query) return matchesCategory;

            const nameMatch = String(product.name || product.productName || '').toLowerCase().includes(query);
            const brandMatch = String(product.brand || '').toLowerCase().includes(query);
            const modelMatch = String(product.model || '').toLowerCase().includes(query);
            const barcodeMatch = Array.isArray(product.variants) && product.variants.some(v => String(v?.barcode || '').toLowerCase().includes(query));
            const imeiMatch = Array.isArray(product.variants) && product.variants.some(v => Array.isArray(v?.imeis) && v.imeis.some(imei => String(imei || '').toLowerCase().includes(query)));

            return matchesCategory && (nameMatch || brandMatch || modelMatch || barcodeMatch || imeiMatch);
        });
    }, [catalog, selectedCategory, searchQuery, getCategoryName]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalFilteredItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, startIndex, endIndex]);

    // Add product to cart helper
    const handleProductClick = (product) => {
        if (Array.isArray(product.variants) && product.variants.length > 1) {
            setVariantModalProduct(product);
            return;
        }

        const variant = (Array.isArray(product.variants) && product.variants[0]) || {
            title: 'Standard',
            combination: [],
            barcode: product.barcode || '',
            retailPrice: Number(product.retailPrice || product.price) || 0,
            mrp: Number(product.mrp) || Number(product.retailPrice || product.price) || 0,
            quantity: Number(product.quantity) || 1,
            imeis: Array.isArray(product.imeis) ? product.imeis : []
        };

        addItemToCart(product, variant);
    };

    const addItemToCart = (product, variant, initialImei = null) => {
        const itemKey = `${product._id}-${variant.barcode || variant.title || 'default'}`;
        const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

        const retailPrice = Number(variant.retailPrice) || Number(product.retailPrice) || Number(product.price) || 0;
        const mrp = Number(variant.mrp) || Number(product.mrp) || retailPrice;
        const unitPrice = salePriceType === 'mrp' ? (mrp || retailPrice) : (retailPrice || mrp);
        const availableStock = Number(variant.quantity) || Number(product.quantity) || 0;

        if (existingIndex > -1) {
            const currentItem = cart[existingIndex];
            const currentSelected = currentItem.selectedImeis || [];
            let updatedImeis = currentSelected;
            let newQty = currentItem.quantity;

            if (initialImei) {
                if (currentSelected.some(i => String(i).toLowerCase() === String(initialImei).toLowerCase())) {
                    alert(`IMEI "${initialImei}" is already added to cart!`);
                    return;
                }
                if (currentSelected.length >= currentItem.quantity) {
                    if (availableStock > 0 && currentItem.quantity >= availableStock) {
                        alert(`Cannot add more than ${availableStock} units available in stock!`);
                        return;
                    }
                    newQty = currentItem.quantity + 1;
                }
                updatedImeis = [...currentSelected, initialImei];
            } else {
                if (availableStock > 0 && currentItem.quantity >= availableStock) {
                    alert(`Cannot add more than ${availableStock} units available in stock!`);
                    return;
                }
                newQty = currentItem.quantity + 1;
            }

            const updatedCart = [...cart];
            updatedCart[existingIndex] = {
                ...currentItem,
                quantity: newQty,
                selectedImeis: updatedImeis,
                total: newQty * currentItem.unitPrice
            };
            setCart(updatedCart);
        } else {
            const itemImage = product.image || (Array.isArray(product.images) ? (product.images[0]?.url || product.images[0]) : '') || '';
            const newItem = {
                itemKey,
                productId: product._id,
                name: product.name || product.productName || 'Unnamed Product',
                brand: product.brand || '',
                model: product.model || '',
                image: itemImage,
                variantTitle: variant.title || '',
                barcode: variant.barcode || '',
                retailPrice,
                mrp,
                priceType: salePriceType,
                unitPrice,
                quantity: 1,
                total: unitPrice,
                hasImei: Boolean(product.hasImei),
                availableImeis: Array.isArray(variant.imeis) ? variant.imeis : [],
                selectedImeis: initialImei ? [initialImei] : [],
                warranty: product.warranty || 0
            };
            setCart(prev => [newItem, ...prev]);
        }
    };

    // Helper functions for IMEI Modal assignment & barcode scanning
    const getImeiKey = (item) => {
        if (!item) return '';
        if (typeof item === 'object') return (item.imei1 || '').trim().toLowerCase();
        return String(item).trim().toLowerCase();
    };

    const getImeiDisplayText = (item) => {
        if (!item) return '';
        if (typeof item === 'object') {
            const im1 = item.imei1 || '';
            const im2 = item.imei2 || '';
            return im2 ? `${im1} / ${im2}` : im1;
        }
        return String(item);
    };

    const handleAssignImei = (imeiToAssign) => {
        if (!imeiModalItem) return;
        const current = [...(imeiModalItem.selectedImeis || [])];
        const assignKey = getImeiKey(imeiToAssign);
        if (current.some(i => getImeiKey(i) === assignKey)) {
            alert(`IMEI "${getImeiDisplayText(imeiToAssign)}" is already assigned.`);
            return;
        }
        if (current.length >= imeiModalItem.quantity) {
            alert(`All ${imeiModalItem.quantity} unit(s) are already assigned! Increase cart quantity if selling more units.`);
            return;
        }
        const updated = [...current, imeiToAssign];
        setCart(prev => prev.map(item => item.itemKey === imeiModalItem.itemKey ? { ...item, selectedImeis: updated } : item));
        setImeiModalItem(prev => ({ ...prev, selectedImeis: updated }));
    };

    const handleRemoveAssignedImei = (imeiToRemove) => {
        if (!imeiModalItem) return;
        const removeKey = getImeiKey(imeiToRemove);
        const updated = (imeiModalItem.selectedImeis || []).filter(i => getImeiKey(i) !== removeKey);
        setCart(prev => prev.map(item => item.itemKey === imeiModalItem.itemKey ? { ...item, selectedImeis: updated } : item));
        setImeiModalItem(prev => ({ ...prev, selectedImeis: updated }));
    };

    const handleModalImeiScan = (e) => {
        e.preventDefault();
        const code = modalImeiInput.trim();
        if (!code) return;

        const currentSelected = imeiModalItem?.selectedImeis || [];
        const already = currentSelected.find(i => {
            if (typeof i === 'object' && i !== null) {
                return (i.imei1 && i.imei1.toLowerCase() === code.toLowerCase()) ||
                       (i.imei2 && i.imei2.toLowerCase() === code.toLowerCase());
            }
            return String(i).toLowerCase() === code.toLowerCase();
        });
        if (already) {
            alert(`IMEI "${code}" is already assigned to this item.`);
            setModalImeiInput('');
            return;
        }

        if (currentSelected.length >= (imeiModalItem?.quantity || 1)) {
            alert(`All ${imeiModalItem.quantity} unit(s) are already assigned! Increase cart quantity if selling more.`);
            setModalImeiInput('');
            return;
        }

        const available = Array.isArray(imeiModalItem?.availableImeis) ? imeiModalItem.availableImeis : [];
        const matched = available.find(i => {
            if (typeof i === 'object' && i !== null) {
                return (i.imei1 && i.imei1.toLowerCase() === code.toLowerCase()) ||
                       (i.imei2 && i.imei2.toLowerCase() === code.toLowerCase());
            }
            return String(i).toLowerCase() === code.toLowerCase();
        });

        if (matched) {
            handleAssignImei(matched);
            setModalImeiInput('');
        } else {
            if (available.length === 0 || window.confirm(`IMEI "${code}" was not found in the registered stock list for this variant. Assign it anyway?`)) {
                handleAssignImei({ imei1: code, imei2: "" });
                setModalImeiInput('');
            }
        }
    };

    // Toggle entire cart price mode between Retail and MRP
    const handleSalePriceTypeChange = (newType) => {
        setSalePriceType(newType);
        setCart(prev => prev.map(item => {
            const newUnitPrice = newType === 'mrp' ? (item.mrp || item.retailPrice || item.unitPrice) : (item.retailPrice || item.mrp || item.unitPrice);
            return {
                ...item,
                priceType: newType,
                unitPrice: newUnitPrice,
                total: newUnitPrice * item.quantity
            };
        }));
    };

    // Toggle individual cart item between Retail Price and MRP
    const toggleItemPriceType = (itemKey) => {
        setCart(prev => prev.map(item => {
            if (item.itemKey !== itemKey) return item;
            const newType = item.priceType === 'mrp' ? 'retail' : 'mrp';
            const newUnitPrice = newType === 'mrp' ? (item.mrp || item.retailPrice || item.unitPrice) : (item.retailPrice || item.mrp || item.unitPrice);
            return {
                ...item,
                priceType: newType,
                unitPrice: newUnitPrice,
                total: newUnitPrice * item.quantity
            };
        }));
    };

    // Quick barcode scanner / search for Current Sale (supports product barcode and IMEI)
    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        let matchedProduct = null;
        let matchedVariant = null;
        let matchedImei = null;

        for (const prod of catalog) {
            if (Array.isArray(prod.variants)) {
                // Check variant barcode
                let v = prod.variants.find(variant => String(variant?.barcode || '').trim().toLowerCase() === code.toLowerCase());
                if (v) {
                    matchedProduct = prod;
                    matchedVariant = v;
                    break;
                }
                // Check variant IMEIs (supports { imei1, imei2 } or string)
                v = prod.variants.find(variant => Array.isArray(variant?.imeis) && variant.imeis.some(i => {
                    if (typeof i === 'object' && i !== null) {
                        return (i.imei1 && i.imei1.trim().toLowerCase() === code.toLowerCase()) ||
                               (i.imei2 && i.imei2.trim().toLowerCase() === code.toLowerCase());
                    }
                    return String(i || '').trim().toLowerCase() === code.toLowerCase();
                }));
                if (v) {
                    matchedProduct = prod;
                    matchedVariant = v;
                    matchedImei = v.imeis.find(i => {
                        if (typeof i === 'object' && i !== null) {
                            return (i.imei1 && i.imei1.trim().toLowerCase() === code.toLowerCase()) ||
                                   (i.imei2 && i.imei2.trim().toLowerCase() === code.toLowerCase());
                        }
                        return String(i || '').trim().toLowerCase() === code.toLowerCase();
                    });
                    break;
                }
            }
            if (String(prod.barcode || '').trim().toLowerCase() === code.toLowerCase()) {
                matchedProduct = prod;
                matchedVariant = (Array.isArray(prod.variants) && prod.variants[0]) || {
                    title: 'Standard',
                    combination: [],
                    barcode: prod.barcode || '',
                    retailPrice: Number(prod.retailPrice || prod.price) || 0,
                    mrp: Number(prod.mrp) || Number(prod.retailPrice || prod.price) || 0,
                    quantity: Number(prod.quantity) || 1,
                    imeis: Array.isArray(prod.imeis) ? prod.imeis : []
                };
                break;
            }
            if (Array.isArray(prod.imeis) && prod.imeis.some(i => String(i || '').trim().toLowerCase() === code.toLowerCase())) {
                matchedProduct = prod;
                matchedImei = prod.imeis.find(i => String(i || '').trim().toLowerCase() === code.toLowerCase());
                matchedVariant = (Array.isArray(prod.variants) && prod.variants[0]) || {
                    title: 'Standard',
                    combination: [],
                    barcode: prod.barcode || '',
                    retailPrice: Number(prod.retailPrice || prod.price) || 0,
                    mrp: Number(prod.mrp) || Number(prod.retailPrice || prod.price) || 0,
                    quantity: Number(prod.quantity) || 1,
                    imeis: Array.isArray(prod.imeis) ? prod.imeis : []
                };
                break;
            }
        }

        if (matchedProduct && matchedVariant) {
            addItemToCart(matchedProduct, matchedVariant, matchedImei);
            setBarcodeInput('');
        } else {
            alert(`No product or IMEI serial found matching "${code}"`);
        }
    };

    // Cart item quantity controls
    const updateQuantity = (itemKey, delta) => {
        setCart(prev => prev.map(item => {
            if (item.itemKey !== itemKey) return item;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
                ...item,
                quantity: newQty,
                total: newQty * item.unitPrice,
                selectedImeis: (item.selectedImeis || []).slice(0, newQty)
            };
        }).filter(Boolean));
    };

    const removeItemFromCart = (itemKey) => {
        setCart(prev => prev.filter(item => item.itemKey !== itemKey));
    };

    // Calculate totals
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    }, [cart]);

    const discountAmount = useMemo(() => {
        if (!discountValue || discountValue <= 0) return 0;
        if (discountType === 'percent') {
            return (subtotal * Number(discountValue)) / 100;
        }
        return Math.min(Number(discountValue), subtotal);
    }, [subtotal, discountType, discountValue]);

    const grandTotal = useMemo(() => {
        const total = subtotal - discountAmount + Number(deliveryFee || 0);
        return Math.max(0, Math.round(total));
    }, [subtotal, discountAmount, deliveryFee]);

    const changeDue = useMemo(() => {
        const tendered = Number(paidAmount) || 0;
        if (tendered <= 0) return 0;
        return Math.max(0, tendered - grandTotal);
    }, [paidAmount, grandTotal]);

    // Save current cart as held order
    const handleHoldOrder = () => {
        if (cart.length === 0) return;
        const newHold = {
            id: `HOLD-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer,
            cart,
            salePriceType,
            subtotal,
            grandTotal
        };
        setHeldOrders(prev => [newHold, ...prev]);
        setCart([]);
        setCustomer({ name: 'Walk-in Customer', phone: '', note: '' });
        setPaidAmount('');
    };

    // Restore a held order
    const handleRestoreHeld = (holdItem) => {
        setCart(holdItem.cart || []);
        if (holdItem.salePriceType) setSalePriceType(holdItem.salePriceType);
        setCustomer(holdItem.customer || { name: 'Walk-in Customer', phone: '', note: '' });
        setHeldOrders(prev => prev.filter(h => h.id !== holdItem.id));
        setHeldOrdersModalOpen(false);
    };

    // Checkout handler
    const handleCheckout = () => {
        if (cart.length === 0) return;

        // Check if IMEI tracked items have all IMEIs assigned
        const unassignedImeiItem = cart.find(item => item.hasImei && (item.selectedImeis?.length || 0) < item.quantity);
        if (unassignedImeiItem) {
            alert(`Please select ${unassignedImeiItem.quantity} IMEI serial(s) for "${unassignedImeiItem.name} (${unassignedImeiItem.variantTitle || 'Standard'})" before completing the sale.`);
            setImeiModalItem(unassignedImeiItem);
            return;
        }

        setSaleDate(new Date().toLocaleString());
        setReceiptModalOpen(true);
    };

    // Finish sale & reset
    const handleCompleteAndNewSale = () => {
        setReceiptModalOpen(false);
        setCart([]);
        setCustomer({ name: 'Walk-in Customer', phone: '', note: '' });
        setPaidAmount('');
        setDiscountValue(0);
        setDeliveryFee(0);
        setInvoiceNumber(generateInvoiceNumber());
        setSaleDate('');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100dvh-1.5rem)] lg:h-[calc(100dvh-1.5rem)] max-h-[100dvh] w-full p-2 sm:p-3 min-h-0 overflow-hidden box-border">

            {/* ============================================================== */}
            {/* LEFT SECTION: CATALOG, SEARCH, SCAN & PRODUCT GRID             */}
            {/* ============================================================== */}
            <div className="flex-1 flex flex-col gap-3 min-w-0 h-full max-h-full overflow-hidden">

                {/* Top Control Bar: Search & Category Select */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
                        <div className="relative w-full sm:w-72 md:w-80">
                            <input type="text" placeholder="Scan barcode, IMEI, or search product..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="input input-sm h-10 w-full pl-10 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all" />
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            {searchQuery && (
                                <button type="button" onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* Category Filter Select */}
                        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }} className="select select-sm h-10 w-full sm:w-44 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none">
                            {categoriesList.map(category => (
                                <option key={category} value={category}>
                                    {category === 'All' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button type="button" onClick={() => setHeldOrdersModalOpen(true)} className="btn btn-sm h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-medium gap-1.5">
                            <PauseCircle size={16} className="text-amber-600" />
                            <span>Held Orders</span>
                            {heldOrders.length > 0 && (
                                <span className="badge badge-sm bg-amber-500 text-white border-none ml-1">
                                    {heldOrders.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Product Catalog Grid - Independently Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    {productsLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <span className="loading loading-spinner loading-md text-indigo-600"></span>
                            <p className="text-xs font-medium mt-3 text-slate-500">Loading catalog items...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 p-6 text-center">
                            <ShoppingBag size={36} className="text-slate-300 mb-2" />
                            <p className="text-sm font-semibold text-slate-700">No products match your search</p>
                            <p className="text-xs text-slate-400 mt-1">Try another category or barcode keyword</p>
                            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setCurrentPage(1); }} className="btn btn-xs mt-3 text-indigo-600 bg-indigo-50 border-indigo-200">
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
                            {paginatedProducts.map((product, pIndex) => {
                                const variantsArr = Array.isArray(product.variants) ? product.variants : [];
                                const variantCount = variantsArr.length;
                                const firstVariant = variantsArr[0];
                                const itemRetailPrice = Number(firstVariant?.retailPrice) || Number(product.retailPrice) || Number(product.price) || 0;
                                const itemMrp = Number(firstVariant?.mrp) || Number(product.mrp) || itemRetailPrice;
                                const displayPrice = salePriceType === 'mrp' ? itemMrp : itemRetailPrice;
                                const totalStock = variantCount > 0
                                    ? variantsArr.reduce((acc, v) => acc + (Number(v?.quantity) || 0), 0)
                                    : (Number(product.quantity) || 0);

                                const rawImage = product.image || (Array.isArray(product.images) ? (product.images[0]?.url || product.images[0]) : '') || '';
                                const displayImage = rawImage && typeof rawImage === 'string' && rawImage.includes('/image/upload/') ? customizeImageWidth(rawImage, 240) : rawImage;

                                return (
                                    <div
                                        key={String(product._id || `prod-${pIndex}`)}
                                        onClick={() => handleProductClick(product)}
                                        className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none relative"
                                    >
                                        {/* Product Image & Floating Badges */}
                                        <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2.5 flex items-center justify-center">
                                            {/* Badges on top of image */}
                                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 shadow-2xs">
                                                    {product.brand || 'Brand'}
                                                </span>
                                                {product.hasImei && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600/90 backdrop-blur-xs text-white shadow-2xs">
                                                        IMEI
                                                    </span>
                                                )}
                                            </div>

                                            {displayImage ? (
                                                <Image src={displayImage} alt={product.name || 'Product'} width={160} height={160} unoptimized className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200" />
                                            ) : (
                                                <Package size={38} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">
                                                {product.name || product.productName || 'Product'}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                                {product.model || (variantCount > 1 ? `${variantCount} Options` : 'Single unit')}
                                            </p>
                                        </div>

                                        {/* Price & Stock Footer */}
                                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-extrabold text-slate-900">
                                                        ৳{Number(displayPrice || 0).toLocaleString()}
                                                    </span>
                                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${salePriceType === 'mrp' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                        {salePriceType === 'mrp' ? 'MRP' : 'Retail'}
                                                    </span>
                                                </div>
                                                <div className={`text-[10px] font-medium ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                                                </div>
                                            </div>

                                            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-colors">
                                                {variantCount > 1 ? <Layers size={13} /> : <Plus size={14} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination Controls - Pinned at Bottom of Left Column */}
                {totalFilteredItems > 0 && (
                    <div className="bg-white p-2.5 px-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 mt-auto z-10">
                        <span className="text-xs text-slate-500 font-medium">
                            Showing <strong className="text-slate-800">{startIndex + 1}</strong>–<strong className="text-slate-800">{endIndex}</strong> of <strong className="text-slate-800">{totalFilteredItems}</strong> products
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="btn btn-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:bg-slate-50 gap-1 font-medium"
                            >
                                <ChevronLeft size={14} />
                                <span className="hidden sm:inline">Prev</span>
                            </button>

                            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`btn btn-xs h-7 w-7 p-0 rounded-lg border font-bold text-xs ${currentPage === page
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className="btn btn-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:bg-slate-50 gap-1 font-medium"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================== */}
            {/* RIGHT SECTION: REGISTER / CART / CHECKOUT BILLING TICKET       */}
            {/* ============================================================== */}
            <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 h-[calc(100dvh-1.5rem)] lg:h-full max-h-[calc(100dvh-1.5rem)] min-h-0 overflow-hidden">

                {/* Ticket Header & Customer Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 rounded-t-2xl space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <ShoppingCart size={18} className="text-indigo-600" />
                                <h2 className="text-base font-bold text-slate-900">Current Sale</h2>
                            </div>
                            <span suppressHydrationWarning className="text-[11px] font-mono text-slate-400">{invoiceNumber}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Segmented Pricing Toggle: Retail vs MRP */}
                            <div className="flex items-center bg-slate-200/90 p-0.5 rounded-lg border border-slate-300/70 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => handleSalePriceTypeChange('retail')}
                                    title="Apply standard Retail Price to current sale"
                                    className={`px-2 py-0.5 rounded-md transition-all font-bold ${salePriceType === 'retail' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Retail
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSalePriceTypeChange('mrp')}
                                    title="Apply Maximum Retail Price (MRP) to current sale"
                                    className={`px-2 py-0.5 rounded-md transition-all font-bold ${salePriceType === 'mrp' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    MRP
                                </button>
                            </div>

                            {cart.length > 0 && (
                                <button
                                    onClick={handleHoldOrder}
                                    title="Hold this sale for later"
                                    className="btn btn-xs h-8 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 gap-1 rounded-lg"
                                >
                                    <PauseCircle size={14} className="text-amber-500" />
                                    <span>Hold</span>
                                </button>
                            )}
                            <button
                                onClick={() => setCart([])}
                                disabled={cart.length === 0}
                                title="Discard / Clear cart"
                                className="btn btn-xs h-8 btn-ghost text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Customer Info row */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Customer name"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                className="input input-xs h-8 w-full pl-7 pr-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                            />
                            <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Phone (e.g. 017...)"
                                value={customer.phone}
                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                className="input input-xs h-8 w-full pl-7 pr-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                            />
                            <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Barcode Search for Current Sale */}
                    <form onSubmit={handleBarcodeSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Scan barcode or enter & press Enter to add..."
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            className="input input-xs h-8 w-full pl-7 pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                        />
                        <Barcode size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        {barcodeInput && (
                            <button type="button" onClick={() => setBarcodeInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={13} />
                            </button>
                        )}
                    </form>
                </div>

                {/* Cart Items List - Independently Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                                <Barcode size={28} />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Cart is empty</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Click products or scan barcodes on the left to begin</p>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const isImeiMissing = Boolean(item.hasImei) && (item.selectedImeis?.length || 0) < item.quantity;

                            return (
                                <div key={item.itemKey} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2">
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name || 'Cart item'} width={40} height={40} unoptimized className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={18} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                                                {item.name}
                                            </h4>
                                            {item.variantTitle && (
                                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                    {item.variantTitle}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItemFromCart(item.itemKey)}
                                            className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition-colors shrink-0"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>

                                    {/* IMEI Assignment row if product is IMEI-tracked */}
                                    {item.hasImei && (
                                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Scan size={14} className={isImeiMissing ? 'text-amber-500' : 'text-emerald-500'} />
                                                <span className="text-[11px] font-medium text-slate-600">
                                                    IMEIs: <strong className={isImeiMissing ? 'text-amber-600' : 'text-emerald-700'}>{(item.selectedImeis?.length || 0)}/{item.quantity}</strong>
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setImeiModalItem(item)}
                                                className={`btn btn-xs h-6 px-2 text-[10px] rounded border font-semibold ${isImeiMissing
                                                    ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 animate-pulse'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {isImeiMissing ? 'Assign IMEIs' : 'Edit IMEIs'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Quantity & Price calculations */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                            <button
                                                onClick={() => updateQuantity(item.itemKey, -1)}
                                                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.itemKey, 1)}
                                                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleItemPriceType(item.itemKey)}
                                                    title="Click to toggle between Retail Price and MRP for this item"
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${item.priceType === 'mrp' ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
                                                >
                                                    {item.priceType === 'mrp' ? 'MRP' : 'Retail'}
                                                </button>
                                                <span className="text-xs font-bold text-slate-900">
                                                    ৳{Number(item.total || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                ৳{Number(item.unitPrice || 0).toLocaleString()} each
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bill Summary, Discount, Payment & Checkout - Always Pinned at Bottom */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/90 rounded-b-2xl space-y-2.5 shrink-0">

                    {/* Breakdown */}
                    <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                            <span>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                            <span className="font-semibold text-slate-800">৳{subtotal.toLocaleString()}</span>
                        </div>

                        {/* Discount & Delivery row */}
                        <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                            <div>
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span>Discount</span>
                                    <div className="flex gap-1 text-[10px] font-bold">
                                        <button
                                            onClick={() => setDiscountType('flat')}
                                            className={`px-1.5 py-0.5 rounded ${discountType === 'flat' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                                        >
                                            ৳
                                        </button>
                                        <button
                                            onClick={() => setDiscountType('percent')}
                                            className={`px-1.5 py-0.5 rounded ${discountType === 'percent' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                                        >
                                            %
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={discountValue || ''}
                                    onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                                    className="input input-xs h-7 w-full border border-slate-200 bg-white rounded text-xs text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span>Delivery / Courier</span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={deliveryFee || ''}
                                    onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                                    className="input input-xs h-7 w-full border border-slate-200 bg-white rounded text-xs text-slate-800 focus:outline-none"
                                />
                            </div>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Discount Applied</span>
                                <span>-৳{discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Grand Total Display */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payable Amount</span>
                            <div className="text-xl font-black text-slate-900 tracking-tight">
                                ৳{grandTotal.toLocaleString()}
                            </div>
                        </div>

                        {/* Payment Method Daisy Select */}
                        <div className="flex items-center gap-1.5">
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="select select-xs h-8 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none">
                                {['Cash', 'bKash', 'Nagad', 'Card'].map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Amount Received / Tendered & Change Calculation */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-600 font-medium">Received (৳):</span>
                            <input
                                type="number"
                                placeholder={`Exact ৳${grandTotal}`}
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(e.target.value)}
                                className="input input-xs h-7 w-28 border border-slate-300 text-right font-bold text-slate-900 text-xs focus:border-indigo-500 focus:outline-none rounded-lg"
                            />
                        </div>

                        {Number(paidAmount) > 0 && (
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-xs">
                                <span className="font-semibold text-slate-600">Change Due:</span>
                                <span className="font-bold text-emerald-600 text-sm">৳{changeDue.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="btn w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all disabled:bg-slate-300 disabled:text-slate-500"
                    >
                        <span>Complete Sale</span>
                        <ArrowRight size={17} />
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* MODAL 1: VARIANT SELECTION POPUP                               */}
            {/* ============================================================== */}
            {variantModalProduct && (
                <dialog className="modal modal-open z-50">
                    <div className="modal-box bg-white border border-slate-200 shadow-2xl max-w-md p-5 rounded-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">{variantModalProduct.name}</h3>
                                <p className="text-xs text-slate-500">Select which variant to add to current ticket</p>
                            </div>
                            <button onClick={() => setVariantModalProduct(null)} className="btn btn-sm btn-circle btn-ghost text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
                            {Array.isArray(variantModalProduct.variants) && variantModalProduct.variants.map((variant, index) => {
                                const stock = Number(variant?.quantity) || 0;
                                const vRetail = Number(variant?.retailPrice) || Number(variantModalProduct.retailPrice) || 0;
                                const vMrp = Number(variant?.mrp) || Number(variantModalProduct.mrp) || vRetail;
                                const activePrice = salePriceType === 'mrp' ? vMrp : vRetail;
                                return (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            if (stock > 0) {
                                                addItemToCart(variantModalProduct, variant);
                                                setVariantModalProduct(null);
                                            }
                                        }}
                                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${stock > 0
                                            ? 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer'
                                            : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                            }`}
                                    >
                                        <div>
                                            <div className="text-xs font-bold text-slate-800">
                                                {variant?.title || 'Standard'}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                Barcode: {variant?.barcode || 'N/A'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                Retail: ৳{vRetail.toLocaleString()} • MRP: ৳{vMrp.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900">
                                                ৳{Number(activePrice || 0).toLocaleString()}
                                            </div>
                                            <div className="text-[10px] font-semibold text-indigo-600">
                                                {salePriceType === 'mrp' ? 'MRP' : 'Retail'}
                                            </div>
                                            <div className={`text-[11px] font-medium ${stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {stock > 0 ? `${stock} available` : 'Out of stock'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={() => setVariantModalProduct(null)}>close</button>
                    </form>
                </dialog>
            )}

            {/* ============================================================== */}
            {/* MODAL 2: IMEI SELECTOR & SCANNER (Hardware Serial Number Assignment)*/}
            {/* ============================================================== */}
            {imeiModalItem && (
                <dialog className="modal modal-open z-50">
                    <div className="modal-box bg-white border border-slate-200 shadow-2xl max-w-lg p-5 rounded-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Scan size={18} className="text-indigo-600" />
                                    <h3 className="text-base font-bold text-slate-900">Assign IMEI / Serial Number</h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {imeiModalItem.name} {imeiModalItem.variantTitle ? `(${imeiModalItem.variantTitle})` : ''}
                                </p>
                            </div>
                            <button onClick={() => setImeiModalItem(null)} className="btn btn-sm btn-circle btn-ghost text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="py-4 space-y-3.5">
                            {/* Status indicator banner */}
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                                <div className="text-xs text-slate-600">
                                    Units in cart: <strong className="text-slate-900">{imeiModalItem.quantity}</strong>
                                </div>
                                <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                    (imeiModalItem.selectedImeis?.length || 0) === imeiModalItem.quantity
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                    {(imeiModalItem.selectedImeis?.length || 0)} / {imeiModalItem.quantity} Assigned
                                </div>
                            </div>

                            {/* Barcode Scanner Input Form */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Scan IMEI Barcode
                                </label>
                                <form onSubmit={handleModalImeiScan} className="relative">
                                    <input
                                        ref={modalImeiInputRef}
                                        type="text"
                                        placeholder="Scan barcode or type IMEI & press Enter..."
                                        value={modalImeiInput}
                                        onChange={(e) => setModalImeiInput(e.target.value)}
                                        className="input input-sm h-10 w-full pl-9 pr-20 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                                    />
                                    <Scan size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        type="submit"
                                        className="btn btn-xs h-7 absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg border-none text-[11px] px-3 font-semibold"
                                    >
                                        Assign
                                    </button>
                                </form>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Ready for USB/Bluetooth barcode scanner or manual keyboard entry.
                                </p>
                            </div>

                            {/* Assigned IMEIs Pill List */}
                            {(imeiModalItem.selectedImeis?.length || 0) > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-semibold text-slate-700">Currently Assigned:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCart(prev => prev.map(item => item.itemKey === imeiModalItem.itemKey ? { ...item, selectedImeis: [] } : item));
                                                setImeiModalItem(prev => ({ ...prev, selectedImeis: [] }));
                                            }}
                                            className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {imeiModalItem.selectedImeis.map((imei, idx) => (
                                            <span
                                                key={getImeiKey(imei) || idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-semibold"
                                            >
                                                <Check size={12} className="text-emerald-600" />
                                                <span>{getImeiDisplayText(imei)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAssignedImei(imei)}
                                                    className="text-emerald-500 hover:text-rose-600 ml-0.5 cursor-pointer"
                                                    title="Remove this IMEI"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available IMEIs in Inventory / Stock list */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                                    Or Click from Available Stock Serials ({Array.isArray(imeiModalItem.availableImeis) ? imeiModalItem.availableImeis.length : 0})
                                </label>
                                <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                    {Array.isArray(imeiModalItem.availableImeis) && imeiModalItem.availableImeis.length > 0 ? (
                                        imeiModalItem.availableImeis.map((imei, idx) => {
                                            const itemKey = getImeiKey(imei) || idx;
                                            const isSelected = (imeiModalItem.selectedImeis || []).some(s => getImeiKey(s) === getImeiKey(imei));
                                            return (
                                                <div
                                                    key={itemKey}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            handleRemoveAssignedImei(imei);
                                                        } else {
                                                            handleAssignImei(imei);
                                                        }
                                                    }}
                                                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                                                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Barcode size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                                                        <span>{getImeiDisplayText(imei)}</span>
                                                    </div>
                                                    {isSelected ? (
                                                        <span className="badge badge-xs bg-white text-indigo-700 border-none font-bold">Assigned</span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-sans">Click to assign</span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-5 text-xs text-slate-400">
                                            No pre-registered serials in stock. You can scan or type custom IMEIs above.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-action border-t border-slate-200 pt-3 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-medium">
                                {(imeiModalItem.selectedImeis?.length || 0) < imeiModalItem.quantity
                                    ? `Need ${imeiModalItem.quantity - (imeiModalItem.selectedImeis?.length || 0)} more IMEI(s)`
                                    : '✓ All required IMEIs assigned'}
                            </span>
                            <button
                                onClick={() => setImeiModalItem(null)}
                                className={`btn btn-sm border-none rounded-xl px-5 text-white font-bold ${(imeiModalItem.selectedImeis?.length || 0) === imeiModalItem.quantity ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={() => setImeiModalItem(null)}>close</button>
                    </form>
                </dialog>
            )}

            {/* ============================================================== */}
            {/* MODAL 3: INVOICE / RECEIPT PREVIEW (PRINTABLE)                 */}
            {/* ============================================================== */}
            {receiptModalOpen && (
                <dialog className="modal modal-open z-50">
                    <div className="modal-box bg-white border border-slate-200 shadow-2xl max-w-md p-6 rounded-2xl">
                        {/* Printable Receipt layout */}
                        <div id="printable-receipt" className="space-y-4 text-slate-800">

                            {/* Store Header */}
                            <div className="text-center pb-3 border-b border-dashed border-slate-300">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">MR. TECH WORLD</h2>
                                <p className="text-[11px] text-slate-500">Multiplan Center, Level-4, Dhaka, Bangladesh</p>
                                <p className="text-[11px] text-slate-500">Helpline: +880 1700-000000 • VAT Reg: 00123984</p>
                            </div>

                            {/* Invoice Meta */}
                            <div className="text-xs space-y-1 text-slate-600 pb-2 border-b border-dashed border-slate-300">
                                <div className="flex justify-between">
                                    <span>Invoice No:</span>
                                    <span suppressHydrationWarning className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date &amp; Time:</span>
                                    <span suppressHydrationWarning>{saleDate || 'Recent'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Customer:</span>
                                    <span className="font-semibold text-slate-900">{customer.name}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex justify-between">
                                        <span>Phone:</span>
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Payment Method:</span>
                                    <span className="font-bold text-indigo-600">{paymentMethod}</span>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="text-xs space-y-2">
                                <div className="font-semibold text-slate-700 grid grid-cols-12 pb-1 border-b border-slate-200">
                                    <span className="col-span-6">Item</span>
                                    <span className="col-span-2 text-center">Qty</span>
                                    <span className="col-span-4 text-right">Total</span>
                                </div>

                                {cart.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 py-1 border-b border-slate-100 text-[11px]">
                                        <div className="col-span-6">
                                            <div className="font-bold text-slate-900">{item.name}</div>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                {item.variantTitle && <span>{item.variantTitle}</span>}
                                                <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                                                    {item.priceType === 'mrp' ? 'MRP' : 'Retail'}
                                                </span>
                                            </div>
                                            {item.selectedImeis?.length > 0 && (
                                                <div className="font-mono text-[10px] text-indigo-600 mt-0.5">
                                                    IMEI: {item.selectedImeis.map(i => getImeiDisplayText(i)).join(', ')}
                                                </div>
                                            )}
                                            {item.warranty > 0 && (
                                                <div className="text-[10px] text-slate-400">
                                                    Warranty: {item.warranty} Months
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-center text-slate-700">
                                            {item.quantity}
                                        </div>
                                        <div className="col-span-4 text-right font-bold text-slate-900">
                                            ৳{Number(item.total || 0).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="text-xs space-y-1 pt-2 border-t border-slate-200">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>৳{subtotal.toLocaleString()}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount:</span>
                                        <span>-৳{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span>Delivery:</span>
                                        <span>৳{Number(deliveryFee).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                                    <span>Grand Total:</span>
                                    <span>৳{grandTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Paid:</span>
                                    <span>৳{(Number(paidAmount) || grandTotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Change:</span>
                                    <span className="font-bold text-emerald-600">৳{changeDue.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Footer message */}
                            <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400 space-y-0.5">
                                <p>Thank you for choosing Mr. Tech World!</p>
                                <p>Goods once sold can be exchanged within 7 days with invoice.</p>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-slate-200">
                            <button
                                onClick={() => window.print()}
                                className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl gap-1.5"
                            >
                                <Printer size={15} />
                                <span>Print Receipt</span>
                            </button>
                            <button
                                onClick={handleCompleteAndNewSale}
                                className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl px-5"
                            >
                                New Sale
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={handleCompleteAndNewSale}>close</button>
                    </form>
                </dialog>
            )}

            {/* ============================================================== */}
            {/* MODAL 4: HELD / PARKED ORDERS LIST                             */}
            {/* ============================================================== */}
            {heldOrdersModalOpen && (
                <dialog className="modal modal-open z-50">
                    <div className="modal-box bg-white border border-slate-200 shadow-2xl max-w-md p-5 rounded-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Held Orders ({heldOrders.length})</h3>
                                <p className="text-xs text-slate-500">Resume any parked ticket to complete checkout</p>
                            </div>
                            <button onClick={() => setHeldOrdersModalOpen(false)} className="btn btn-sm btn-circle btn-ghost text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
                            {heldOrders.length === 0 ? (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    No orders are currently parked.
                                </div>
                            ) : (
                                heldOrders.map(hold => (
                                    <div key={hold.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">
                                                {hold.customer?.name || 'Walk-in'} ({hold.cart?.length || 0} items)
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                Time: {hold.timestamp} • Total: ৳{Number(hold.grandTotal || 0).toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestoreHeld(hold)}
                                            className="btn btn-xs bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg"
                                        >
                                            Resume
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button type="button" onClick={() => setHeldOrdersModalOpen(false)}>close</button>
                    </form>
                </dialog>
            )}

        </div>
    );
};

export default PointOfSales;
