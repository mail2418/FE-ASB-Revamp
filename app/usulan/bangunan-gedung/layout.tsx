'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building2, 
  Route,
  Droplets,
  Menu,
  X,
  ChevronDown,
  User,
  Calendar,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: 'Usulan Bangunan Gedung',
    href: '/usulan/bangunan-gedung',
    icon: Building2,
    current: false,
  },
  {
    name: 'Usulan Jalan',
    href: '/usulan/jalan',
    icon: Route,
    current: false,
  },
  {
    name: 'Usulan Saluran',
    href: '/404',
    icon: Droplets,
    current: false,
  },
];

export default function DashboardLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userData, setUserData] = React.useState<{id: string; name: string; username: string; role: string} | null>(null);

  // Get user data from cookie
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));
      
      if (userDataCookie) {
        const parsed = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        setUserRole(parsed.role);
        console.log(`${decodeURIComponent(userDataCookie.split('=')[1])}`);
        setUserData(parsed);
      }
    }
  }, []);

  // Get current date
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', {
        method: 'DELETE',
      });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('rememberedUsername');
      }
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear localStorage even on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('rememberedUsername');
      }
      
      // Still redirect on error
      window.location.href = '/';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed positioning for both mobile and desktop */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-linear-to-b from-orange-500 to-orange-600 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          // On large screens: collapsed by default, expanded on hover
          'lg:translate-x-0',
          isHovered ? 'lg:w-64' : 'lg:w-16'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between px-4 bg-white/10">
            <h1 className={cn(
              "text-xl font-bold text-white transition-opacity duration-300",
              isHovered ? "opacity-100" : "lg:opacity-0"
            )}>
              SISBE
            </h1>
            <button
              type="button"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-white' : 'text-white/80',
                      isHovered ? 'mr-3' : 'lg:mr-0'
                    )}
                    aria-hidden="true"
                  />
                  <span className={cn(
                    "transition-all duration-300",
                    isHovered ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            
            {/* Admin Menu - Only visible for admin role */}
            {userRole === 'admin' && (
              <Link
                href="/admin"
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Shield
                  className={cn(
                    'h-5 w-5 shrink-0',
                    pathname.startsWith('/admin') ? 'text-white' : 'text-white/80',
                    isHovered ? 'mr-3' : 'lg:mr-0'
                  )}
                  aria-hidden="true"
                />
                <span className={cn(
                  "transition-all duration-300",
                  isHovered ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}>
                  Admin
                </span>
              </Link>
            )}

            {/* Super Admin Menu - Only visible for superadmin role */}
            {userRole === 'superadmin' && (
              <Link
                href="/superadmin"
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  pathname.startsWith('/superadmin')
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Shield
                  className={cn(
                    'h-5 w-5 shrink-0',
                    pathname.startsWith('/superadmin') ? 'text-white' : 'text-white/80',
                    isHovered ? 'mr-3' : 'lg:mr-0'
                  )}
                  aria-hidden="true"
                />
                <span className={cn(
                  "transition-all duration-300",
                  isHovered ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}>
                  Super Admin
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="relative z-30 bg-white border-b border-gray-200 shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden text-gray-500 hover:text-gray-600"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Page title */}
              <div className="flex-1 px-4 lg:px-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Usulan Bangunan Gedung
                </h2>
              </div>

              {/* Date and User menu */}
              <div className="flex items-center gap-4">
                {/* Date display */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Data terakhir diperbarui: {currentDate}</span>
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">
                        {userData?.name || 'Loading...'}
                      </div>
                      <div className="text-xs text-gray-500">{userData?.role || ''}</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        href={userData?.id ? `/profile/${userData.id}` : '#'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </a>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with scroll */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}