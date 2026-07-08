import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout: React.FC = () => {
  // Force light UI. The app design is intentionally bright for CCTV operations.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-50 text-gray-900 dark:text-slate-800 transition-colors duration-200 overflow-hidden">
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
    </div>
  );
};

export default Layout;
