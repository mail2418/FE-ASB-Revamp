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

// Mock user data - in production this would come from database
const mockUsers = [
  {
    id: "0",
    username: 'superadmin',
    password: 'SuperAdminPass123!',
    name: 'Super Admin',
    role: 'superadmin' as const,
  },
  {
    id: "1",
    username: 'admin',
    password: 'Admin123!',
    name: 'Samarta Admin',
    role: 'admin' as const,
  },
  {
    id:"2",
    username: 'verif1',
    password: 'Verif123!',
    name: 'Muhammad Ismail 1',
    role: 'verifikator_opd' as const,
  },
  {
    id:"3",
    username: 'verif2',
    password: 'Verif123!',
    name: 'Muhammad Ismail 2',
    role: 'verifikator_bappeda' as const,
  },
  {
    id:"4",
    username: 'verif2',
    password: 'Verif123!',
    name: 'Muhammad Ismail 3',
    role: 'verifikator_bpkad' as const,
  },
  {
    id:"5",
    username: 'pd1',
    password: 'PD12345!',
    name: 'Anggito Anju',
    role: 'perangkat_daerah' as const,
  },
];

// Helper function to validate credentials (replace with actual database check)
async function validateCredentials(
  username: string, 
  password: string
): Promise<{ isValid: boolean; user?: typeof mockUsers[0] }> {
  // TODO: Replace with actual database query
  // Example using bcrypt for password comparison:
  // const user = await db.user.findUnique({ where: { username } });
  // if (!user) return { isValid: false };
  // const isValid = await bcrypt.compare(password, user.passwordHash);
  // return { isValid, user };
  
  // Mock validation for demonstration
  // In production, NEVER hardcode credentials
  const user = mockUsers.find(
    u => u.username === username && u.password === password
  );
  
  return {
    isValid: !!user,
    user,
  };
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

// Helper function to get user by ID
export function getUserById(userId: string): typeof mockUsers[0] | null {
  const user = mockUsers.find(u => u.id === userId);
  return user || null;
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
    
    // Validate credentials
    const { isValid, user } = await validateCredentials(username, password);
    
    if (!isValid || !user) {
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
    
    // Clear rate limit on successful login
    clearRateLimit(identifier);
    
    // Generate authentication token
    const token = generateToken();
    
    // Create response with user data
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Authentication successful',
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
        }
      },
      { status: 200 }
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