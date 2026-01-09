'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Image from 'next/image';
import { showErrorAlert, showLoadingAlert, closeAlert, showSuccessAlert } from '@/lib/utils/sweetAlert';
import { saveAs } from 'file-saver';

interface OrderItem {
    imageUrl: string;
    fileName: string;
    fileSize: number;
    size: 'A4' | 'A3';
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
}

interface Order {
    _id: string;
    orderId: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryInfo: {
        fullName: string;
        address: string;
        contact1: string;
        contact2: string;
    };
    paymentInfo: {
        receiptUrl: string;
        receiptFileName: string;
        receiptFileSize: number;
        paymentDate: string;
    };
    status: 'pending' | 'payment_verified' | 'processing' | 'delivered' | 'cancelled';
    orderDate: string;
    createdAt: string;
    updatedAt: string;
}

export default function ManageOrdersPage() {
    const { token } = useSelector((state: RootState) => state.auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [createdAtDate, setCreatedAtDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDownloadOrderImages = async (order: Order) => {
        showLoadingAlert('Preparing download...');

        try {
            const response = await fetch('/api/order/download-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId: order.orderId
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to download images';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();

            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            saveAs(blob, `${order.orderId}.zip`);

            closeAlert();
            await showSuccessAlert(`Downloaded ${order.items.length} image(s) successfully`, 'Success');
        } catch (error) {
            closeAlert();
            console.error('Download error:', error);
            showErrorAlert(
                error instanceof Error ? error.message : 'Failed to download images',
                'Error'
            );
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);
            if (createdAtDate) params.append('createdAtDate', createdAtDate);

            const response = await fetch(`/api/order?${params.toString()}`, {
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setOrders(data.data.orders);
                setTotalPages(data.data.pagination.totalPages);
            } else {
                showErrorAlert(data.message || 'Failed to fetch orders', 'Error');
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            showErrorAlert('Failed to fetch orders', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        showLoadingAlert('Updating order status...');

        try {
            const response = await fetch(`/api/order/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            closeAlert();

            if (response.ok && data.success) {
                await showSuccessAlert('Order status updated successfully', 'Success');
                fetchOrders();
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
                }
            } else {
                showErrorAlert(data.message || 'Failed to update status', 'Error');
            }
        } catch (error) {
            closeAlert();
            console.error('Update status error:', error);
            showErrorAlert('Failed to update status', 'Error');
        }
    };

    const handleQuickStatusUpdate = async (orderId: string, currentStatus: string, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value;
        
        if (newStatus === currentStatus) return;

        showLoadingAlert('Updating order status...');

        try {
            const response = await fetch(`/api/order/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            closeAlert();

            if (response.ok && data.success) {
                await showSuccessAlert('Order status updated successfully', 'Success');
                fetchOrders();
            } else {
                showErrorAlert(data.message || 'Failed to update status', 'Error');
                event.target.value = currentStatus;
            }
        } catch (error) {
            closeAlert();
            console.error('Update status error:', error);
            showErrorAlert('Failed to update status', 'Error');
            event.target.value = currentStatus;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, createdAtDate]);

    const handleSearch = () => {
        setPage(1);
        fetchOrders();
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCreatedAtDate('');
        setPage(1);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'payment_verified':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'processing':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'delivered':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-white/20 text-white border-white/30';
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Manage Orders</h1>
                <p className="text-white/70">View and manage all customer orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Search
                            <span
                                className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs bg-white/20 rounded-full cursor-help"
                                title="Search by Order ID, Customer Name, or Contact Number"
                            >
                                ?
                            </span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by Order ID, Name, or Contact..."
                                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054]"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                                title="Search"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#a60054] [&>option]:bg-[#211f60] [&>option]:text-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="payment_verified">Payment Verified</option>
                            <option value="processing">Processing</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Created At Date */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Created Date
                        </label>
                        <input
                            type="date"
                            value={createdAtDate}
                            onChange={(e) => setCreatedAtDate(e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#a60054]"
                        />
                    </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                    >
                        Reset All Filters
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-[#a60054] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/60 text-lg">No orders found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Order ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Items</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-white/5 transition-all">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-mono text-sm">{order.orderId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-white font-medium">{order.deliveryInfo.fullName}</p>
                                                    <p className="text-white/60 text-xs">{order.deliveryInfo.contact1}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white">{order.items.length} item(s)</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white font-semibold">{formatPrice(order.totalAmount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleQuickStatusUpdate(order._id, order.status, e)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)} bg-transparent cursor-pointer hover:opacity-80 transition-all`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <option value="pending" className="bg-[#211f60] text-white">PENDING</option>
                                                    <option value="payment_verified" className="bg-[#211f60] text-white">PAYMENT VERIFIED</option>
                                                    <option value="processing" className="bg-[#211f60] text-white">PROCESSING</option>
                                                    <option value="delivered" className="bg-[#211f60] text-white">DELIVERED</option>
                                                    <option value="cancelled" className="bg-[#211f60] text-white">CANCELLED</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white/70 text-sm">{formatDate(order.orderDate)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-4 py-2 bg-[#a60054]/20 border border-[#a60054]/40 text-[#a60054] rounded-lg text-sm font-medium hover:bg-[#a60054]/30 transition-all"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadOrderImages(order)}
                                                        className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all flex items-center gap-2"
                                                        title="Download all images"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-white">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                <p className="text-white/60 text-sm font-mono">{selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Update */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <label className="block text-sm font-medium text-white/80 mb-3">
                                    Update Status
                                </label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#a60054] [&>option]:bg-[#211f60] [&>option]:text-white"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="payment_verified">Payment Verified</option>
                                    <option value="processing">Processing</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h3 className="text-lg font-bold text-white mb-4">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60 text-sm">Full Name</p>
                                        <p className="text-white font-medium">{selectedOrder.deliveryInfo.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Primary Contact</p>
                                        <p className="text-white font-medium">{selectedOrder.deliveryInfo.contact1}</p>
                                    </div>
                                    {selectedOrder.deliveryInfo.contact2 && (
                                        <div>
                                            <p className="text-white/60 text-sm">Secondary Contact</p>
                                            <p className="text-white font-medium">{selectedOrder.deliveryInfo.contact2}</p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <p className="text-white/60 text-sm">Delivery Address</p>
                                        <p className="text-white font-medium">{selectedOrder.deliveryInfo.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 bg-white/5 rounded-xl p-3">
                                            <div className="relative w-20 h-20 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.fileName}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium text-sm">{item.fileName}</p>
                                                <p className="text-white/60 text-xs">{formatFileSize(item.fileSize)}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs">
                                                    <span className="text-white/70">Size: <span className="text-white font-semibold">{item.size}</span></span>
                                                    <span className="text-white/70">Qty: <span className="text-white font-semibold">{item.quantity}</span></span>
                                                    <span className="text-[#a60054] font-bold">{formatPrice(item.totalPrice)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h3 className="text-lg font-bold text-white mb-4">Payment Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Payment Date</span>
                                        <span className="text-white font-medium">{formatDate(selectedOrder.paymentInfo.paymentDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Receipt File</span>
                                        <span className="text-white font-medium">{selectedOrder.paymentInfo.receiptFileName}</span>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-white/60 text-sm mb-2">Payment Receipt</p>
                                        <div className="relative w-full h-64 bg-white/5 rounded-xl overflow-hidden">
                                            <Image
                                                src={selectedOrder.paymentInfo.receiptUrl}
                                                alt="Payment Receipt"
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                        <a
                                            href={selectedOrder.paymentInfo.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-2 px-4 py-2 bg-[#a60054]/20 border border-[#a60054]/40 text-[#a60054] rounded-lg text-sm font-medium hover:bg-[#a60054]/30 transition-all"
                                        >
                                            View Full Receipt
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-gradient-to-r from-[#a60054]/10 to-[#211f60]/10 border border-[#a60054]/20 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-white">Total Amount:</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-[#a60054] to-[#211f60] bg-clip-text text-transparent">
                                        {formatPrice(selectedOrder.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-white/60">Order Date</p>
                                    <p className="text-white font-medium">{formatDate(selectedOrder.orderDate)}</p>
                                </div>
                                <div>
                                    <p className="text-white/60">Last Updated</p>
                                    <p className="text-white font-medium">{formatDate(selectedOrder.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}