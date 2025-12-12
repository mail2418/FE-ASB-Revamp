'use client'
import DashboardLayoutComponent from '@/components/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: LayoutProps) {
  return (
    <DashboardLayoutComponent pageTitle="Profile">
      {children}
    </DashboardLayoutComponent>
  );
}