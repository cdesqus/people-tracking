import React from 'react';
import { FiMenu, FiBell, FiSettings, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <FiMenu size={24} />
        </button>

        <h1 className="text-xl font-semibold text-gray-900">CCTV Dashboard</h1>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 relative">
            <FiBell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <FiSettings size={24} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <FiLogOut size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
