'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Admin Dashboard">
      {children}
    </DashboardLayoutComponent>
  );
}