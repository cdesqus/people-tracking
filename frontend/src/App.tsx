import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import Dashboard from '@pages/Dashboard';
import Cameras from '@pages/Cameras';
import Alerts from '@pages/Alerts';
import Analytics from '@pages/Analytics';
import Settings from '@pages/Settings';
import Employees from '@pages/Employees';
import Visitors from '@pages/Visitors';
import NotFound from '@pages/NotFound';
import Branches from '@pages/Branches';
import ReportsPage from '@pages/ReportsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cameras" element={<Cameras />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
