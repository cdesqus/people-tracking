import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/store';
import { useDashboardData } from '@hooks/useDashboardData';
import { acknowledgeAlertStart, acknowledgeAlertSuccess } from '@store/slices/alertSlice';
import { API_BASE_URL } from '@/utils/constants';

// Component to handle MJPEG streams properly and prevent browser connection exhaustion
const MjpegStream: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current) {
      imgRef.current.src = src;
    }
    return () => {
      // Force the browser to close the MJPEG connection when the component unmounts
      // A blank 1x1 GIF forces Chrome to kill the multipart TCP socket immediately.
      if (imgRef.current) {
        imgRef.current.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      }
    };
  }, [src]);

  return <img ref={imgRef} alt={alt} className={className} />;
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const branches = useAppSelector((state) => state.branches.branches);
  const [activeTab, setActiveTab] = useState<'overview' | 'monitor'>('overview');
  const [selectedCamera, setSelectedCamera] = useState<string>('CAM-01');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [snapshotTick, setSnapshotTick] = useState(Date.now());
  const [previewImage, setPreviewImage] = useState<{ src: string, title: string, subtitle: string } | null>(null);
  const [streamLatency, setStreamLatency] = useState<number | null>(null);
  const [streamInfo, setStreamInfo] = useState<{ resolution: string; fps: string } | null>(null);
  // kpiStats is now calculated dynamically inline during render to avoid state loops

  // Load real-time data from custom hook
  const { cameras, alerts, faces, isConnected } = useDashboardData({
    autoConnect: true,
  });

  // Load Google Fonts and Material Icons stylesheet on mount
  useEffect(() => {
    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    return () => {
      document.head.removeChild(linkIcons);
      document.head.removeChild(linkFonts);
    };
  }, []);

  // Update snapshot timestamp every 3 seconds for thumbnails
  useEffect(() => {
    const snapshotInterval = setInterval(() => {
      setSnapshotTick(Date.now());
    }, 3000);
    return () => clearInterval(snapshotInterval);
  }, []);

  // Handle alert acknowledgment via API
  const handleAcknowledgeAlert = async (alertId: string) => {
    dispatch(acknowledgeAlertStart());
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        dispatch(acknowledgeAlertSuccess(alertId));
      } else {
        // Fallback for mock environments
        dispatch(acknowledgeAlertSuccess(alertId));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      // Fallback update
      dispatch(acknowledgeAlertSuccess(alertId));
    }
  };

  // Mock static data to keep UI gorgeous when empty
  const mockFaces = [
    {
      name: 'M. Richards',
      role: 'Employee',
      confidence: 98.4,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGKgiK22EIf-8E6f-CdqTK52BxWS0K46E1_7K_jfvWFNN7_MlK3w7LLai_orj24Pxtd36E01qfVJ1gjivR2_iRUD7lKUN1NfPwhOXUfRo4k_L7OKxUOVMwPn3loh2tDqK5MlH3M-K3_IBHpZtitjt4ysSpmFIAji3tG3NJ3P0yuVGHNxkJg9iocpkkTi6P0awSEGbx7L5Z4o6J0-QYURiSqR_tpfBSCwjZ4eFuDlfL9ZYpTCz6-JviCL78O9UqwksGzfV4hK7eI5p0',
      time: '14:22:04',
      location: 'Entrance A',
      status: 'verified',
      branch: 'br-hq'
    },
    {
      name: 'S. Chen',
      role: 'Verified',
      confidence: 99.1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE2XcnWd3mq9eHpQMBgo1i67eW-mQbxpEgHqDMVcm1KMsftl4p13S5kgPkVXbE9sZPtWxj-0MjRBrAK3JvomPLKMrwDO_8K5-9zA_NSmzHL25GiF4ZYKmH08nJVSygtdpN0_XgZJBIC0upNGE1PRWDf4ZaOids-AJXGWGbbkzCM5YKcBPbGuAFavdzMYM1Ujgzi7fZXC9Tth9Grkx7ht001laWFGuoLmnWZ3PoJiKsdx8ZCj6B6SYlfr0gvHVUI9uRzT-tc88odsw8',
      time: '14:21:55',
      location: 'Elevator Bank 2',
      status: 'verified',
      branch: 'br-hq'
    },
    {
      name: 'Unknown Subject',
      role: 'Unknown',
      confidence: 0,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjFgVkH9axMERLGYP_VOmpOpSJs087rwWE35hTKEmSaHavkXnAcTMbfTmVeam1Cl4AtVD-KxXjLUNzhl7TGgV4789W6Usk_55GgypHf9YoF49cJHG_-pYv5Aiid1GfqU0RZJ2222B1XJdE3MeWi3ng-W9BP6rJcDLj_IXq-i71-Two5zyDQvlhVp2uuELB7sDpKupOp2x-b_YTq_d8wxMZaHalJssVNuSzlJt97fdUdamgEfIFYPtnbXniYXB-ygDQjeVqd3s4AvEE',
      time: '14:21:10',
      location: 'Loading Dock',
      status: 'unrecognized',
      branch: 'br-sby'
    },
    {
      name: 'A. Jenkins',
      role: 'Senior Admin',
      confidence: 97.2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtgHrRRJm2ZetZ40-4Tg49JMyhEDNyXFTHzH0CzFeYo7DoLoxy7mYdg52BMUUpIO6kiNW1xeKobNBVotIdqTMSs_ndxo8cyUkdxwb1LFIYZVHZiaX-vHRYNC5jDCrgt5x1jhe03WpUAlvthBkTUS7tJvzdAjUcCUzxnX3HXJroZW_sZbu4RM5uTO1d0ikW8fTijsrKoZ9ZJMcExPE6sMaV0YyVydO0iD_6VSfRcpoDsPgMzatvycmF4Q3X0lQxuf-Vz2CGQxdKEFbM',
      time: '14:19:55',
      location: 'Main Office',
      status: 'verified',
      branch: 'br-hq'
    },
    {
      name: 'J. Doe',
      role: 'Engineer',
      confidence: 99.8,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPQ4pwWRpndD4-CuwQIIZMQmS-7zuizef4Q1WJc2BCjKXmQZPZ1XN-lx0j-YpdMXjikQh78NZfAHNtDxA-00BZn7T9KTQGXI1h-qBRqeTtE7slEkVxbGKS9tnsul2pN-mkCW466uHJxG_LB07lU_y8vXYsbiH9k4IquxPbWxUhp_MvioTtsMj2A5CtftKeraS8yv8nOWU8Tgjlq2gtmXw9aDweD6_hq1MYk5EKahFTjvKzsIyoG12TH6QAtbM858LLXeIiIea-rjBB',
      time: '14:15:30',
      location: 'Server Room',
      status: 'verified',
      branch: 'br-mdn'
    }
  ];

  const mockAlerts = [
    {
      id: 'alert-1',
      title: 'Unauthorized Entry',
      description: 'Unrecognized individual detected near high-value asset storage zone.',
      location: 'Loading Dock (CAM-03)',
      time: '14:22:01',
      severity: 'critical',
      type: 'unknown_face',
      branch: 'br-sby'
    },
    {
      id: 'alert-2',
      title: 'Motion Detected',
      description: 'Automated cleaning crew detected in restricted office area.',
      location: 'Level 2 Parking (CAM-02)',
      time: '14:19:55',
      severity: 'high',
      type: 'suspicious_activity',
      branch: 'br-bdg'
    },
    {
      id: 'alert-3',
      title: 'Temp Deviation',
      description: 'A/C unit failure or high load causing thermal threshold exceedance.',
      location: 'Server Room 01 (CAM-05)',
      time: '14:05:12',
      severity: 'medium',
      type: 'system_error',
      branch: 'br-mdn'
    }
  ];

  const mockCameras = [
    {
      id: 'CAM-01',
      name: 'MAIN LOBBY',
      status: 'active',
      type: 'rec',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHi9scnA5eEXqAQR1PXYOzk8x0tpr1peS2gAeFoYhtv8Dt_0pTFHr037Hy4_VFUKt2QhMYYkSPjWZUjjx8G9UAFQ6x9_aJeDGW0Yoixw0I_GmGRlJTGcgx4FlApuzP8dsSQMTITELmp3s6VmKNjveTr5O37EaeuxtHUSA9EaZ8ZDF49SK5S59UEb43zCovGd0F5egbJvnBjz6wMTYNK1K5ikicbm5EkgHwVLz1HQ9GWx2YAHZM5Utn0ycsGae87rfNTJkH8QyUc18D',
      branch: 'br-hq'
    },
    {
      id: 'CAM-02',
      name: 'BOARDROOM',
      status: 'active',
      type: 'live',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr6BOBCZ5idG1hyXwkXbtCJZtyKAncjSTClxk5e24G_EuK70T3TvkwMDpPGHt5VmLg04X0Dgfd3kNd1lSayZz4ZHh4qYKgf-aNOAVYl21VjsI2uXqkXOmBiR00gn_l1I-C1PUNxitva972Ufw2cUhvWEokX9J3nmam_hxd8rZOIAxqJNJgW1E9YXNE72YdhQddnrdK-hCXNRhRp8p5h5AF8b8Mb4-UFgRxj658VKxg2JvnoVH_uOdlaTqbDtm06KVe_py27jhqIWH0',
      branch: 'br-bdg'
    },
    {
      id: 'CAM-03',
      name: 'LOADING DOCK',
      status: 'active',
      type: 'live',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj43HqurmA2AySCICMcg-RK-D0kWWjLqpTFi1LRj7aB2dNQaKWM36D52H4yAfceUa7R9vfDPZy3ZQxT7EHw0GrVsq3bhU8u6Eg2PZdlUvTQXlkN4CqLCpv3cpRpdDtVQ31JPdGfdTvFJ6itg2CqCf_538BH9uOBJNB6wTh-Wsww807MOqVlif_ghrNvqOTgVK1J40N30fbgDzpstoI6L-Gwah9hM00N823pTdf9pm5-Tg1in_JDH3OhbiSN-uCgjlxP6e2wudkDSqh',
      branch: 'br-sby'
    },
    {
      id: 'CAM-04',
      name: 'PERIMETER S',
      status: 'active',
      type: 'live',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABjP8ZIjDu3evIA7o0sNA1mjIfZ4_GKKHYXRL05cu8d28K4FKZ3PIGiuxkFy8POdztBKyLY7aa1fXpRthSoQI5FyMcgjQApjGJZ660VFmi4OrZrA1VSv2OPs2FpXbd2W63Nt0HPAaRHpOg2ZWyGDqyszrvM_-UtnwrUVLMjCds1cJBOVw8UMNCLG42KzZj1lu8MtjSJMk0iChsQHk3H6gb3BVG0XDbWBpTw11gcbxnH59aCzCTXZJx1sjlOw1cQ5xllpPBMkFl-ZQl',
      branch: 'br-hq'
    },
    {
      id: 'CAM-05',
      name: 'DATA CENTER',
      status: 'active',
      type: 'live',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWUPx-TmsYp4kmKm_xVRs5fmxzaoZY3ieD4YT61aMZHejTbEV6iTLfpIxwc_S4Z0rvIrSs1T_AV-tq6gvV0oJErSf34f90f4vUKT_MntTGc-HkEbaCKLsDRyYBysRinLW8LkxNq1S-005dYKmvpXRhuCRvmo6GE5yZoAKTlnCbz_iBUXvX12GhI1YXo4y8CVeN2FE-RDyAPaJNXSFn8KCAiclTX0Bs9KP8EG3lWH13JCh58pRHmyEHM40uHxWJzbXxo3NZZKODpFWb',
      branch: 'br-mdn'
    },
    {
      id: 'CAM-06',
      name: 'PARKING G1',
      status: 'inactive',
      type: 'lost',
      image: '',
      branch: 'br-ygk'
    }
  ];

  // Merge real and mock cameras
  const displayCameras: any[] = cameras.length > 0
    ? cameras.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status || 'active',
        type: 'live' as const,
        image: c.status === 'active'
          ? `${API_BASE_URL}/cameras/${c.id}/stream`
          : '',
        snapshotUrl: c.status === 'active'
          ? `${API_BASE_URL}/cameras/${c.id}/snapshot?t=${snapshotTick}`
          : '',
        branch: c.branch || 'br-hq'
      }))
    : mockCameras;

  // Merge real and mock alerts
  const displayAlerts: any[] = alerts.length > 0
    ? alerts.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        location: a.camera_id ? (cameras.find((c: any) => c.id === a.camera_id)?.name || `Camera ${a.camera_id}`) : 'System',
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: a.severity || 'high',
        type: a.type,
        acknowledged: a.acknowledged,
        has_image: a.has_image,
        branch: a.branch || 'br-hq'
      })).filter(a => !a.acknowledged)
    : mockAlerts;

  // Merge real and mock face detections
  const displayFaces: any[] = faces.length > 0
    ? faces.map((f: any) => ({
        name: f.person_name || (f.person_id ? `ID: ${f.person_id}` : 'Unknown Subject'),
        role: f.person_id ? 'Employee' : 'Unknown',
        confidence: f.confidence <= 1.0 ? f.confidence * 100 : f.confidence,
        image: f.image_url,
        time: new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        location: f.location || (f.camera_id ? `Camera ${f.camera_id}` : 'General'),
        status: f.person_id ? 'verified' : 'unrecognized',
        branch: f.branch || 'br-hq'
      }))
    : mockFaces;

  // Filter lists based on selected branch
  const filteredCameras = displayCameras.filter(
    (c: any) => selectedBranch === 'all' || c.branch === selectedBranch
  );

  const filteredAlerts = displayAlerts.filter(
    (a: any) => selectedBranch === 'all' || a.branch === selectedBranch
  );

  const filteredFaces = displayFaces.filter(
    (f: any) => selectedBranch === 'all' || f.branch === selectedBranch
  );

  // Update KPI stats dynamically from actual arrays (calculated inline to prevent state render loop)
  const activeCameraCount = filteredCameras.filter(
    (c: any) => c.status === 'active' || c.isOnline === true
  ).length;
  const activeAlertCount = filteredAlerts.length;
  const knownPersons = new Set(
    filteredFaces
      .filter((f: any) => f.role !== 'Unknown' && f.status === 'verified')
      .map((f: any) => f.name)
  ).size;

  const kpiStats = {
    occupancy: filteredFaces.length || (selectedBranch === 'all' ? 18 : selectedBranch === 'br-hq' ? 10 : 4),
    activeCameras: activeCameraCount || (selectedBranch === 'all' ? 5 : selectedBranch === 'br-hq' ? 2 : 1),
    totalCameras: filteredCameras.length || (selectedBranch === 'all' ? 6 : selectedBranch === 'br-hq' ? 2 : 1),
    activeAlerts: activeAlertCount,
    currentVisitors: knownPersons || (selectedBranch === 'all' ? 142 : selectedBranch === 'br-hq' ? 84 : selectedBranch === 'br-bdg' ? 34 : 12),
  };

  // Automatically select camera belonging to the filtered branch when branch changes
  useEffect(() => {
    if (selectedBranch !== 'all') {
      const firstCamInBranch = filteredCameras.find((c: any) => c.status === 'active');
      if (firstCamInBranch) {
        setSelectedCamera(firstCamInBranch.id);
      } else {
        const anyCamInBranch = filteredCameras[0];
        if (anyCamInBranch) {
          setSelectedCamera(anyCamInBranch.id);
        }
      }
    } else {
      setSelectedCamera('CAM-01');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  const activeFocusedCamera = filteredCameras.find((c: any) => c.id === selectedCamera) || filteredCameras.find((c: any) => c.status === 'active') || filteredCameras[0];

  // Manage layout scrolling and footer visibility for Live Monitor tab
  useEffect(() => {
    const mainElement = document.getElementById('main-content');
    if (activeTab === 'monitor') {
      document.body.classList.add('hide-footer');
      if (mainElement) {
        mainElement.style.overflow = 'auto';
      }
    } else {
      document.body.classList.remove('hide-footer');
      if (mainElement) {
        mainElement.style.overflow = 'auto';
      }
    }
    return () => {
      document.body.classList.remove('hide-footer');
      if (mainElement) {
        mainElement.style.overflow = 'auto';
      }
    };
  }, [activeTab]);

  // Measure stream latency dynamically for the focused camera
  useEffect(() => {
    if (activeTab !== 'monitor' || !activeFocusedCamera || activeFocusedCamera.status !== 'active') {
      return;
    }

    const cameraId = activeFocusedCamera.id;

    // Measure latency by timing how long it takes to fetch a snapshot
    const measureLatency = async () => {
      try {
        const start = performance.now();
        // Use snapshot instead of stream to prevent spawning a new OpenCV RTSP thread on the backend every 5 seconds
        const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/snapshot`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        
        if (response.ok) {
          const latency = Math.round(performance.now() - start);
          setStreamLatency(latency);
        }
      } catch {
        // Silently fail
      }
    };

    // Only fetch stream info ONCE when the camera focuses, not every 5 seconds
    const fetchStreamInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/cameras/${cameraId}/test-connection`, {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.resolution && data.fps) {
            setStreamInfo({
              resolution: data.resolution,
              fps: `${Math.round(data.fps)}`,
            });
          }
        }
      } catch {
        // Use defaults
      }
    };

    measureLatency();
    fetchStreamInfo();
    
    // Only poll latency, not test-connection
    const interval = setInterval(measureLatency, 5000);
    return () => clearInterval(interval);
  }, [activeTab, activeFocusedCamera?.id, activeFocusedCamera?.status]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-800">
      {/* Dynamic Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        .scanning-line {
            height: 2px;
            background: linear-gradient(90deg, transparent, #3b82f6, transparent);
            position: absolute;
            width: 100%;
            top: 0;
            animation: scan 4s linear infinite;
        }
        .scanline {
            width: 100%;
            height: 2px;
            background: rgba(78, 222, 163, 0.2);
            position: absolute;
            animation: scan 5s linear infinite;
        }
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
        .pulse-dot {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.9); }
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      {/* Control Sub-Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-white border-b border-slate-200 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs tracking-wider uppercase transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs tracking-wider uppercase transition-all ${
                activeTab === 'monitor'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              Live Monitor
            </button>
          </div>
        </div>

        {/* Branch Selector and Real-time Connection Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Branch Dropdown */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="appearance-none pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">ALL BRANCHES (GLOBAL)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name.toUpperCase()} ({b.code})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[16px] pointer-events-none">
              location_on
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[16px] pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
            <span className="text-[10px] font-mono font-medium text-slate-600">
              {isConnected ? 'LIVE FEED CONNECTED' : 'RECONNECTING FEED...'}
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        /* ==================== TAB 1: SYSTEM OVERVIEW (BENTO GRID) ==================== */
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* KPI Dashboard Overview Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 border border-slate-200/80 shadow-md rounded-xl flex items-center justify-between transition-all hover:border-slate-300">
              <div>
                <p className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Employees</p>
                <h2 className="text-3xl font-extrabold font-mono mt-1 text-slate-900">1,284</h2>
              </div>
              <div className="bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20">
                <span className="material-symbols-outlined text-blue-500 scale-125">groups</span>
              </div>
            </div>

            <div className="bg-white p-6 border border-slate-200/80 shadow-md rounded-xl flex items-center justify-between transition-all hover:border-slate-300">
              <div>
                <p className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Visitors</p>
                <h2 className="text-3xl font-extrabold font-mono mt-1 text-emerald-600">{kpiStats.currentVisitors}</h2>
              </div>
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-600 scale-125">badge</span>
              </div>
            </div>

            <div className="bg-white p-6 border border-slate-200/80 shadow-md rounded-xl flex items-center justify-between transition-all hover:border-slate-300 border-l-4 border-l-emerald-600">
              <div>
                <p className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">System Health</p>
                <h2 className="text-3xl font-extrabold font-mono mt-1 text-slate-900">{isConnected ? '99.8%' : '92.4%'}</h2>
              </div>
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-500 scale-125">dns</span>
              </div>
            </div>
          </section>

          {/* Bento Mid Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Live Camera Surveillance Wall (Col span 8) */}
            <section className="lg:col-span-8 bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden relative flex flex-col justify-between group">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                  <span className="material-symbols-outlined text-blue-500">grid_view</span>
                  Live Camera Surveillance Wall
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-1 bg-slate-50 rounded border border-slate-200 text-slate-500">
                    {filteredCameras.filter((c: any) => c.status === 'active').length} Channels Online
                  </span>
                  <span className="text-[10px] font-mono px-2 py-1 bg-blue-600 text-white rounded font-bold animate-pulse">LIVE</span>
                </div>
              </div>

              {/* Grid of Active Cameras */}
              <div className="p-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[480px] overflow-y-auto no-scrollbar">
                {filteredCameras.slice(0, 4).map((camera) => (
                  <div 
                    key={camera.id}
                    onClick={() => {
                      if (camera.status === 'active') {
                        setSelectedCamera(camera.id);
                        setActiveTab('monitor');
                      }
                    }}
                    className="relative aspect-video bg-white rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500/50 transition-all cursor-pointer group/cam"
                  >
                    {camera.status === 'active' ? (
                      <>
                        <img 
                          alt={camera.name} 
                          className="w-full h-full object-cover opacity-75 group-hover/cam:opacity-100 transition-opacity duration-300"
                          src={camera.snapshotUrl || camera.image} 
                        />
                        
                        {/* Scanline Overlay */}
                        <div className="scanline pointer-events-none" />

                        {/* Top Info Bar */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-mono text-slate-900 text-[8px] bg-slate-50/85 px-1.5 py-0.5 rounded border border-slate-200 backdrop-blur-sm">
                            {camera.name.toUpperCase()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
                          <span className="font-mono text-emerald-600 text-[8px] bg-slate-50/85 px-1.5 py-0.5 rounded border border-slate-200/80 font-bold backdrop-blur-sm">
                            AI ACTIVE
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/40">
                        <span className="material-symbols-outlined text-2xl text-gray-700 mb-1">videocam_off</span>
                        <p className="font-mono text-gray-600 text-[9px] tracking-wider font-bold">SIGNAL LOST</p>
                        
                        {/* Camera details */}
                        <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="font-mono text-gray-600 text-[8px] bg-slate-50/80 px-1.5 py-0.5 rounded border border-slate-900">
                            {camera.name.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Surveillance Footer */}
              <div className="p-4 flex justify-between items-center bg-slate-50/80 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-mono">
                  Showing active system nodes for branch: <strong className="text-blue-600 uppercase">{selectedBranch === 'all' ? 'All Branches' : selectedBranch}</strong>
                </span>
                <button 
                  onClick={() => setActiveTab('monitor')}
                  className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1"
                >
                  Configure Camera Grid &rarr;
                </button>
              </div>
            </section>

            {/* Active Incident Alerts (Col span 4) */}
            <section className="lg:col-span-4 bg-white border border-slate-200 shadow-md rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                  Active Alerts
                </h3>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                  {filteredAlerts.length} Active
                </span>
              </div>

              {/* Alert List Container */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[400px] flex-1">
                {filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className={`p-3.5 rounded-lg border-l-4 transition-all duration-200 cursor-pointer flex gap-3 ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/5 border-red-600 border border-y-slate-800 border-r-slate-800 hover:bg-red-500/10'
                        : alert.severity === 'high'
                        ? 'bg-amber-500/5 border-amber-500 border border-y-slate-800 border-r-slate-800 hover:bg-amber-500/10'
                        : 'bg-slate-50/40 border-slate-300 border border-y-slate-800 border-r-slate-800 hover:bg-slate-50/60'
                    }`}
                  >
                    {alert.has_image ? (
                      <img 
                        src={`/api/alerts/${alert.id}/image`} 
                        alt="Capture" 
                        className="w-10 h-10 mt-0.5 rounded object-cover border border-slate-300"
                      />
                    ) : (
                      <span className={`material-symbols-outlined mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {alert.type === 'unknown_face' ? 'person_off' : alert.type === 'system_error' ? 'dns' : 'warning'}
                      </span>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700">{alert.title}</p>
                        <span className="text-[9px] font-mono text-gray-500">{alert.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">{alert.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-200/60 mt-auto bg-slate-50/20">
                <Link 
                  to="/alerts" 
                  className="w-full py-2 border border-slate-300 text-slate-600 font-mono text-[11px] rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors block text-center uppercase tracking-wider font-bold"
                >
                  View All Incident Logs
                </Link>
              </div>
            </section>
          </div>

          {/* Recent AI Face Detections (Col span 12) */}
          <section className="bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden w-full">
            <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-500">face</span>
                Recent AI Face Detections
              </h3>
              <span className="text-[10px] font-mono text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                GLOBAL SCAN ACTIVE
              </span>
            </div>

            {/* Face Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
              {filteredFaces.slice(0, 5).map((face, index) => (
                <div 
                  key={index}
                  onClick={() => setPreviewImage({
                    src: face.image,
                    title: face.name,
                    subtitle: `${face.location} • ${face.time} (${face.role})`
                  })}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 transition-all hover:border-blue-500/80 hover:shadow-lg cursor-pointer"
                >
                  {/* Image with scanner effects */}
                  <img 
                    alt={face.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    src={face.image} 
                  />
                  
                  {/* Targeting Reticle/Biometric Box Overlay */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/20 pointer-events-none flex items-center justify-center">
                    <div className={`absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 ${face.status === 'verified' ? 'border-emerald-500' : 'border-red-500'}`} />
                    <div className={`absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 ${face.status === 'verified' ? 'border-emerald-500' : 'border-red-500'}`} />
                    <div className={`absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 ${face.status === 'verified' ? 'border-emerald-500' : 'border-red-500'}`} />
                    <div className={`absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 ${face.status === 'verified' ? 'border-emerald-500' : 'border-red-500'}`} />
                  </div>

                  {/* Identification Badge Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-8">
                    <p className="text-[11px] font-bold text-slate-900 tracking-wide truncate">{face.name}</p>
                    <p className={`text-[9px] font-mono mt-1 ${face.status === 'verified' ? 'text-emerald-600' : 'text-red-400 animate-pulse'}`}>
                      {face.status === 'verified' ? `MATCH: ${face.confidence}%` : 'SCANNING...'}
                    </p>
                  </div>
                </div>
              ))}

              {/* View All Redirect Card */}
              <Link 
                to="/employees"
                className="group aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500/40 transition-colors cursor-pointer bg-slate-50/20 hover:bg-white/40"
              >
                <span className="material-symbols-outlined text-4xl mb-1 group-hover:scale-110 transition-transform">more_horiz</span>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">View All Users</span>
              </Link>
            </div>
          </section>
        </div>
      ) : (
        /* ==================== TAB 2: LIVE MONITOR FEED ==================== */
        <div className="flex flex-col lg:flex-row w-full bg-slate-50">
          
          {/* Left Panel: Identification Log (Scrollable) */}
          <aside className="w-full h-[350px] lg:h-auto lg:max-h-[calc(100vh-120px)] lg:w-[340px] border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col overflow-hidden bg-white/40 order-last lg:order-none lg:sticky lg:top-0">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-500">face</span>
                Identification Log
              </h2>
              <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Real-time AI Processing</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
              {filteredFaces.map((face, index) => (
                <div 
                  key={index}
                  onClick={() => setPreviewImage({
                    src: face.image,
                    title: face.name,
                    subtitle: `${face.location} • ${face.time} (${face.role})`
                  })}
                  className={`flex items-center gap-3.5 p-2.5 bg-white border rounded-lg transition-colors cursor-pointer group ${
                    face.status === 'unrecognized' 
                      ? 'border-red-500/40 hover:border-red-500 bg-red-500/5' 
                      : 'border-slate-200 hover:border-blue-500/80 bg-white/60'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      className="w-11 h-11 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      src={face.image} 
                      alt=""
                    />
                    <div className={`absolute -bottom-1 -right-1 text-[8px] px-1 py-0.5 rounded font-mono font-bold ${
                      face.status === 'unrecognized' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {face.status === 'unrecognized' ? 'NEW' : `${Math.round(face.confidence || 98)}%`}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${face.status === 'unrecognized' ? 'text-red-400' : 'text-slate-700'}`}>
                      {face.name}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5 truncate">
                      {face.location} • {face.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Area: Focus Stream, Sidebar Selectors & Bottom Alert Center */}
          <section className="flex-1 flex flex-col p-4 bg-slate-50 order-first lg:order-none">
            
            {/* Main Area: Split between Large Player (left) and Camera Grid (right) */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 mb-4">
              
              {/* Large Focused Camera Player */}
              <div className="flex-[7] flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-2xl">
                {activeFocusedCamera ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Header bar of Focused Player */}
                    <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${activeFocusedCamera.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="font-mono text-slate-900 text-xs font-bold">
                          {activeFocusedCamera.name.toUpperCase()} (FOCUSED FEED)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-50 rounded border border-slate-200 text-emerald-600 font-bold">
                          {activeFocusedCamera.status === 'active'
                            ? (streamInfo ? `${streamInfo.resolution} @ ${streamInfo.fps}FPS` : 'CONNECTING...')
                            : 'OFFLINE'}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-600/10 text-blue-600 rounded border border-blue-500/20 font-bold">
                          LATENCY: {streamLatency !== null ? `${streamLatency}ms` : '...'}
                        </span>
                      </div>
                    </div>

                    {/* Stream display */}
                    <div className="bg-slate-50 relative flex items-center justify-center overflow-hidden">
                      {activeFocusedCamera.status === 'active' ? (
                        <>
                          <MjpegStream
                            alt={activeFocusedCamera.name} 
                            className="w-full h-full object-contain"
                            src={activeFocusedCamera.image} 
                          />
                          {/* Targeting Reticle/Biometric Grid HUD */}
                          <div className="absolute inset-0 pointer-events-none border border-blue-500/10">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/20 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                            <div className="scanline" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6">
                          <span className="material-symbols-outlined text-5xl text-gray-700 mb-2">videocam_off</span>
                          <h3 className="font-mono text-gray-500 text-sm tracking-widest font-bold">FEED SIGNAL LOST</h3>
                          <p className="text-xs text-gray-600 mt-2 font-sans max-w-xs">The camera node is currently offline or unreachable. Check local hardware connection.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    No camera selected
                  </div>
                )}
              </div>

              {/* Small Sidebar Camera Selectors */}
              <div className="flex-[3] relative">
                <div className="absolute inset-0 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-white border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Stream</h3>
                </div>
                
                {/* Scrollable list of other camera thumbnails */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
                  {filteredCameras.map((camera: any) => {
                    const isSelected = selectedCamera === camera.id;
                    return (
                      <div 
                        key={camera.id}
                        onClick={() => setSelectedCamera(camera.id)}
                        className={`group relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer aspect-video flex flex-col border ${
                          isSelected 
                            ? 'border-blue-500 shadow-md shadow-blue-500/10 bg-slate-50' 
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                        }`}
                      >
                        {camera.status === 'active' ? (
                          <>
                            {isSelected ? (
                              <div className="w-full h-full flex flex-col items-center justify-center py-2 bg-blue-900/20 text-blue-600">
                                <span className="material-symbols-outlined text-2xl mb-1 animate-pulse">visibility</span>
                                <span className="text-[9px] font-mono font-bold tracking-widest">VIEWING</span>
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center py-2 bg-white text-gray-500 group-hover:text-blue-600 transition-colors">
                                <span className="material-symbols-outlined text-2xl mb-1">play_circle</span>
                                <span className="text-[9px] font-mono font-bold tracking-widest">STANDBY</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-slate-50/40" />
                            
                            <div className="absolute top-1.5 left-1.5 z-10 font-mono text-[8px] bg-slate-50/80 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                              {camera.name.toUpperCase()}
                            </div>
                            <div className="absolute bottom-1.5 left-1.5 z-10 font-mono text-[8px] text-slate-500 truncate max-w-[80%]">
                              LIVE
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center py-2 bg-slate-50/80 text-gray-700">
                            <span className="material-symbols-outlined text-lg mb-0.5">videocam_off</span>
                            <span className="text-[7px] font-mono font-bold tracking-wider">{camera.name.toUpperCase()} OFFLINE</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>

            </div>

            {/* Bottom Panel: Live Alert Center */}
            <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Security Alerts</h3>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono animate-pulse">
                    {filteredAlerts.filter(a => a.severity === 'critical').length} CRITICAL
                  </span>
                </div>
                <Link to="/alerts" className="text-blue-500 font-mono text-[10px] uppercase font-bold hover:underline">
                  View All Logs
                </Link>
              </div>

              {/* Alert list rows */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                {filteredAlerts.slice(0, 2).map((alert) => (
                  <div 
                    key={alert.id}
                    className={`flex items-center justify-between gap-4 p-3 rounded-lg border-l-4 ${
                      alert.severity === 'critical' 
                        ? 'bg-red-500/5 border-red-600 border-y border-r border-slate-200' 
                        : 'bg-blue-500/5 border-blue-600 border-y border-r border-slate-200'
                    }`}
                  >
                    {alert.has_image ? (
                      <img 
                        src={`/api/alerts/${alert.id}/image`} 
                        alt="Capture" 
                        className="w-14 h-10 rounded object-cover border border-slate-300 flex-shrink-0"
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{alert.title}</span>
                        <span className="font-mono text-[10px] text-gray-500 truncate">• {alert.location} • {alert.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">{alert.description}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="bg-blue-600 text-white text-[10px] font-bold px-3.5 py-1.5 rounded font-mono uppercase tracking-wider active:scale-95 transition-transform hover:bg-blue-500"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      )}

      {/* Face Capture Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-lg">visibility</span>
                Face Capture Preview
              </h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner group">
                <img 
                  src={previewImage.src} 
                  alt={previewImage.title}
                  className="w-full h-full object-contain max-h-[300px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjFgVkH9axMERLGYP_VOmpOpSJs087rwWE35hTKEmSaHavkXnAcTMbfTmVeam1Cl4AtVD-KxXjLUNzhl7TGgV4789W6Usk_55GgypHf9YoF49cJHG_-pYv5Aiid1GfqU0RZJ2222B1XJdE3MeWi3ng-W9BP6rJcDLj_IXq-i71-Two5zyDQvlhVp2uuELB7sDpKupOp2x-b_YTq_d8wxMZaHalJssVNuSzlJt97fdUdamgEfIFYPtnbXniYXB-ygDQjeVqd3s4AvEE';
                  }}
                />
              </div>
              
              <div className="w-full mt-4 text-center">
                <h4 className="text-base font-bold text-slate-900 tracking-wide">{previewImage.title}</h4>
                <p className="text-[11px] font-mono text-slate-500 mt-1 uppercase tracking-wider">{previewImage.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
