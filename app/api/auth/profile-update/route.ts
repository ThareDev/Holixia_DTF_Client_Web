import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { authenticateToken } from '@/lib/middlewares/auth';

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { fullName, contactNumber } = body;

    // Validate inputs
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required' },
        { status: 400 }
      );
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Full name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (fullName.trim().length > 100) {
      return NextResponse.json(
        { success: false, message: 'Full name must not exceed 100 characters' },
        { status: 400 }
      );
    }

    if (!contactNumber) {
      return NextResponse.json(
        { success: false, message: 'Contact number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+947[0-9]{8}$/;
    if (!phoneRegex.test(contactNumber)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid Sri Lankan phone number (+947XXXXXXXX)' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    user.fullName = fullName.trim();
    user.contactNumber = contactNumber;
    await user.save();

    // Return updated user data (excluding password)
    const updatedUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      contactNumber: user.contactNumber,
      userType: user.userType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile update error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}