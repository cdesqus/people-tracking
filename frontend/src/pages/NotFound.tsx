import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black text-blue-600 dark:text-blue-500 mb-4 animate-bounce">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The requested section or resource could not be found. Please check the URL or return to the main dashboard.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all inline-block shadow-md hover:shadow-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
