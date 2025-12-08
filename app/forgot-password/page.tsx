import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Lupa Password | SISBE TulungAgung Dashboard',
  description: 'Request password reset assistance for SISBE TulungAgung Dashboard',
  robots: 'noindex, nofollow',
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-asb-app.jpg')" }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Forgot Password Card */}
      <div className="w-full max-w-md relative z-10">
        <ForgotPasswordForm />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80 z-10">
        <p>&copy; {new Date().getFullYear()} Samarta. All rights reserved.</p>
      </footer>
    </main>
  );
}