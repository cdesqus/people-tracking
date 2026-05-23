# CCTV Dashboard - React Components & Implementation
## Component Library & Code Examples

**Framework**: React 18 + TypeScript  
**Styling**: Tailwind CSS  
**State Management**: Context API / Zustand  
**HTTP**: Axios + React Query  
**Real-time**: Socket.io / WebSocket

---

## 📦 Project Structure

```
frontend/
├─ src/
│  ├─ components/          # Reusable components
│  │  ├─ layout/
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ Footer.tsx
│  │  ├─ common/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Input.tsx
│  │  │  ├─ Select.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ Alert.tsx
│  │  │  ├─ Modal.tsx
│  │  │  └─ Loading.tsx
│  │  ├─ dashboard/
│  │  │  ├─ DashboardOverview.tsx
│  │  │  ├─ CameraGrid.tsx
│  │  │  ├─ OccupancyHeatmap.tsx
│  │  │  ├─ RecentDetections.tsx
│  │  │  ├─ AlertPanel.tsx
│  │  │  └─ SearchBar.tsx
│  │  ├─ employees/
│  │  │  ├─ EmployeeList.tsx
│  │  │  ├─ EmployeeForm.tsx
│  │  │  ├─ EmployeeCard.tsx
│  │  │  └─ EmployeeTimeline.tsx
│  │  ├─ visitors/
│  │  │  ├─ VisitorCheckIn.tsx
│  │  │  ├─ VisitorList.tsx
│  │  │  └─ BadgeGenerator.tsx
│  │  ├─ reports/
│  │  │  ├─ ReportGenerator.tsx
│  │  │  ├─ AttendanceReport.tsx
│  │  │  ├─ VisitorReport.tsx
│  │  │  └─ Chart.tsx
│  │  └─ settings/
│  │     ├─ SystemSettings.tsx
│  │     ├─ UserManagement.tsx
│  │     └─ AlertRules.tsx
│  ├─ pages/               # Page components
│  │  ├─ DashboardPage.tsx
│  │  ├─ EmployeesPage.tsx
│  │  ├─ VisitorsPage.tsx
│  │  ├─ ReportsPage.tsx
│  │  ├─ SettingsPage.tsx
│  │  ├─ LoginPage.tsx
│  │  └─ 404Page.tsx
│  ├─ hooks/              # Custom hooks
│  │  ├─ useApi.ts
│  │  ├─ useAuth.ts
│  │  ├─ useWebSocket.ts
│  │  ├─ useDetections.ts
│  │  └─ useAlerts.ts
│  ├─ context/            # React Context
│  │  ├─ AuthContext.tsx
│  │  ├─ AlertContext.tsx
│  │  └─ WebSocketContext.tsx
│  ├─ services/           # API services
│  │  ├─ api.ts
│  │  ├─ employeeService.ts
│  │  ├─ visitorService.ts
│  │  ├─ detectionService.ts
│  │  └─ reportService.ts
│  ├─ types/              # TypeScript types
│  │  ├─ common.ts
│  │  ├─ employee.ts
│  │  ├─ visitor.ts
│  │  ├─ detection.ts
│  │  └─ alert.ts
│  ├─ utils/              # Utility functions
│  │  ├─ formatters.ts
│  │  ├─ validators.ts
│  │  └─ constants.ts
│  ├─ App.tsx             # Main app
│  └─ index.tsx           # Entry point
├─ public/
├─ tailwind.config.js
├─ tsconfig.json
├─ package.json
└─ .env.local
```

---

## 🎨 Core Components

### **1. Layout Components**

