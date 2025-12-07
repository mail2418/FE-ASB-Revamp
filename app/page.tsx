import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | ASB Revamp Dashboard',
  description: 'Sign in to access the ASB Revamp Dashboard for managing building proposals',
  robots: 'noindex, nofollow', // Prevent indexing of auth pages
};

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Sign In Card */}
      <div className="w-full max-w-md relative z-10">
        <SignInForm />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Samarta. All rights reserved.</p>
      </footer>
    </main>
  );
}