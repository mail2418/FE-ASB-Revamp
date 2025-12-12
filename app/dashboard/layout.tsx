'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Dashboard Utama">
      {children}
    </DashboardLayoutComponent>
  );
}