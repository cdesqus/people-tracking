import React from 'react';

const Alerts: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <div className="flex gap-2">
          <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300">
            Filter
          </button>
          <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300">
            Clear All
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-900">Type</th>
              <th className="text-left p-4 font-semibold text-gray-900">Severity</th>
              <th className="text-left p-4 font-semibold text-gray-900">Camera</th>
              <th className="text-left p-4 font-semibold text-gray-900">Time</th>
              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No alerts
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
