'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/store/store';
import { confirmOrder, resetCheckout } from '@/store/slices/checkoutSlice';
import { clearOrder } from '@/store/slices/orderSlice';

export default function ConfirmationPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [showFullSummary, setShowFullSummary] = useState(false);
  
  // Get data from Redux
  const { items: orderItems, totalAmount } = useSelector((state: RootState) => state.order);
  const { 
    deliveryInfo, 
    paymentInfo,
    orderId,
    orderDate,
    isDeliveryInfoComplete,
    isPaymentInfoComplete 
  } = useSelector((state: RootState) => state.checkout);

  // Redirect if order is not complete
  useEffect(() => {
    if (!isDeliveryInfoComplete || !isPaymentInfoComplete || orderItems.length === 0) {
      router.push('/checkout');
      return;
    }

    // Generate order ID and date if not already done
    if (!orderId) {
      dispatch(confirmOrder());
    }
  }, [isDeliveryInfoComplete, isPaymentInfoComplete, orderItems, orderId, dispatch, router]);

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

  const formatOrderDate = () => {
    if (!orderDate) return new Date().toLocaleDateString();
    
    return new Date(orderDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNewOrder = () => {
    // Clear all order and checkout data
    dispatch(clearOrder());
    dispatch(resetCheckout());
    router.push('/create-order');
  };

  const handleViewDashboard = () => {
    // Clear all order and checkout data
    dispatch(clearOrder());
    dispatch(resetCheckout());
    router.push('/dashboard');
  };

  if (!isDeliveryInfoComplete || !isPaymentInfoComplete) {
    return null;
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] relative overflow-hidden mt-10 pt-24 pb-12">
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2 
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.6, ease: "easeInOut" }}
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
            
            {/* Ripple Effect */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-green-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            Order Confirmed!
          </h1>
          <p className="text-lg text-white/70 mb-2">
            Thank you for your order. We've received your payment receipt.
          </p>
          <p className="text-white/60">
            We'll verify your payment and start processing your order shortly.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 mb-6"
        >
          {/* Order ID and Date */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <p className="text-white/60 text-sm mb-1">Order ID</p>
              <p className="text-white text-xl font-bold font-mono">{orderId || 'Generating...'}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white/60 text-sm mb-1">Order Date</p>
              <p className="text-white font-semibold">{formatOrderDate()}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Status
            </h3>
            <div className="space-y-4">
              {/* Step 1 - Complete */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Order Placed</p>
                  <p className="text-white/60 text-sm">Your order has been received</p>
                </div>
              </div>

              {/* Step 2 - In Progress */}
              <div className="flex items-start gap-4 pl-5 border-l-2 border-white/20">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Payment Verification</p>
                  <p className="text-white/60 text-sm">We're verifying your payment receipt</p>
                </div>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex items-start gap-4 pl-5 border-l-2 border-white/20">
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white/60 font-semibold">Processing</p>
                  <p className="text-white/40 text-sm">Your designs will be printed</p>
                </div>
              </div>

              {/* Step 4 - Pending */}
              <div className="flex items-start gap-4 pl-5">
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white/60 font-semibold">Delivery</p>
                  <p className="text-white/40 text-sm">Est. 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Delivery Details
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-white/60">Name</p>
                <p className="text-white">{deliveryInfo.fullName}</p>
              </div>
              <div>
                <p className="text-white/60">Address</p>
                <p className="text-white">{deliveryInfo.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-white/60">Contact 1</p>
                  <p className="text-white">{deliveryInfo.contact1}</p>
                </div>
                {deliveryInfo.contact2 && (
                  <div>
                    <p className="text-white/60">Contact 2</p>
                    <p className="text-white">{deliveryInfo.contact2}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Order Items ({orderItems.length})
              </h3>
              <button
                onClick={() => setShowFullSummary(!showFullSummary)}
                className="text-[#a60054] text-sm font-medium hover:text-[#a60054]/80 transition-colors"
              >
                {showFullSummary ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showFullSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 mb-4"
              >
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
                      <p className="text-white/60 text-xs">{item.size} × {item.quantity} prints</p>
                      <p className="text-[#a60054] text-sm font-bold mt-1">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Summary Totals */}
            <div className="bg-gradient-to-r from-[#a60054]/10 to-[#211f60]/10 border border-[#a60054]/20 rounded-xl p-4">
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Total Designs:</span>
                  <span className="text-white font-semibold">{orderItems.length}</span>
                </div>
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Total Prints:</span>
                  <span className="text-white font-semibold">{getTotalQuantity()}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#a60054]/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total Amount:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-blue-400 font-semibold mb-2">What happens next?</p>
              <ul className="text-blue-300/70 text-sm space-y-1">
                <li>• We'll verify your payment within 1-2 hours</li>
                <li>• Once verified, we'll start printing your designs</li>
                <li>• You'll receive a confirmation call before delivery</li>
                <li>• Expected delivery: 3-5 business days</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            onClick={() => window.print()}
            className="flex-1 py-4 bg-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Order Details
          </motion.button>
          <motion.button
            onClick={handleNewOrder}
            className="flex-1 py-4 bg-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Place New Order
          </motion.button>
          <motion.button
            onClick={handleViewDashboard}
            className="flex-1 py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}