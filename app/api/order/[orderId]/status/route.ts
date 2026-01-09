import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import { authenticateToken } from '@/lib/middlewares/auth';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const auth = authenticateToken(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized. Please login.' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Await params
        const { orderId } = await context.params;

        const { status } = await request.json();

        // Validate status
        const validStatuses = ['pending', 'payment_verified', 'processing', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Find and update order
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Order status updated successfully',
                data: { order },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update order status error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update order status' },
            { status: 500 }
        );
    }
}