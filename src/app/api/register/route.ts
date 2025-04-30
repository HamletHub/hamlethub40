import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { name, email, password, secretKey } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simple protection to prevent unauthorized registrations
    // Update this with a more secure method in production
    if (secretKey !== process.env.REGISTRATION_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user object
    const user = {
      name,
      email,
      // You can comment this out and use the plain password option below for development
      password: await bcrypt.hash(password, 10),
      // For development only:
      // password: password,
      role: 'admin', // Default role for manually created users
      createdAt: new Date()
    };

    // Insert user into database
    const result = await db.collection('users').insertOne(user);

    return NextResponse.json(
      { 
        success: true, 
        message: 'User created successfully',
        userId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
} 