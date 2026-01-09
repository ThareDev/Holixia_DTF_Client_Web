import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
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

    // Find user (excluding password)
    const user = await User.findById(auth.userId).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get profile error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}