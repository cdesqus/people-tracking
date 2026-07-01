import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-500 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm">
          © {currentYear} CCTV Monitoring System. All rights reserved.
        </div>
        <div className="flex gap-4 text-sm">
          <a href="#privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <a href="mailto:support@cctv.local" className="hover:text-blue-600 transition-colors">Support</a>
        </div>
        <div className="text-xs">
          Version 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
