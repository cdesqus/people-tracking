import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { logout } from '@store/slices/authSlice';
import { useSidebar } from '@hooks/useSidebar';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarOpen, toggle } = useSidebar();
  const user = useAppSelector((state) => state.auth.user);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-600',
      manager: 'bg-blue-600',
      operator: 'bg-green-600',
      security: 'bg-purple-600',
      receptionist: 'bg-orange-600',
      viewer: 'bg-gray-600',
    };
    return colors[role] || 'bg-gray-600';
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-40">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors lg:hidden text-gray-300 hover:text-white"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
                CC
              </div>
              <span className="font-bold text-lg tracking-tight">
                CCTV System
              </span>
            </div>

            {/* Mobile Logo - Show on mobile only */}
            <div className="sm:hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
                CC
              </div>
            </div>
          </div>

          {/* Center: Title */}
          <div className="hidden sm:block flex-1 text-center">
            <h1 className="text-xl font-semibold text-gray-100">
              Face Recognition Dashboard
            </h1>
          </div>

          {/* Right: Icons + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications - Hidden on mobile */}
            <button className="hidden sm:flex p-2 rounded-lg hover:bg-slate-700 transition-colors relative text-gray-300 hover:text-white">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Settings - Hidden on mobile */}
            <button className="hidden sm:flex p-2 rounded-lg hover:bg-slate-700 transition-colors text-gray-300 hover:text-white">
              <Settings size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-gray-300 hover:text-white"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${getRoleColor(
                    user?.role || 'viewer'
                  )} flex items-center justify-center font-bold text-sm flex-shrink-0`}
                >
                  {getInitials(user?.full_name || 'User')}
                </div>
                <div className="hidden sm:flex flex-col items-start gap-0">
                  <span className="text-xs font-medium text-gray-200">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {user?.role || 'viewer'}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 capitalize mt-1">
                      Role: {user?.role || 'viewer'}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                      <User size={16} />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors text-gray-300 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Only show on mobile */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-700 mt-4 pt-4 pb-2 px-2">
            <div className="rounded-lg bg-slate-800 p-3 mb-2">
              <p className="text-xs font-medium text-gray-300">Logged in as:</p>
              <p className="text-sm font-semibold text-white mt-1">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 rounded-md flex items-center gap-2 transition-colors">
              <Bell size={16} />
              <span>Notifications</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 rounded-md flex items-center gap-2 transition-colors">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20 rounded-md flex items-center gap-2 transition-colors font-medium mt-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
