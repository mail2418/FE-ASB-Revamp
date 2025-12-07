import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Lupa Password | SISBE TulungAgung Dashboard',
  description: 'Request password reset assistance for SISBE TulungAgung Dashboard',
  robots: 'noindex, nofollow',
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Forgot Password Card */}
      <div className="w-full max-w-md relative z-10">
        <ForgotPasswordForm />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Samarta. All rights reserved.</p>
      </footer>
    </main>
  );
}