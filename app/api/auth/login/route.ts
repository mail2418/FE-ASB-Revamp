import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Rate limiting map (in production, use Redis or similar)
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface SignInRequest {
  username: string;
  password: string;
}

// Helper function to check rate limiting
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);
  
  // Reset if lockout period has passed
  if (attempt && now - attempt.timestamp > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier);
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS };
  }
  
  // Check if locked out
  if (attempt && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }
  
  // Update attempts
  const currentCount = attempt ? attempt.count + 1 : 1;
  loginAttempts.set(identifier, { count: currentCount, timestamp: now });
  
  return {
    allowed: currentCount <= MAX_LOGIN_ATTEMPTS,
    remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - currentCount),
  };
}

// Helper function to clear rate limit on successful login
function clearRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Helper function to generate a secure token
function generateToken(): string {
  // In production, use a proper JWT library like jose or jsonwebtoken
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Parse request body
    const body: SignInRequest = await request.json();
    const { username, password } = body;
    // Input validation 
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username and password are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid username format' 
        },
        { status: 400 }
      );
    }
    
    // Check rate limiting
    const identifier = `${clientIp}:${username}`;
    const rateLimit = checkRateLimit(identifier);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Too many login attempts. Please try again later.',
          retryAfter: LOCKOUT_DURATION / 1000 // seconds
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': (LOCKOUT_DURATION / 1000).toString(),
          }
        }
      );
    }
    
    // Forward to external API if configured, otherwise use mock
    const externalApiUrl = process.env.NEXT_PUBLIC_API_URL;
    let user;
    let accessToken: string | undefined;
    
    // Call external API
    try {
      const externalResponse = await fetch(`${externalApiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!externalResponse.ok) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid username or password',
            attemptsRemaining: rateLimit.remaining - 1
          },
          { 
            status: 401,
            headers: {
              'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
            }
          }
        );
      }
      
      const externalData = await externalResponse.json();
      console.log('External API Response:', JSON.stringify(externalData, null, 2));
      
      // Decode JWT to get user info
      if (!externalData.data?.accessToken) {
        throw new Error('No access token in response');
      }

      // Store accessToken to return in response
      accessToken = externalData.data.accessToken;

      // Decode JWT payload (base64 decode the middle section)
      const token = externalData.data.accessToken;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString('utf-8')
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      
      console.log('Decoded JWT Payload:', JSON.stringify(payload, null, 2));
      
      // Map JWT payload to our user format
      user = {
        id: payload.sub || payload.userId || payload.id,
        username: payload.username || username,
        name: payload.name || payload.fullName || username,
        role: payload.roles?.[0] || payload.role || 'guest', // Take first role from roles array
      };
      
      console.log('Mapped User:', JSON.stringify(user, null, 2));
    } catch (error) {
      console.error('External API error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication service unavailable' 
        },
        { status: 503 }
      );
    }
    
    // Clear rate limit on successful login
    clearRateLimit(identifier);
    
    // Generate authentication token
    const token = generateToken();
    
    // Create response with user data and accessToken
    const response = NextResponse.json(
      { 
        status: 200,
        success: true,
        message: 'Authentication successful',
        accessToken: accessToken, // Include accessToken from external API
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        }
      },
    );
    
    // Set secure cookie with authentication token
    const cookieStore = await cookies();
    cookieStore.set('authToken', token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: SESSION_DURATION / 1000, // Cookie expiration in seconds
      path: '/', // Available across the entire site
    });
    
    // Set user data cookie (accessible to client for role checks)
    cookieStore.set('userData', 
      JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      }), 
      {
        httpOnly: false, // Accessible to JavaScript for UI logic
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
      }
    );
    
    // Optional: Set CSRF token
    const csrfToken = generateToken();
    cookieStore.set('csrfToken', csrfToken, {
      httpOnly: false, // Accessible to JavaScript for CSRF protection
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });
    
    // Optional: Log successful login
    console.log(`Successful login: ${username} from ${clientIp} at ${new Date().toISOString()}`);
    
    return response;
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred during authentication. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Sign out endpoint
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear authentication cookies
    cookieStore.delete('authToken');
    cookieStore.delete('userData');
    cookieStore.delete('csrfToken');
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Signed out successfully' 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Sign out error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred during sign out' 
      },
      { status: 500 }
    );
  }
}