#### **Navbar.tsx**
```typescript
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'react-router-dom';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-white shadow-md h-16 flex items-center justify-between px-6">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-600">CCTV System</h1>
        <span className="text-gray-600">{title}</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span>{user?.name}</span>
            <svg className="w-4 h-4">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              My Profile
            </a>
            <a
              href="/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

#### **Sidebar.tsx**
```typescript
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = {
    admin: [
      { label: 'Dashboard', icon: '📊', path: '/dashboard' },
      { label: 'Employees', icon: '👥', path: '/employees' },
      { label: 'Visitors', icon: '🎫', path: '/visitors' },
      { label: 'Cameras', icon: '📹', path: '/cameras' },
      { label: 'Alerts', icon: '⚠️', path: '/alerts' },
      { label: 'Reports', icon: '📈', path: '/reports' },
      { label: 'Settings', icon: '⚙️', path: '/settings' },
    ],
    security: [
      { label: 'Monitor', icon: '📊', path: '/monitor' },
      { label: 'Alerts', icon: '⚠️', path: '/alerts' },
      { label: 'Search', icon: '🔍', path: '/search' },
    ],
    receptionist: [
      { label: 'Dashboard', icon: '📊', path: '/dashboard' },
      { label: 'Visitors', icon: '🎫', path: '/visitors' },
      { label: 'Employees', icon: '👥', path: '/employees' },
    ],
  };

  const roleMenu = menuItems[user?.role || 'admin'];

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Menu</h2>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {roleMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
```

---

### **2. Common Components**

#### **Button.tsx**
```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant]
      } ${sizes[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⌛</span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

#### **Card.tsx**
```typescript
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
```

#### **Alert.tsx**
```typescript
import React from 'react';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  dismissible = true,
}) => {
  const colors = {
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${colors[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-xl">{icons[type]}</span>
          <p>{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={onClose}
            className="text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
```

---

### **3. Dashboard Components**

#### **DashboardOverview.tsx**
```typescript
import React from 'react';
import { Card } from '../common/Card';
import { useRealTimeData } from '../../hooks/useRealTimeData';

export const DashboardOverview: React.FC = () => {
  const { occupancy, cameras, alerts, visitors } = useRealTimeData();

  const stats = [
    {
      label: 'Current Occupancy',
      value: occupancy.total,
      icon: '👥',
      color: 'bg-blue-100',
    },
    {
      label: 'Active Cameras',
      value: `${cameras.online}/${cameras.total}`,
      icon: '📹',
      color: 'bg-green-100',
    },
    {
      label: 'Active Alerts',
      value: alerts.count,
      icon: '⚠️',
      color: alerts.count > 0 ? 'bg-red-100' : 'bg-gray-100',
    },
    {
      label: 'Current Visitors',
      value: visitors.count,
      icon: '🎫',
      color: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={stat.color}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <span className="text-4xl">{stat.icon}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

#### **CameraGrid.tsx**
```typescript
import React, { useState } from 'react';
import { Card } from '../common/Card';

interface Camera {
  id: string;
  name: string;
  isOnline: boolean;
  rtspUrl: string;
  lastDetection?: string;
}

interface CameraGridProps {
  cameras: Camera[];
  columns?: 2 | 3 | 4;
}

export const CameraGrid: React.FC<CameraGridProps> = ({
  cameras,
  columns = 3,
}) => {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${gridClass[columns]}`}>
      {cameras.map((camera) => (
        <Card
          key={camera.id}
          className={`cursor-pointer transition hover:shadow-lg ${
            !camera.isOnline ? 'opacity-60' : ''
          }`}
          onClick={() => setSelectedCamera(camera)}
        >
          <div>
            {/* Camera Feed Placeholder */}
            <div className="bg-black rounded-lg aspect-video mb-3 flex items-center justify-center text-gray-500">
              {camera.isOnline ? (
                <span className="text-white">📹 Live Feed</span>
              ) : (
                <span>📹 Offline</span>
              )}
            </div>

            {/* Camera Info */}
            <h4 className="font-bold text-gray-800">{camera.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  camera.isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-600">
                {camera.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {camera.lastDetection && (
              <p className="text-xs text-gray-500 mt-2">
                Last detection: {camera.lastDetection}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
```

#### **RecentDetections.tsx**
```typescript
import React from 'react';
import { Card } from '../common/Card';

interface Detection {
  id: string;
  time: string;
  personId: string;
  personName: string;
  cameraId: string;
  confidence: number;
  faceImageUrl: string;
}

interface RecentDetectionsProps {
  detections: Detection[];
  loading?: boolean;
}

export const RecentDetections: React.FC<RecentDetectionsProps> = ({
  detections,
  loading = false,
}) => {
  if (loading) {
    return <Card title="Recent Detections">Loading...</Card>;
  }

  return (
    <Card title="Recent Detections">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-sm font-semibold">Time</th>
              <th className="text-left py-2 px-2 text-sm font-semibold">
                Person
              </th>
              <th className="text-left py-2 px-2 text-sm font-semibold">
                Camera
              </th>
              <th className="text-left py-2 px-2 text-sm font-semibold">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {detections.map((detection) => (
              <tr
                key={detection.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="py-2 px-2 text-sm">{detection.time}</td>
                <td className="py-2 px-2 text-sm">{detection.personName}</td>
                <td className="py-2 px-2 text-sm">{detection.cameraId}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${detection.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm">
                      {Math.round(detection.confidence)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
```

---

### **4. Employee Management Components**

#### **EmployeeForm.tsx**
```typescript
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Alert } from '../common/Alert';

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
}

interface EmployeeFormData {
  empId: string;
  name: string;
  department: string;
  photo?: File;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    empId: '',
    name: '',
    department: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error registering employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Register Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview('');
                  setFormData({ ...formData, photo: undefined });
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <span className="text-gray-500">📷 Click to upload photo</span>
            </label>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <input
            type="text"
            value={formData.empId}
            onChange={(e) =>
              setFormData({ ...formData, empId: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Department</option>
            <option value="Sales">Sales</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Register Employee
          </Button>
        </div>
      </form>
    </Card>
  );
};
```

---

### **5. Visitor Management Component**

#### **VisitorCheckIn.tsx**
```typescript
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Alert } from '../common/Alert';

export const VisitorCheckIn: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    purpose: '',
    hostEmpId: '',
    phone: '',
    email: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to check in visitor
      const response = await fetch('/api/visitors/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setQrCode(data.qrCode);
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          organization: '',
          purpose: '',
          hostEmpId: '',
          phone: '',
          email: '',
        });
        setSuccess(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Visitor Check-In">
      {success && (
        <div className="mb-4">
          <Alert type="success" message="Visitor checked in successfully!" />
          {qrCode && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Visitor Badge:</p>
              <img src={qrCode} alt="Badge" className="w-32 h-32 mx-auto" />
              <Button
                variant="success"
                size="sm"
                onClick={() => window.print()}
              >
                Print Badge
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="col-span-2 border rounded px-3 py-2"
            required
          />

          <input
            type="text"
            placeholder="Organization"
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          />

          <input
            type="text"
            placeholder="Purpose"
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          />

          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="border rounded px-3 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border rounded px-3 py-2"
          />

          <select
            value={formData.hostEmpId}
            onChange={(e) =>
              setFormData({ ...formData, hostEmpId: e.target.value })
            }
            className="col-span-2 border rounded px-3 py-2"
            required
          >
            <option value="">Select Host Employee</option>
            <option value="emp_001">John Doe</option>
            <option value="emp_002">Jane Smith</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="primary" type="submit" loading={loading}>
            Check In Visitor
          </Button>
        </div>
      </form>
    </Card>
  );
};
```

---

## 🔌 Custom Hooks

### **useRealTimeData.ts**
```typescript
import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export const useRealTimeData = () => {
  const { data: wsData } = useWebSocket('/ws/dashboard');
  const [occupancy, setOccupancy] = useState({ total: 0, zones: {} });
  const [cameras, setCameras] = useState({ online: 0, total: 0 });
  const [alerts, setAlerts] = useState({ count: 0 });
  const [visitors, setVisitors] = useState({ count: 0 });

  useEffect(() => {
    if (wsData) {
      setOccupancy(wsData.occupancy);
      setCameras(wsData.cameras);
      setAlerts(wsData.alerts);
      setVisitors(wsData.visitors);
    }
  }, [wsData]);

  return { occupancy, cameras, alerts, visitors };
};
```

### **useWebSocket.ts**
```typescript
import { useState, useEffect } from 'react';

export const useWebSocket = (url: string) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000${url}`);

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => setData(JSON.parse(event.data));
    ws.onerror = () => setIsConnected(false);

    return () => ws.close();
  }, [url]);

  return { data, isConnected };
};
```

---

## 📦 Installation & Setup

### **package.json Dependencies**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.4.0",
    "@tanstack/react-query": "^4.0.0",
    "zustand": "^4.3.0",
    "tailwindcss": "^3.3.0",
    "recharts": "^2.7.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### **Setup Commands**
```bash
# Create React app
npx create-react-app cctv-dashboard --template typescript

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start dev server
npm start
```

---

## 🎨 Tailwind Configuration

### **tailwind.config.js**
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
```

---

**Component Library Version**: 1.0 (AWS Edition)  
**Last Updated**: May 2026  
**Status**: ✅ Complete - Ready for Implementation
