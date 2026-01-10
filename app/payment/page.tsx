'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/store/store';
import { setPaymentInfo, confirmOrder } from '@/store/slices/checkoutSlice';
import { clearOrder } from '@/store/slices/orderSlice';
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert } from '@/lib/utils/sweetAlert';
import { useOrderFiles } from '@/lib/contexts/OrderFilesContext';

export default function PaymentPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getFile, getAllFiles, clearAllFiles } = useOrderFiles();

  const { items: orderItems, totalAmount } = useSelector((state: RootState) => state.order);
  const { deliveryInfo, isDeliveryInfoComplete } = useSelector((state: RootState) => state.checkout);
  const { token } = useSelector((state: RootState) => state.auth);

  const [receiptImage, setReceiptImage] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptFileSize, setReceiptFileSize] = useState<number>(0);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isDeliveryInfoComplete || orderItems.length === 0) {
    router.push('/checkout');
    return null;
  }

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

  const getTotalQuantity = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      showErrorAlert('Please select an image file', 'Invalid File Type');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorAlert('File is too large. Maximum file size is 10MB', 'File Too Large');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptImage(e.target?.result as string);
      setReceiptFileName(file.name);
      setReceiptFileSize(file.size);
      setReceiptFile(file);
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

  const handleRemoveReceipt = () => {
    setReceiptImage('');
    setReceiptFileName('');
    setReceiptFileSize(0);
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmPayment = async () => {
    if (!receiptFile || !receiptImage) {
      showErrorAlert('Please upload your payment receipt', 'Receipt Required');
      return;
    }

    showLoadingAlert('Submitting your order...');

    try {
      const formData = new FormData();

      // Add delivery info
      formData.append('deliveryInfo.fullName', deliveryInfo.fullName);
      formData.append('deliveryInfo.address', deliveryInfo.address);
      formData.append('deliveryInfo.contact1', deliveryInfo.contact1);
      if (deliveryInfo.contact2) {
        formData.append('deliveryInfo.contact2', deliveryInfo.contact2);
      }

      // Add payment receipt
      formData.append('paymentReceipt', receiptFile);

      // Add order items metadata
      const itemsData = orderItems.map(item => ({
        fileName: item.fileName,
        fileSize: item.fileSize,
        fileType: item.fileType, // ✅ ADD THIS LINE
        size: item.size,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.totalPrice,
      }));

      formData.append('items', JSON.stringify(itemsData));

      // ✅ Add actual image files from context
      orderItems.forEach((item, index) => {
        const file = getFile(item.id);
        if (file) {
          formData.append(`itemImage_${index}`, file);
        } else {
          throw new Error(`Missing file for item: ${item.fileName}`);
        }
      });

      const response = await fetch('/api/order/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      closeAlert();

      if (response.ok && data.success) {
        dispatch(clearOrder());
        dispatch(confirmOrder());
        dispatch(setPaymentInfo({
          receiptImage: receiptFile,
          receiptPreview: receiptImage,
          receiptFileName: receiptFileName,
          receiptFileSize: receiptFileSize,
          paymentDate: new Date().toISOString(),
        }));

        // ✅ Clear files after successful submission
        clearAllFiles();

        await showSuccessAlert(
          'Your order has been submitted successfully!',
          'Order Submitted!'
        );

        router.push('/confirm-order');
      } else {
        showErrorAlert(data.message || 'Failed to submit order', 'Submission Failed');
      }
    } catch (error) {
      closeAlert();
      console.error('Order submission error:', error);
      showErrorAlert(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'Submission Error'
      );
    }
  };

  const handleBack = () => {
    router.push('/checkout');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccessAlert('Copied to clipboard!', 'Copied');
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] relative overflow-hidden mt-6 pt-24 pb-12">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            Payment
          </h1>
          <p className="text-lg text-white/70">
            Upload your payment receipt to complete your order
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {/* Step 1 - Completed */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full text-white font-bold">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-1 sm:ml-2 text-white font-semibold text-xs sm:text-base hidden xs:inline">Delivery</span>
              <span className="ml-1 sm:ml-2 text-white font-semibold text-xs sm:text-base xs:hidden">Info</span>
            </div>

            <div className="w-8 sm:w-16 h-0.5 bg-green-500"></div>

            {/* Step 2 - Active */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#a60054] to-[#211f60] rounded-full text-white font-bold text-sm sm:text-base">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-white font-semibold text-xs sm:text-base">Payment</span>
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
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Bank Transfer Details</h2>
                <motion.button
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  className="px-4 py-2 bg-[#a60054]/20 border border-[#a60054]/40 text-[#a60054] rounded-lg text-sm font-medium transition-all hover:bg-[#a60054]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showBankDetails ? 'Hide Details' : 'Show Details'}
                </motion.button>
              </div>

              <AnimatePresence>
                {showBankDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-r from-[#a60054]/10 to-[#211f60]/10 border border-white/20 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white/70 text-sm">Bank Name</p>
                            <p className="text-white font-semibold">Commercial Bank</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('Commercial Bank')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/10 pt-3">
                          <div>
                            <p className="text-white/70 text-sm">Account Number</p>
                            <p className="text-white font-mono font-semibold">1234567890</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('1234567890')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/10 pt-3">
                          <div>
                            <p className="text-white/70 text-sm">Account Name</p>
                            <p className="text-white font-semibold">Holixia DTF Printing</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard('Holixia DTF Printing')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex justify-between items-center border-t-2 border-[#a60054]/30 pt-3 mt-3">
                          <div>
                            <p className="text-white/70 text-sm">Amount to Transfer</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                              {formatPrice(totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-yellow-400 font-semibold text-sm">Important</p>
                          <p className="text-yellow-300/70 text-xs mt-1">
                            Please transfer the exact amount and upload the receipt below.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Upload Payment Receipt</h2>

              {!receiptImage ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {isDragging ? 'Drop receipt here' : 'Upload Payment Receipt'}
                    </h3>
                    <p className="text-white/60 mb-6">
                      Take a photo or screenshot of your bank transfer receipt
                    </p>

                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose File
                    </motion.button>

                    <p className="text-xs text-white/40 mt-4">
                      Supported: JPG, PNG • Max: 10MB
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-white/5 border-2 border-green-500/30 rounded-2xl overflow-hidden">
                    <div className="relative w-full aspect-[4/3]">
                      <Image
                        src={receiptImage}
                        alt={receiptFileName}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    </div>

                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 rounded-lg text-white text-sm font-semibold shadow-lg flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Receipt Uploaded
                    </div>

                    <motion.button
                      onClick={handleRemoveReceipt}
                      className="absolute top-4 right-4 w-10 h-10 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                      <p className="text-white font-medium text-sm truncate">{receiptFileName}</p>
                      <p className="text-white/60 text-xs mt-1">{formatFileSize(receiptFileSize)}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 bg-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                type="button"
                onClick={handleConfirmPayment}
                disabled={!receiptImage}
                className="flex-1 py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={receiptImage ? { scale: 1.02 } : {}}
                whileTap={receiptImage ? { scale: 0.98 } : {}}
              >
                Confirm Order
              </motion.button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Order Summary</h2>

              <div className="space-y-4 max-h-60 overflow-y-auto">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-white/5 rounded-xl p-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                      {item.fileType === 'pdf' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10">
                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : (
                        <Image
                          src={item.imagePreview}
                          alt={item.fileName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.fileName}</p>
                      <p className="text-white/60 text-xs">{item.size} × {item.quantity}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${item.fileType === 'pdf'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        {item.fileType.toUpperCase()}
                      </span>
                      <p className="text-[#a60054] text-sm font-bold mt-1">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="flex justify-between text-white/70">
                  <span>Total Designs:</span>
                  <span className="text-white font-semibold">{orderItems.length}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Total Prints:</span>
                  <span className="text-white font-semibold">{getTotalQuantity()}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#a60054]/10 to-[#211f60]/10 border border-[#a60054]/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total Amount:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}