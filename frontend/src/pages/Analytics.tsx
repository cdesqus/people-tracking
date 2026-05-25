import React from 'react';
import { Card } from '@components/common';

const Analytics: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-sans">
          Analytics & Trends
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Historical analysis of face detections, alert volumes, and system health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Daily Biometric Detections" subtitle="Volume of matched faces in the last 7 days">
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 p-6">
            <span className="material-symbols-outlined text-4xl text-blue-500 mb-2">bar_chart</span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Daily Detection Chart</p>
            <p className="text-xs text-gray-500 mt-1">Weekly match rate trend data is loading...</p>
          </div>
        </Card>

        <Card title="Security Incident Trends" subtitle="Critical and high severity alert frequency">
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 p-6">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">trending_up</span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Alert Trend Chart</p>
            <p className="text-xs text-gray-500 mt-1">Incident logs timeline loading...</p>
          </div>
        </Card>

        <Card title="Camera Uptime & Performance" subtitle="System availability across all nodes">
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 p-6">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">dns</span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Camera Performance Matrix</p>
            <p className="text-xs text-gray-500 mt-1">Uptime metrics are loading...</p>
          </div>
        </Card>

        <Card title="Frequent Visitors & Access Logs" subtitle="Top matched identity statistics">
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 p-6">
            <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">groups</span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Identity Distribution</p>
            <p className="text-xs text-gray-500 mt-1">Frequency logs database is loading...</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
