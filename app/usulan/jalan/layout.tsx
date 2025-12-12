'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function UsulanJalanLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Usulan Jalan">
      {children}
    </DashboardLayoutComponent>
  );
}