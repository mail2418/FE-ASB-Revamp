import React from 'react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  badge?: string;
}

export function ChartContainer({
  children,
  title,
  subtitle,
  className,
  badge,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border border-gray-200 p-4',
        className
      )}
    >
      {badge && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs font-bold">
            {badge}
          </span>
        </div>
      )}
      
      {title && (
        <div className="mb-2">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="w-full">{children}</div>
    </div>
  );
}

interface ChartGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartGrid({ children, className }: ChartGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}