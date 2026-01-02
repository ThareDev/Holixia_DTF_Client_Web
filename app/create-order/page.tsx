'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { addOrderItem, removeOrderItem, updateOrderItem, clearOrder } from '@/store/slices/orderSlice';


type PrintSize = 'A4' | 'A3';

interface OrderItem {
    id: string;
    imagePreview: string;
    fileName: string;
    fileSize: number;
    size: PrintSize;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
}

const PRICE_PER_SIZE: Record<PrintSize, number> = {
    'A4': 200,
    'A3': 400,
};

export default function CreateOrderPage() {
    // Current upload state
    const dispatch = useDispatch();
    const router = useRouter();

    // Get order items from Redux instead of local state
    const { items: orderItems, totalAmount } = useSelector((state: RootState) => state.order);

    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [currentFileName, setCurrentFileName] = useState<string>('');
    const [currentFileSize, setCurrentFileSize] = useState<number>(0);
    const [selectedSize, setSelectedSize] = useState<PrintSize>('A4');
    const [quantity, setQuantity] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const SIZE_OPTIONS: { value: PrintSize; label: string; dimensions: string; price: number }[] = [
        { value: 'A4', label: 'A4 Size', dimensions: '8.3" × 11.7"', price: PRICE_PER_SIZE.A4 },
        { value: 'A3', label: 'A3 Size', dimensions: '11.7" × 16.5"', price: PRICE_PER_SIZE.A3 },
    ];

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('File is too large. Maximum file size is 50MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setCurrentImage(e.target?.result as string);
            setCurrentFileName(file.name);
            setCurrentFileSize(file.size);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleAddToOrder = () => {
        if (!currentImage) return;

        // Dispatch to Redux instead of local state
        dispatch(addOrderItem({
            image: new File([], currentFileName), // Placeholder - we're using imagePreview
            imagePreview: currentImage,
            fileName: currentFileName,
            fileSize: currentFileSize,
            size: selectedSize,
            quantity: quantity,
        }));

        // Reset form
        setCurrentImage(null);
        setCurrentFileName('');
        setCurrentFileSize(0);
        setSelectedSize('A4');
        setQuantity(1);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setCurrentImage(null);
        setCurrentFileName('');
        setCurrentFileSize(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveItem = (id: string) => {
        dispatch(removeOrderItem(id));
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        dispatch(updateOrderItem({
            id,
            updates: { quantity: newQuantity }
        }));
    };

    const getTotalAmount = () => {
        return totalAmount; // Use Redux totalAmount directly
    };

    const getTotalQuantity = () => {
        return orderItems.reduce((total, item) => total + item.quantity, 0);
    };

    const handleSubmitOrder = () => {
        if (orderItems.length === 0) {
            alert('Please add at least one design to your order');
            return;
        }

        const confirmed = confirm(
            `Proceed to checkout with ${orderItems.length} design${orderItems.length > 1 ? 's' : ''} for ${formatPrice(totalAmount)}?`
        );

        if (confirmed) {
            // Navigate to checkout page
            router.push('/checkout');
        }
    };

    const handleClearAll = () => {
        const confirmed = confirm('Are you sure you want to clear all items?');
        if (confirmed) {
            dispatch(clearOrder());
        }
    };

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] relative overflow-hidden mt-5 pt-24 pb-12">
            {/* Animated background */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-[#a60054] rounded-full blur-3xl opacity-20"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
                        Create Your Order
                    </h1>
                    <p className="text-lg text-white/70">
                        Upload designs one at a time and build your custom order
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Section - Upload Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {currentImage ? 'Design Preview' : 'Upload Design'}
                            </h2>

                            {!currentImage ? (
                                /* Upload Area */
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging
                                        ? 'border-[#a60054] bg-[#a60054]/10'
                                        : 'border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                        className="hidden"
                                    />

                                    <motion.div animate={{ scale: isDragging ? 1.1 : 1 }}>
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#a60054] to-[#211f60] rounded-2xl flex items-center justify-center">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
                                        </h3>
                                        <p className="text-white/60 mb-6">
                                            or click to browse from your computer
                                        </p>

                                        <motion.button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Browse Files
                                        </motion.button>

                                        <p className="text-xs text-white/40 mt-4">
                                            Supported: JPG, PNG, GIF, WebP • Max: 50MB
                                        </p>
                                    </motion.div>
                                </div>
                            ) : (
                                /* Image Preview */
                                <div className="space-y-6">
                                    <div className="relative bg-white/5 border-2 border-white/10 rounded-2xl overflow-hidden">
                                        <div className="relative w-full aspect-square">
                                            <Image
                                                src={currentImage}
                                                alt={currentFileName}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>

                                        {/* Remove Button */}
                                        <motion.button
                                            onClick={handleRemoveImage}
                                            className="absolute top-4 right-4 w-10 h-10 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.button>

                                        {/* File Info */}
                                        <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                                            <p className="text-white font-medium text-sm truncate">{currentFileName}</p>
                                            <p className="text-white/60 text-xs mt-1">{formatFileSize(currentFileSize)}</p>
                                        </div>
                                    </div>

                                    {/* Size & Quantity Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Size Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-3">
                                                Print Size
                                            </label>
                                            <div className="space-y-2">
                                                {SIZE_OPTIONS.map((option) => (
                                                    <motion.button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => setSelectedSize(option.value)}
                                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${selectedSize === option.value
                                                            ? 'border-[#a60054] bg-[#a60054]/10'
                                                            : 'border-white/20 bg-white/5 hover:border-white/40'
                                                            }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-white font-semibold">{option.label}</p>
                                                                <p className="text-white/60 text-sm">{option.dimensions}</p>
                                                                <p className="text-[#a60054] font-bold text-sm mt-1">
                                                                    LKR {option.price} per print
                                                                </p>
                                                            </div>
                                                            {selectedSize === option.value && (
                                                                <div className="w-6 h-6 bg-[#a60054] rounded-full flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quantity Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-3">
                                                Print Quantity
                                            </label>
                                            <div className="bg-white/5 border-2 border-white/20 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-white/70 text-sm">Copies</span>
                                                    <span className="text-2xl font-bold text-white">{quantity}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="100"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#a60054]"
                                                />
                                                <div className="flex justify-between mt-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantity(Math.min(100, quantity + 1))}
                                                        className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Price Preview */}
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/70 text-sm">Cost for this item:</span>
                                                        <span className="text-white font-bold">
                                                            {formatPrice(PRICE_PER_SIZE[selectedSize] * quantity)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add to Order Button */}
                                    <motion.button
                                        onClick={handleAddToOrder}
                                        className="w-full py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Add to Order
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>

                        {/* Order Items List */}
                        {orderItems.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        Order Items ({orderItems.length})
                                    </h2>
                                    <button
                                        onClick={handleClearAll}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-sm font-medium transition-all"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {orderItems.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4"
                                            >
                                                {/* Image Thumbnail */}
                                                <div className="relative w-24 h-24 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={item.imagePreview}
                                                        alt={item.fileName}
                                                        fill
                                                        className="object-cover"
                                                        sizes="96px"
                                                    />
                                                </div>

                                                {/* Item Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium text-sm truncate">{item.fileName}</p>
                                                            <p className="text-white/60 text-xs">{formatFileSize(item.fileSize)}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-400 transition-all flex-shrink-0"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-white/60 block">Size</span>
                                                            <span className="text-white font-semibold">{item.size}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-white/60 block mb-1">Qty</span>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-all"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-all"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-white/60 block">Total</span>
                                                            <span className="text-[#a60054] font-bold">{formatPrice(item.totalPrice)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Section - Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-white/70">
                                    <span>Total Designs:</span>
                                    <span className="text-white font-semibold">{orderItems.length}</span>
                                </div>
                                <div className="flex justify-between text-white/70">
                                    <span>Total Prints:</span>
                                    <span className="text-white font-semibold">{getTotalQuantity()}</span>
                                </div>

                                {orderItems.length > 0 && (
                                    <div className="border-t border-white/10 pt-4">
                                        <h3 className="text-white font-semibold mb-3">Size Breakdown:</h3>
                                        {SIZE_OPTIONS.map((size) => {
                                            const sizeItems = orderItems.filter(item => item.size === size.value);
                                            const count = sizeItems.length;
                                            const qty = sizeItems.reduce((sum, item) => sum + item.quantity, 0);
                                            const subtotal = sizeItems.reduce((sum, item) => sum + item.totalPrice, 0);

                                            if (count === 0) return null;

                                            return (
                                                <div key={size.value} className="mb-3 pb-3 border-b border-white/5 last:border-0">
                                                    <div className="flex justify-between text-sm text-white/70 mb-1">
                                                        <span>{size.label}:</span>
                                                        <span className="text-white">{count} design{count > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-white/60">
                                                        <span>{qty} prints × LKR {size.price}</span>
                                                        <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Total Amount */}
                                <div className="border-t-2 border-[#a60054]/30 pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-white">Total:</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                                            {formatPrice(getTotalAmount())}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                onClick={handleSubmitOrder}
                                disabled={orderItems.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                whileHover={orderItems.length > 0 ? { scale: 1.02 } : {}}
                                whileTap={orderItems.length > 0 ? { scale: 0.98 } : {}}
                            >
                                {orderItems.length === 0 ? 'Add Designs to Continue' : `Submit Order • ${formatPrice(getTotalAmount())}`}
                            </motion.button>

                            {orderItems.length > 0 && (
                                <p className="text-xs text-white/60 text-center mt-4">
                                    Review your order before submitting. We&apos;ll contact you with payment details.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}