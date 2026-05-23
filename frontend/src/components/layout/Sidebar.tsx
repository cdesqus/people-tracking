import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
  UserCheck,
  FileText,
  ShieldAlert,
  LucideIcon,
} from 'lucide-react';
import { useAppSelector } from '@store/store';
import { useSidebar } from '@hooks/useSidebar';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  id: string;
  roles?: string[];
  badge?: number;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen } = useSidebar();
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const isActive = (path: string) => location.pathname === path;

  // Define menu items for all roles
  const allMenuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
      id: 'dashboard',
      roles: ['admin', 'manager', 'operator', 'security', 'receptionist', 'viewer'],
    },
    {
      icon: Camera,
      label: 'Cameras',
      path: '/cameras',
      id: 'cameras',
      roles: ['admin', 'manager', 'operator', 'security'],
    },
    {
      icon: Users,
      label: 'Employees',
      path: '/employees',
      id: 'employees',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      icon: UserCheck,
      label: 'Visitors',
      path: '/visitors',
      id: 'visitors',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      icon: AlertCircle,
      label: 'Alerts',
      path: '/alerts',
      id: 'alerts',
      roles: ['admin', 'manager', 'operator', 'security'],
      badge: 3,
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
      id: 'analytics',
      roles: ['admin', 'manager'],
    },
    {
      icon: FileText,
      label: 'Reports',
      path: '/reports',
      id: 'reports',
      roles: ['admin', 'manager', 'receptionist'],
    },
    {
      icon: ShieldAlert,
      label: 'Security',
      path: '/security',
      id: 'security',
      roles: ['admin'],
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      id: 'settings',
      roles: ['admin'],
    },
  ];

  // Filter menu items based on user role
  const menuItems = useMemo(
    () =>
      allMenuItems.filter(
        (item) => !item.roles || item.roles.includes(userRole || 'viewer')
      ),
    [userRole]
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 text-gray-100 shadow-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 px-4 py-6 border-b border-slate-800 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
              CC
            </div>
            {sidebarOpen && (
              <div className="flex flex-col gap-0">
                <span className="text-xs font-semibold text-gray-300">
                  CCTV
                </span>
                <span className="text-xs text-gray-500">System v1.0</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                  active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon
                  size={22}
                  className="flex-shrink-0 transition-transform group-hover:scale-110"
                />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <span className="absolute right-2 top-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-slate-800">
          {sidebarOpen ? (
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">Version</p>
              <p className="text-xs text-gray-600 font-semibold">1.0.0</p>
              <p className="text-xs text-gray-700 mt-2">All systems operational</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex lg:hidden justify-around items-center h-20 z-40 shadow-xl">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-3 flex-1 transition-all relative ${
                active
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon size={24} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-center truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
