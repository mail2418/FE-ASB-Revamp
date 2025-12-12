'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function UsulanSaluranLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Usulan Saluran">
      {children}
    </DashboardLayoutComponent>
  );
}