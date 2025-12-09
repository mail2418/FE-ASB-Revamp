'use client';

import { useState } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function SignInPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <main className="min-h-screen flex">
      {/* Left Side - Background Photo with Inner Shadow */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background-asb-app.jpg')" }}
        />
        {/* Inner shadow overlay from right edge */}
        <div 
          className="absolute inset-0"
          style={{ 
            boxShadow: 'inset -60px 0 80px -20px rgba(0,0,0,0.4), inset 0 0 100px rgba(0,0,0,0.1)' 
          }}
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          {/* Auth Forms */}
          {showForgotPassword ? (
            <ForgotPasswordForm onBackToSignIn={() => setShowForgotPassword(false)} />
          ) : (
            <SignInForm onForgotPassword={() => setShowForgotPassword(true)} />
          )}

          {/* Footer */}
          <footer className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Samarta
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}