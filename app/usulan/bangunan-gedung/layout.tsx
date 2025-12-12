'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function UsulanBangunanGedungLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Usulan Bangunan Gedung">
      {children}
    </DashboardLayoutComponent>
  );
}