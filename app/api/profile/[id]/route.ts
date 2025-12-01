import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/user-service';
import { ProfileUpdateData } from '@/lib/profile-service';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    console.log(params)
    const userId = await params.id;
    // Get user profile
    const user = await userService.getUserById(userId);
    console.log(user)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = params.id;
    const updates: ProfileUpdateData = await request.json();

    // Validate that required fields are not empty if provided
    if (updates.name !== undefined && !updates.name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Update user profile
    const result = await userService.updateUser(userId, updates);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update profile' },
        { status: 400 }
      );
    }

    // Update cookie with new user data
    const response = NextResponse.json({ 
      success: true,
      user: result.user 
    });

    // If the user data exists, update the cookie
    if (result.user) {
      const cookieData = {
        id: result.user.id,
        name: result.user.name,
        username: result.user.username,
        role: result.user.role,
        displayName: result.user.displayName,
        jobPosition: result.user.jobPosition,
        avatar: result.user.avatar,
      };

      response.cookies.set('userData', JSON.stringify(cookieData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
