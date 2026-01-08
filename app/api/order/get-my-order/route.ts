import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import { authenticateToken } from '@/lib/middlewares/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query
    const query: Record<string, unknown> = { userId: auth.userId };
    if (status) {
      query.status = status;
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