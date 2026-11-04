'use client'
import React, { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import {
    ArrowDown,
    Check,
    Clock,
    Columns2,
    Download,
    Eye,
    Grid3X3,
    Layers,
    Maximize2,
    Minus,
    Move,
    Plus,
    RefreshCw,
    RotateCcw,
    Sliders,
    Sparkles,
    Split,
    UploadCloud,
    Zap,
    ZoomIn,
    ZoomOut
} from 'lucide-react';

const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getImageDimensions = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = url;
    });
};

const DEFAULT_OPTIONS = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
};

const ImageTest = () => {
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const originalUrlRef = useRef(null);
    const compressedUrlRef = useRef(null);

    // Image Data States
    const [loading, setLoading] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [compressedData, setCompressedData] = useState(null);
    const [compressionTime, setCompressionTime] = useState(null);

    // Compression Options State (Live Tuning)
    const [options, setOptions] = useState(DEFAULT_OPTIONS);

    // View & Inspection Modes: 'split' | 'side-by-side' | 'difference' | 'onion'
    const [viewMode, setViewMode] = useState('split');

    // Split Slider (0 to 100%)
    const [sliderPos, setSliderPos] = useState(50);
    const isDraggingSlider = useRef(false);

    // Zoom & Pan
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });

    // Inspection Features
    const [pixelated, setPixelated] = useState(false);
    const [diffBoost, setDiffBoost] = useState(5);
    const [onionOpacity, setOnionOpacity] = useState(50);

    // Safely cleanup object URLs only when unmounting or explicitly replacing
    useEffect(() => {
        return () => {
            if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
            if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
        };
    }, []);

    // Core Compression Runner
    const runCompression = async (file, customOptions) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        setLoading(true);
        const startTime = performance.now();

        try {
            // Setup original preview if not already done
            let origUrl = originalUrlRef.current;
            let origDims = originalData ? { width: originalData.width, height: originalData.height } : null;

            if (!origUrl) {
                origUrl = URL.createObjectURL(file);
                originalUrlRef.current = origUrl;
                origDims = await getImageDimensions(origUrl);
                setOriginalData({
                    file,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: origUrl,
                    width: origDims.width,
                    height: origDims.height,
                });
            }

            const activeOptions = customOptions || options;
            const compressedFile = await imageCompression(file, activeOptions);
            const endTime = performance.now();
            setCompressionTime(Math.round(endTime - startTime));

            // Safely revoke only previous compressed URL
            if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);

            const compressedUrl = URL.createObjectURL(compressedFile);
            compressedUrlRef.current = compressedUrl;
            const compressedDims = await getImageDimensions(compressedUrl);

            const extension = activeOptions.fileType === 'image/webp' ? 'webp' : activeOptions.fileType === 'image/jpeg' ? 'jpg' : 'png';

            setCompressedData({
                file: compressedFile,
                name: file.name.replace(/\.[^/.]+$/, '') + `.${extension}`,
                type: compressedFile.type || activeOptions.fileType,
                size: compressedFile.size,
                url: compressedUrl,
                width: compressedDims.width,
                height: compressedDims.height,
            });
        } catch (error) {
            console.error('Image compression failed:', error);
            alert('Compression error: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Revoke old URLs before creating new ones
            if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
            if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
            originalUrlRef.current = null;
            compressedUrlRef.current = null;
            setOriginalData(null);
            setCompressedData(null);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setSliderPos(50);

            runCompression(file, options);
        }
    };

    const handleRecompress = () => {
        if (originalData?.file) {
            runCompression(originalData.file, options);
        }
    };

    const handleResetOptions = () => {
        setOptions(DEFAULT_OPTIONS);
        if (originalData?.file) {
            runCompression(originalData.file, DEFAULT_OPTIONS);
        }
    };

    const handleResetAll = () => {
        if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
        if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
        originalUrlRef.current = null;
        compressedUrlRef.current = null;
        setOriginalData(null);
        setCompressedData(null);
        setCompressionTime(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSliderPos(50);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSliderPos(50);
    };

    // Zoom Handlers
    const handleZoomChange = (newZoom) => {
        setZoom(Math.max(0.5, Math.min(8, Number(newZoom.toFixed(2)))));
    };

    const handleWheelZoom = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoom(prev => Math.max(0.5, Math.min(8, Number((prev + delta).toFixed(2)))));
    };

    // Split Slider Dragging
    const handleSliderPointerDown = (e) => {
        e.stopPropagation();
        isDraggingSlider.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleSliderPointerMove = (e) => {
        if (!isDraggingSlider.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pct);
    };

    const handleSliderPointerUp = () => {
        isDraggingSlider.current = false;
    };

    // Canvas Panning (Drag to Move)
    const handlePanPointerDown = (e) => {
        if (isDraggingSlider.current) return;
        isPanning.current = true;
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePanPointerMove = (e) => {
        if (!isPanning.current) return;
        setPan({
            x: e.clientX - panStart.current.x,
            y: e.clientY - panStart.current.y,
        });
    };

    const handlePanPointerUp = () => {
        isPanning.current = false;
    };

    const reductionPercent = originalData && compressedData && originalData.size > 0
        ? Math.max(0, (((originalData.size - compressedData.size) / originalData.size) * 100)).toFixed(1)
        : 0;

    const compressionRatio = originalData && compressedData && compressedData.size > 0
        ? (originalData.size / compressedData.size).toFixed(1)
        : '1.0';

    const imageStyle = {
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: 'center center',
        imageRendering: pixelated ? 'pixelated' : 'auto',
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
            {/* Top Toolbar */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white flex items-center gap-2">
                            Image Inspection &amp; Compression Lab
                            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase">Pro</span>
                        </h1>
                        <p className="text-xs text-slate-400">Deep-inspect quality, artifacts &amp; pixel deltas with Squoosh-style controls</p>
                    </div>
                </div>

                {/* Right Top Actions */}
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-1.5 shadow-sm">
                        <UploadCloud size={14} /> Select Image
                    </button>

                    {originalData && (
                        <button type="button" onClick={handleResetAll} className="btn btn-sm bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60 gap-1.5">
                            <RotateCcw size={14} /> Reset
                        </button>
                    )}
                </div>
            </header>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            <div className="flex-1 flex flex-col p-4 md:p-6 gap-4">
                {/* Compression Parameters Customizer (Always Available) */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                            <Sliders size={16} className="text-indigo-400" />
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Compression Parameters</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={handleResetOptions} className="btn btn-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700">
                                Reset Defaults
                            </button>
                            <button type="button" disabled={loading || !originalData} onClick={handleRecompress} className="btn btn-xs bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-1.5 shadow-sm px-3">
                                <Zap size={13} /> {loading ? 'Compressing...' : 'Apply & Re-compress'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {/* maxSizeMB */}
                        <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-300">maxSizeMB (Limit)</label>
                                <span className="text-indigo-400 font-mono font-bold">{options.maxSizeMB} MB</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="number" min="0.05" max="10" step="0.05" value={options.maxSizeMB} onChange={(e) => setOptions(prev => ({ ...prev, maxSizeMB: parseFloat(e.target.value) || 0.1 }))} className="input input-xs input-bordered bg-slate-900 border-slate-700 text-white w-20 font-mono" />
                                <input type="range" min="0.05" max="2" step="0.05" value={options.maxSizeMB} onChange={(e) => setOptions(prev => ({ ...prev, maxSizeMB: parseFloat(e.target.value) }))} className="range range-xs range-primary flex-1" />
                            </div>
                        </div>

                        {/* maxWidthOrHeight */}
                        <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-300">maxWidthOrHeight</label>
                                <span className="text-indigo-400 font-mono font-bold">{options.maxWidthOrHeight} px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="number" min="200" max="4000" step="50" value={options.maxWidthOrHeight} onChange={(e) => setOptions(prev => ({ ...prev, maxWidthOrHeight: parseInt(e.target.value) || 600 }))} className="input input-xs input-bordered bg-slate-900 border-slate-700 text-white w-20 font-mono" />
                                <input type="range" min="400" max="2400" step="100" value={options.maxWidthOrHeight} onChange={(e) => setOptions(prev => ({ ...prev, maxWidthOrHeight: parseInt(e.target.value) }))} className="range range-xs range-primary flex-1" />
                            </div>
                        </div>

                        {/* initialQuality */}
                        <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-300">initialQuality</label>
                                <span className="text-indigo-400 font-mono font-bold">{Math.round(options.initialQuality * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="number" min="0.1" max="1" step="0.05" value={options.initialQuality} onChange={(e) => setOptions(prev => ({ ...prev, initialQuality: parseFloat(e.target.value) || 0.1 }))} className="input input-xs input-bordered bg-slate-900 border-slate-700 text-white w-20 font-mono" />
                                <input type="range" min="0.1" max="1" step="0.05" value={options.initialQuality} onChange={(e) => setOptions(prev => ({ ...prev, initialQuality: parseFloat(e.target.value) }))} className="range range-xs range-primary flex-1" />
                            </div>
                        </div>

                        {/* fileType & WebWorker */}
                        <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            <label className="font-semibold text-slate-300 block">fileType Codec</label>
                            <select value={options.fileType} onChange={(e) => setOptions(prev => ({ ...prev, fileType: e.target.value }))} className="select select-xs select-bordered bg-slate-900 border-slate-700 text-white w-full">
                                <option value="image/webp">image/webp (Standard)</option>
                                <option value="image/jpeg">image/jpeg</option>
                                <option value="image/png">image/png</option>
                            </select>
                            <label className="flex items-center gap-1.5 cursor-pointer pt-1 text-[11px] text-slate-400">
                                <input type="checkbox" checked={options.useWebWorker} onChange={(e) => setOptions(prev => ({ ...prev, useWebWorker: e.target.checked }))} className="checkbox checkbox-xs checkbox-primary" />
                                <span>useWebWorker: true</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {!originalData && (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div onClick={() => fileInputRef.current?.click()} className="max-w-xl w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-indigo-950/20 rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center gap-4 shadow-2xl">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <UploadCloud size={40} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Click or Drop an Image Here</h2>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Compare the original vs compressed image with live split slider, difference map, and synchronized zoom &amp; pan.
                                </p>
                            </div>
                            <span className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md px-6">
                                Browse Image File
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                        <span className="loading loading-spinner loading-lg text-indigo-500"></span>
                        <p className="text-sm font-medium text-slate-300">Compressing with WebWorker...</p>
                    </div>
                )}

                {/* Main Inspection Stage */}
                {originalData && compressedData && (
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Metrics Banner */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Savings</span>
                                <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                                    <ArrowDown size={18} /> {reductionPercent}%
                                </div>
                                <span className="text-[11px] text-slate-400">Saved {formatBytes(originalData.size - compressedData.size)}</span>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Size Comparison</span>
                                <div className="text-sm font-bold text-white mt-1">
                                    <span className="text-slate-400 font-mono">{formatBytes(originalData.size)}</span>
                                    <span className="text-indigo-400 mx-1.5">→</span>
                                    <span className="text-emerald-400 font-mono">{formatBytes(compressedData.size)}</span>
                                </div>
                                <span className="text-[11px] text-slate-500">Ratio: {compressionRatio}:1</span>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Dimensions</span>
                                <div className="text-sm font-bold text-white mt-1 font-mono">
                                    {originalData.width}×{originalData.height}
                                    <span className="text-indigo-400 mx-1">→</span>
                                    {compressedData.width}×{compressedData.height}
                                </div>
                                <span className="text-[11px] text-slate-500">{(originalData.width * originalData.height / 1000000).toFixed(1)} MP → {(compressedData.width * compressedData.height / 1000000).toFixed(1)} MP</span>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Processing Time</span>
                                <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-1.5 font-mono">
                                    <Clock size={16} className="text-indigo-400" /> {compressionTime} ms
                                </div>
                                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                                    <Check size={11} /> Multi-thread WebWorker
                                </span>
                            </div>

                            <div className="col-span-2 md:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Download Result</span>
                                <a href={compressedData.url} download={compressedData.name} className="btn btn-xs bg-indigo-600 hover:bg-indigo-700 text-white border-none w-full gap-1">
                                    <Download size={13} /> Download WebP
                                </a>
                            </div>
                        </div>

                        {/* Viewport Control Bar */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                            {/* View Modes Tabs */}
                            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                                <button type="button" onClick={() => setViewMode('split')} className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <Split size={14} /> Split Slider
                                </button>
                                <button type="button" onClick={() => setViewMode('side-by-side')} className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${viewMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <Columns2 size={14} /> Side by Side
                                </button>
                                <button type="button" onClick={() => setViewMode('difference')} className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${viewMode === 'difference' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <Layers size={14} /> Difference Map
                                </button>
                                <button type="button" onClick={() => setViewMode('onion')} className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${viewMode === 'onion' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    <Eye size={14} /> Onion Skin
                                </button>
                            </div>

                            {/* Viewport Specific Options */}
                            <div className="flex items-center gap-4">
                                {/* Split Slider Position Bar */}
                                {viewMode === 'split' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Divider:</span>
                                        <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(parseFloat(e.target.value))} className="range range-xs range-primary w-28" />
                                        <span className="text-indigo-400 font-mono w-9">{Math.round(sliderPos)}%</span>
                                    </div>
                                )}

                                {/* Difference Mode Sensitivity */}
                                {viewMode === 'difference' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Diff Amplify:</span>
                                        <div className="join">
                                            {[1, 2, 5, 10].map(multiplier => (
                                                <button key={multiplier} type="button" onClick={() => setDiffBoost(multiplier)} className={`join-item btn btn-xs ${diffBoost === multiplier ? 'btn-primary' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                                                    {multiplier}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Onion Skin Fade Slider */}
                                {viewMode === 'onion' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Blend:</span>
                                        <input type="range" min="0" max="100" value={onionOpacity} onChange={(e) => setOnionOpacity(parseInt(e.target.value))} className="range range-xs range-primary w-28" />
                                        <span className="text-indigo-400 font-mono w-9">{onionOpacity}%</span>
                                    </div>
                                )}

                                {/* Pixelated Rendering Toggle */}
                                <button type="button" onClick={() => setPixelated(prev => !prev)} title="Toggle pixelated rendering without bilinear blur" className={`btn btn-xs gap-1 border ${pixelated ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
                                    <Grid3X3 size={13} /> Pixel Grid: {pixelated ? 'ON' : 'OFF'}
                                </button>

                                {/* Zoom Controls */}
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                                    <button type="button" onClick={() => handleZoomChange(zoom - 0.25)} title="Zoom Out" className="btn btn-xs btn-ghost text-slate-300 hover:text-white p-1">
                                        <Minus size={14} />
                                    </button>

                                    <div className="dropdown dropdown-hover dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-xs btn-ghost text-slate-200 font-mono px-2">
                                            {Math.round(zoom * 100)}%
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu p-1 shadow-lg bg-slate-950 border border-slate-800 rounded-box w-24 z-30 text-xs">
                                            {[0.5, 1, 1.5, 2, 3, 4, 6].map(lvl => (
                                                <li key={lvl}><a onClick={() => setZoom(lvl)} className={zoom === lvl ? 'text-indigo-400 font-bold' : ''}>{lvl * 100}%</a></li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button type="button" onClick={() => handleZoomChange(zoom + 0.25)} title="Zoom In" className="btn btn-xs btn-ghost text-slate-300 hover:text-white p-1">
                                        <Plus size={14} />
                                    </button>

                                    <div className="w-px h-4 bg-slate-800 mx-0.5"></div>

                                    <button type="button" onClick={resetView} title="Reset Zoom & Pan" className="btn btn-xs btn-ghost text-slate-400 hover:text-white gap-1 px-1.5">
                                        <Maximize2 size={12} /> Fit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Canvas Stage Area */}
                        <div className="flex-1 w-full min-h-[580px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl flex items-center justify-center">

                            {/* MODE 1: Interactive Split Slider (Squoosh Style) */}
                            {viewMode === 'split' && (
                                <div
                                    ref={containerRef}
                                    onPointerDown={handlePanPointerDown}
                                    onPointerMove={(e) => {
                                        handlePanPointerMove(e);
                                        handleSliderPointerMove(e);
                                    }}
                                    onPointerUp={() => {
                                        handlePanPointerUp();
                                        handleSliderPointerUp();
                                    }}
                                    onWheel={handleWheelZoom}
                                    className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
                                >
                                    {/* Floating Labels */}
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                                        <span className="badge badge-sm bg-slate-900/90 text-slate-200 border-slate-700 shadow-lg px-2.5 py-1 text-[11px] font-bold">
                                            ORIGINAL ({formatBytes(originalData.size)})
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                                        <span className="badge badge-sm bg-indigo-600/90 text-white border-none shadow-lg px-2.5 py-1 text-[11px] font-bold">
                                            COMPRESSED ({formatBytes(compressedData.size)})
                                        </span>
                                    </div>

                                    {/* Scaled & Panned Image Frame */}
                                    <div style={imageStyle} className="relative inline-flex items-center justify-center select-none">
                                        {/* Compressed Image (Underneath) */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={compressedData.url} alt="Compressed" className="max-w-none max-h-[520px] select-none pointer-events-none rounded shadow-md block" />

                                        {/* Original Image (Clipped on top from right edge) */}
                                        <div style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} className="absolute inset-0 pointer-events-none">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={originalData.url} alt="Original" className="w-full h-full object-cover select-none pointer-events-none rounded shadow-md" />
                                        </div>

                                        {/* Draggable Divider Line directly on the frame */}
                                        <div
                                            style={{ left: `${sliderPos}%` }}
                                            onPointerDown={handleSliderPointerDown}
                                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)] cursor-ew-resize z-20 flex items-center justify-center -translate-x-1/2 group pointer-events-auto"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border border-slate-300 flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95">
                                                <Split size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MODE 2: Synchronized Side by Side */}
                            {viewMode === 'side-by-side' && (
                                <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                                    {/* Left: Original */}
                                    <div
                                        onPointerDown={handlePanPointerDown}
                                        onPointerMove={handlePanPointerMove}
                                        onPointerUp={handlePanPointerUp}
                                        onWheel={handleWheelZoom}
                                        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
                                    >
                                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                                            <span className="badge badge-sm bg-slate-900/90 text-slate-200 border-slate-700 text-[11px] font-bold">
                                                Original • {formatBytes(originalData.size)} • {originalData.width}×{originalData.height}
                                            </span>
                                        </div>
                                        <div style={imageStyle} className="pointer-events-none flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={originalData.url} alt="Original" className="max-w-none max-h-[500px] select-none rounded shadow-md" />
                                        </div>
                                    </div>

                                    {/* Right: Compressed */}
                                    <div
                                        onPointerDown={handlePanPointerDown}
                                        onPointerMove={handlePanPointerMove}
                                        onPointerUp={handlePanPointerUp}
                                        onWheel={handleWheelZoom}
                                        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
                                    >
                                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                                            <span className="badge badge-sm bg-indigo-600/90 text-white border-none text-[11px] font-bold">
                                                Compressed • {formatBytes(compressedData.size)} • {compressedData.width}×{compressedData.height}
                                            </span>
                                        </div>
                                        <div style={imageStyle} className="pointer-events-none flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={compressedData.url} alt="Compressed" className="max-w-none max-h-[500px] select-none rounded shadow-md" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MODE 3: Difference Heatmap */}
                            {viewMode === 'difference' && (
                                <div
                                    onPointerDown={handlePanPointerDown}
                                    onPointerMove={handlePanPointerMove}
                                    onPointerUp={handlePanPointerUp}
                                    onWheel={handleWheelZoom}
                                    className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
                                >
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none max-w-sm">
                                        <span className="badge badge-sm bg-rose-600 text-white border-none text-[11px] font-bold">
                                            PIXEL DIFFERENCE HEATMAP ({diffBoost}x)
                                        </span>
                                        <p className="text-[11px] text-slate-400 mt-1 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                                            Black = 100% identical pixels. Colored/bright areas reveal compression artifacts, noise, and chroma loss.
                                        </p>
                                    </div>

                                    <div style={imageStyle} className="relative inline-flex items-center justify-center select-none">
                                        {/* Base Original */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={originalData.url} alt="Base Original" className="max-w-none max-h-[520px] select-none rounded block" />

                                        {/* Inverted Difference Mask */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={compressedData.url}
                                            alt="Diff Mask"
                                            style={{
                                                mixBlendMode: 'difference',
                                                filter: `contrast(${diffBoost * 100}%) brightness(${diffBoost * 100}%)`,
                                            }}
                                            className="absolute inset-0 w-full h-full object-cover select-none rounded pointer-events-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* MODE 4: Onion Skin (Opacity Cross-Fade) */}
                            {viewMode === 'onion' && (
                                <div
                                    onPointerDown={handlePanPointerDown}
                                    onPointerMove={handlePanPointerMove}
                                    onPointerUp={handlePanPointerUp}
                                    onWheel={handleWheelZoom}
                                    className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
                                >
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                                        <span className="badge badge-sm bg-slate-900/90 text-slate-200 border-slate-700 text-[11px] font-bold">
                                            ONION FADE: {100 - onionOpacity}% Original / {onionOpacity}% Compressed
                                        </span>
                                    </div>

                                    <div style={imageStyle} className="relative inline-flex items-center justify-center select-none">
                                        {/* Underneath: Original */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={originalData.url} alt="Original" className="max-w-none max-h-[520px] select-none rounded shadow-md block" />

                                        {/* Overlaid: Compressed with dynamic opacity */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={compressedData.url}
                                            alt="Compressed"
                                            style={{ opacity: onionOpacity / 100 }}
                                            className="absolute inset-0 w-full h-full object-cover select-none rounded shadow-md transition-opacity duration-75 pointer-events-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bottom Navigation Hint */}
                            <div className="absolute bottom-3 right-3 z-20 pointer-events-none bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Move size={12} /> Drag to pan</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><ZoomIn size={12} /> Scroll to zoom</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageTest;
