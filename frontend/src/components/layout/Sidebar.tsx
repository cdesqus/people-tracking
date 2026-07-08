import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Building,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
  UserCheck,
  FileText,
  ShieldAlert,
  ChevronLeft,
  MoreHorizontal,
  X,
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
  const { sidebarOpen, toggle } = useSidebar();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

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
      icon: Building,
      label: 'Branches',
      path: '/branches',
      id: 'branches',
      roles: ['admin', 'manager'],
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

  const mobilePrimaryItems = useMemo(() => {
    const priority = ['dashboard', 'cameras', 'alerts', 'visitors', 'employees', 'reports'];
    const picked: MenuItem[] = [];

    for (const id of priority) {
      const item = menuItems.find((menuItem) => menuItem.id === id);
      if (item && !picked.some((pickedItem) => pickedItem.id === item.id)) {
        picked.push(item);
      }
      if (picked.length >= 4) break;
    }

    for (const item of menuItems) {
      if (!picked.some((pickedItem) => pickedItem.id === item.id)) {
        picked.push(item);
      }
      if (picked.length >= 4) break;
    }

    return picked;
  }, [menuItems]);

  const mobileMoreItems = useMemo(
    () =>
      menuItems.filter(
        (item) => !mobilePrimaryItems.some((primaryItem) => primaryItem.id === item.id)
      ),
    [menuItems, mobilePrimaryItems]
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white text-slate-800 shadow-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Toggle Button */}
        <div 
          onClick={toggle}
          className="flex-shrink-0 px-3 py-3 border-b border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors"
          title={sidebarOpen ? 'Minimize' : 'Expand'}
        >
          <ChevronLeft className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
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
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
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
        <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200">
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

      {/* Mobile More Sheet */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMoreOpen(false)}
          />
          <div className="absolute left-0 right-0 bottom-20 bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-900">More Menu</p>
                <p className="text-xs text-slate-500">Analytics, reports, settings, and admin tools</p>
              </div>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                aria-label="Close more menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto pb-2">
              {mobileMoreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-all ${
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                  </Link>
                );
              })}
              {mobileMoreItems.length === 0 && (
                <div className="col-span-2 text-center text-sm text-slate-500 py-6">
                  No additional menu items
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex lg:hidden justify-around items-center h-20 z-40 shadow-xl">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileMoreOpen(false)}
              className={`flex flex-col items-center gap-1 px-4 py-3 flex-1 transition-all relative ${
                active
                  ? 'text-blue-500'
                  : 'text-slate-500 hover:text-slate-600'
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
        <button
          type="button"
          onClick={() => setMobileMoreOpen((open) => !open)}
          className={`flex flex-col items-center gap-1 px-4 py-3 flex-1 transition-all relative ${
            mobileMoreOpen ? 'text-blue-500' : 'text-slate-500 hover:text-slate-600'
          }`}
          title="More"
        >
          <MoreHorizontal size={24} />
          <span className="text-xs font-medium text-center truncate">More</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
