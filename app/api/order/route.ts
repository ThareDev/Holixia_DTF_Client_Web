import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const createdAtDate = searchParams.get('createdAtDate');

        // Build query
        interface QueryFilter {
            status?: string;
            $or?: Array<Record<string, RegExp>>;
            createdAt?: {
                $gte: Date;
                $lte: Date;
            };
        }

        const query: QueryFilter = {};

        // Status filter
        if (status) {
            query.status = status;
        }

        // Search filter (orderId, fullName, contact1)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { orderId: searchRegex },
                { 'deliveryInfo.fullName': searchRegex },
                { 'deliveryInfo.contact1': searchRegex },
            ];
        }

        // Created at date filter (matches the entire day)
        if (createdAtDate) {
            const startOfDay = new Date(createdAtDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(createdAtDate);
            endOfDay.setHours(23, 59, 59, 999);

            query.createdAt = {
                $gte: startOfDay,
                $lte: endOfDay,
            };
        }

        // Get orders with pagination
        const skip = (page - 1) * limit;
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count
        const total = await Order.countDocuments(query);

        return NextResponse.json(
            {
                success: true,
                data: {
                    orders,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}