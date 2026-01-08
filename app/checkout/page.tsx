'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/store/store';
import { setDeliveryInfo, nextStep } from '@/store/slices/checkoutSlice';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get order items from Redux
  const { items: orderItems, totalAmount } = useSelector((state: RootState) => state.order);
  const { deliveryInfo } = useSelector((state: RootState) => state.checkout);

  const [formData, setFormData] = useState({
    fullName: deliveryInfo.fullName || '',
    address: deliveryInfo.address || '',
    contact1: deliveryInfo.contact1 || '',
    contact2: deliveryInfo.contact2 || '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    address: '',
    contact1: '',
    contact2: '',
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTotalQuantity = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      address: '',
      contact1: '',
      contact2: '',
    };

    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    if (!formData.contact1.trim()) {
      newErrors.contact1 = 'Primary contact is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.contact1.replace(/\s/g, ''))) {
      newErrors.contact1 = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (formData.contact2 && !/^[0-9]{10}$/.test(formData.contact2.replace(/\s/g, ''))) {
      newErrors.contact2 = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (orderItems.length === 0) {
      alert('Your order is empty. Please add items before checkout.');
      router.push('/create-order');
      return;
    }

    if (validateForm()) {
      // Save delivery info to Redux
      dispatch(setDeliveryInfo(formData));
      // Move to next step
      dispatch(nextStep());
      // Navigate to payment page
      router.push('/payment');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] relative overflow-hidden mt-6 pt-24 pb-12">
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
            Checkout
          </h1>
          <p className="text-lg text-white/70">
            Complete your delivery information
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {/* Step 1 - Active */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#a60054] to-[#211f60] rounded-full text-white font-bold text-sm sm:text-base">
                1
              </div>
              <span className="ml-1 sm:ml-2 text-white font-semibold text-xs sm:text-base hidden xs:inline">Delivery</span>
              <span className="ml-1 sm:ml-2 text-white font-semibold text-xs sm:text-base xs:hidden">Info</span>
            </div>

            <div className="w-8 sm:w-16 h-0.5 bg-white/20"></div>

            {/* Step 2 - Inactive */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 border-2 border-white/20 rounded-full text-white/50 font-bold text-sm sm:text-base">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-white/50 font-semibold text-xs sm:text-base">Payment</span>
            </div>

            <div className="w-8 sm:w-16 h-0.5 bg-white/20"></div>

            {/* Step 3 - Inactive */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/10 border-2 border-white/20 rounded-full text-white/50 font-bold text-sm sm:text-base">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-white/50 font-semibold text-xs sm:text-base hidden xs:inline">Confirmation</span>
              <span className="ml-1 sm:ml-2 text-white/50 font-semibold text-xs sm:text-base xs:hidden">Confirm</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Section - Delivery Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Delivery Information</h2>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all ${errors.fullName ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {errors.fullName}
                    </motion.p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Delivery Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all resize-none ${errors.address ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="Enter your complete delivery address"
                  />
                  {errors.address && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {errors.address}
                    </motion.p>
                  )}
                </div>

                {/* Contact Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Contact 1 */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Primary Contact <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contact1}
                      onChange={(e) => handleInputChange('contact1', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all ${errors.contact1 ? 'border-red-500' : 'border-white/20'
                        }`}
                      placeholder="07X XXX XXXX"
                    />
                    {errors.contact1 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.contact1}
                      </motion.p>
                    )}
                  </div>

                  {/* Contact 2 */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Secondary Contact (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.contact2}
                      onChange={(e) => handleInputChange('contact2', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all ${errors.contact2 ? 'border-red-500' : 'border-white/20'
                        }`}
                      placeholder="07X XXX XXXX"
                    />
                    {errors.contact2 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2"
                      >
                        {errors.contact2}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => router.push('/create-order')}
                    className="flex-1 py-4 bg-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Order
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to Payment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-white/60 mb-4">Your order is empty</p>
                  <button
                    onClick={() => router.push('/create-order')}
                    className="px-4 py-2 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white rounded-lg text-sm font-medium"
                  >
                    Add Items
                  </button>
                </div>
              ) : (
                <>
                  {/* Order Items */}
                  <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-white/5 rounded-xl p-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                          <Image
                            src={item.imagePreview}
                            alt={item.fileName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.fileName}</p>
                          <p className="text-white/60 text-xs">{item.size} × {item.quantity}</p>
                          <p className="text-[#a60054] text-sm font-bold mt-1">{formatPrice(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                    <div className="flex justify-between text-white/70">
                      <span>Total Designs:</span>
                      <span className="text-white font-semibold">{orderItems.length}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Total Prints:</span>
                      <span className="text-white font-semibold">{getTotalQuantity()}</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="bg-gradient-to-r from-[#a60054]/10 to-[#211f60]/10 border border-[#a60054]/20 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total Amount:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Note */}
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-blue-400 font-semibold text-sm">Delivery Information</p>
                        <p className="text-blue-300/70 text-xs mt-1">
                          Please ensure your delivery address and contact details are correct.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}