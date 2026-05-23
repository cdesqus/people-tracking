import React from 'react';
import { ExternalLink, Mail, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-gray-300 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              About
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              CCTV Face Recognition System - Enterprise-grade surveillance and
              access control solution.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#docs"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#support"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <HelpCircle size={14} />
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#status"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  System Status
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="mailto:support@cctv.local"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  <Mail size={14} />
                  support@cctv.local
                </a>
              </li>
              <li>
                <a
                  href="#help"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-400">All Systems Online</span>
              </div>
              <div className="text-xs text-gray-500">
                <p>API: <span className="text-green-400">Operational</span></p>
                <p>Database: <span className="text-green-400">Connected</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 py-6 sm:py-8">
          {/* Middle Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Version */}
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-500">
                Version <span className="text-white font-semibold">1.0.0</span>
              </p>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                © {currentYear} CCTV Monitoring System. All rights reserved.
              </p>
            </div>

            {/* Last Updated */}
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-500">
                Last Updated: <span className="text-gray-400">May 22, 2026</span>
              </p>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 pt-6 border-t border-slate-700">
            <div className="flex gap-6 text-xs">
              <a
                href="#privacy"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>

            {/* Social Links / Contact */}
            <div className="text-xs text-gray-500">
              Need help?{' '}
              <a
                href="mailto:support@cctv.local"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 px-4 py-3 text-xs text-gray-500 text-center border-t border-slate-700">
        <p>
          Powered by AWS Rekognition | Enterprise Surveillance Platform
        </p>
      </div>
    </footer>
  );
};

export default Footer;
