'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Dashboard Super Admin">
      {children}
    </DashboardLayoutComponent>
  );
}