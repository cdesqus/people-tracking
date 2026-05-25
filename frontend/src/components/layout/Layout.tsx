import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppSelector } from '@store/store';

const Layout: React.FC = () => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const theme = useAppSelector((state) => state.ui.theme);

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle body scroll
  useEffect(() => {
    // Prevent body scroll on mobile when sidebar is open
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        document.body.style.overflow = sidebarOpen ? 'hidden' : 'auto';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop only */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0" id="main-content">
          <div className="min-h-full flex flex-col">
            {/* Page Content */}
            <div className="flex-1 pb-16">
              <Outlet />
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Overlay - Show when sidebar is open on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" />
      )}
    </div>
  );
};

export default Layout;
