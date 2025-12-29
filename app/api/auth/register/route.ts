import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface ValidationError {
  errors: Record<string, { message: string }>;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { fullName, email, contactNumber, password } = body;

    // Validation
    if (!fullName || !email || !contactNumber || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email already registered' 
        },
        { status: 409 }
      );
    }

    // Check if contact number already exists
    const existingContact = await User.findOne({ contactNumber });
    if (existingContact) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Contact number already registered' 
        },
        { status: 409 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 8 characters' 
        },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      contactNumber,
      password,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      contactNumber: user.contactNumber,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          user: userData,
          token,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      const messages = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: messages.join(', ') 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}