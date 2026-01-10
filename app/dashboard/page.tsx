'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  size: 'A4' | 'A3';
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  fileType: 'image' | 'pdf';
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryInfo: {
    fullName: string;
    address: string;
    contact1: string;
    contact2?: string;
  };
  status: 'pending' | 'payment_verified' | 'processing' | 'delivered' | 'cancelled';
  orderDate: string;
  createdAt: string;
}

const statusConfig = {
  pending: {
    label: 'Payment Verification',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  payment_verified: {
    label: 'Payment Verified',
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    ),
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-500',
    textColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    ),
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    ),
  },
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get token and auth state from Redux
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, page]);

  const fetchOrders = async () => {
    // Don't fetch if not authenticated
    if (!token || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);

      const statusParam = selectedStatus !== 'all' ? `&status=${selectedStatus}` : '';
      const response = await fetch(`/api/order/get-my-order?page=${page}&limit=10${statusParam}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired or invalid - logout and redirect
        dispatch(logout());
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const generateOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    const status = statusConfig[order.status];

    // Create image element
    const logoImg = document.createElement('img');
    logoImg.src = '/img/logo1.png'; // Your logo path in public folder

    logoImg.onload = () => {
      // Header Background
      doc.setFillColor(166, 0, 84);
      doc.rect(0, 0, 210, 45, 'F');

      // Add Logo
      try {
        doc.addImage(logoImg, 'PNG', 15, 8, 30, 30); // x, y, width, height
      } catch (error) {
        console.log('Logo not added');
      }

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Order Invoice', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Order ID: ${order.orderId}`, 105, 30, { align: 'center' });

      // Order Details
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      let yPos = 55;

      doc.text(`Order Date: ${formatDate(order.orderDate)}`, 20, yPos);
      yPos += 7;
      doc.text(`Status: ${status.label}`, 20, yPos);
      yPos += 10;

      // Delivery Information
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery Information', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      yPos += 8;

      doc.text(`Name: ${order.deliveryInfo.fullName}`, 20, yPos);
      yPos += 6;
      doc.text(`Address: ${order.deliveryInfo.address}`, 20, yPos);
      yPos += 6;
      doc.text(`Contact: ${order.deliveryInfo.contact1}`, 20, yPos);
      if (order.deliveryInfo.contact2) {
        yPos += 6;
        doc.text(`Alternate Contact: ${order.deliveryInfo.contact2}`, 20, yPos);
      }
      yPos += 12;

      // Order Items Table
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Items', 20, yPos);
      yPos += 5;

      const tableData = order.items.map((item, idx) => [
        (idx + 1).toString(),
        item.fileName,
        item.size,
        item.quantity.toString(),
        formatPrice(item.pricePerUnit),
        formatPrice(item.totalPrice)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'File Name', 'Size', 'Quantity', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [166, 0, 84] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 60 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 }
        }
      });

      // Total Amount
      interface JsPDFWithAutoTable extends jsPDF {
        lastAutoTable?: {
          finalY: number;
        };
      }

      const finalY = (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? 200;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: ${formatPrice(order.totalAmount)}`, 20, finalY + 10);

      // Footer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your order!', 105, 280, { align: 'center' });

      // Save PDF
      doc.save(`Order_${order.orderId}.pdf`);
    };

    logoImg.onerror = () => {
      console.error('Failed to load logo image');
    };
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalQuantity = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const filterButtons = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'payment_verified', label: 'Verified' },
    { value: 'processing', label: 'Processing' },
    { value: 'delivered', label: 'Delivered' },
  ];

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            My Orders
          </h1>
          <p className="text-lg text-white/70">
            Track and manage your print orders
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 overflow-x-auto pb-2"
        >
          <div className="flex gap-2 min-w-max">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => {
                  setSelectedStatus(button.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${selectedStatus === button.value
                  ? 'bg-gradient-to-r from-[#a60054] to-[#211f60] text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-[#a60054] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <svg className="w-24 h-24 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">No Orders Found</h3>
            <p className="text-white/60 mb-6">
              {selectedStatus === 'all'
                ? "You haven't placed any orders yet"
                : `No ${selectedStatus.replace('_', ' ')} orders found`}
            </p>
            <button
              onClick={() => window.location.href = '/create-order'}
              className="px-6 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              Create Your First Order
            </button>
          </motion.div>
        )}

        {/* Orders List */}
        <AnimatePresence mode="popLayout">
          {!loading && orders.map((order, index) => {
            const status = statusConfig[order.status];
            const isExpanded = expandedOrders.has(order._id);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white/60 text-sm">Order ID:</p>
                      <p className="text-white font-bold font-mono text-sm sm:text-base">{order.orderId}</p>
                    </div>
                    <p className="text-white/50 text-xs sm:text-sm">{formatDate(order.orderDate)}</p>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${status.bgColor} border ${status.borderColor}`}>
                    <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
                    <span className={`${status.textColor} font-semibold text-sm`}>{status.label}</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/60 text-xs mb-1">Items</p>
                    <p className="text-white font-bold text-lg">{order.items.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/60 text-xs mb-1">Prints</p>
                    <p className="text-white font-bold text-lg">{getTotalQuantity(order.items)}</p>
                  </div>
                  <div className="col-span-2 bg-gradient-to-r from-[#a60054]/10 to-[#211f60]/10 rounded-xl p-3 border border-[#a60054]/20">
                    <p className="text-white/60 text-xs mb-1">Total Amount</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Delivery Info Preview */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{order.deliveryInfo.fullName}</p>
                      <p className="text-white/60 text-xs truncate">{order.deliveryInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleOrderExpansion(order._id)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>View Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => generateOrderPDF(order)}
                    className="px-4 py-2 bg-gradient-to-r from-[#a60054] to-[#211f60] hover:opacity-90 border border-[#a60054]/20 rounded-xl text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>PDF</span>
                  </button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                        {/* Full Delivery Info */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Delivery Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-white/60">Name</p>
                              <p className="text-white">{order.deliveryInfo.fullName}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Address</p>
                              <p className="text-white">{order.deliveryInfo.address}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-white/60">Contact 1</p>
                                <p className="text-white">{order.deliveryInfo.contact1}</p>
                              </div>
                              {order.deliveryInfo.contact2 && (
                                <div>
                                  <p className="text-white/60">Contact 2</p>
                                  <p className="text-white">{order.deliveryInfo.contact2}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Order Items ({order.items.length})
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                                <div className="relative w-16 h-16 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                                  {item.fileType === 'pdf' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/20">
                                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.fileName}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{item.fileName}</p>
                                  <p className="text-white/60 text-xs">{item.size} × {item.quantity} prints</p>
                                  <p className="text-[#a60054] text-sm font-bold mt-1">{formatPrice(item.totalPrice)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl text-white font-medium transition-all"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${page === pageNum
                    ? 'bg-gradient-to-r from-[#a60054] to-[#211f60] text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl text-white font-medium transition-all"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}