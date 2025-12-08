import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | ASB Revamp Dashboard',
  description: 'Sign in to access the ASB Revamp Dashboard for managing building proposals',
  robots: 'noindex, nofollow', // Prevent indexing of auth pages
};

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-asb-app.jpg')" }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Sign In Card */}
      <div className="w-full max-w-md relative z-10">
        <SignInForm />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80 z-10">
        <p>&copy; {new Date().getFullYear()} Samarta. All rights reserved.</p>
      </footer>
    </main>
  );
}