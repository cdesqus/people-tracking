/**
 * WhatsApp Notification Settings via Waha
 * - Session login (QR code / Pairing code)
 * - Waha configuration
 * - Recipient management (groups + individuals)
 * - Alert severity filter
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  MessageCircle,
  Wifi,
  WifiOff,
  QrCode,
  Hash,
  Settings2,
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RefreshCw,
  Send,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Group,
  User,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WahaConfig {
  waha_url: string;
  waha_api_key: string | null;
  session_name: string;
  is_enabled: boolean;
  alert_severities: string[];
  alert_types?: string[];
}

interface WahaStatus {
  status?: string;
  engine?: { name: string };
  me?: { id: string; pushName: string };
  error?: string;
}

interface Recipient {
  id: string;
  chat_id: string;
  label: string;
  type: 'person' | 'group';
  is_active: boolean;
}

interface WahaGroup {
  id: string;
  name: string;
}

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-500' },
];

const ALERT_TYPE_OPTIONS = [
  { value: 'unknown_face', label: 'Unknown Face Detected', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  { value: 'match', label: 'Face Matched', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30', dot: 'bg-emerald-500' },
  { value: 'suspicious_activity', label: 'Suspicious Activity', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
  { value: 'intrusion', label: 'Intrusion Zone', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
  { value: 'system_error', label: 'System Error', color: 'bg-slate-500/20 text-slate-500 border-slate-500/30', dot: 'bg-slate-500' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusColor = (status?: string) => {
  if (!status) return 'text-slate-500';
  const s = status.toUpperCase();
  if (s === 'WORKING') return 'text-emerald-600';
  if (s.includes('SCAN') || s.includes('QR') || s.includes('PAIRING')) return 'text-yellow-400';
  if (s === 'STOPPED' || s === 'FAILED') return 'text-red-400';
  return 'text-slate-500';
};

const statusDot = (status?: string) => {
  if (!status) return 'bg-slate-600';
  const s = status.toUpperCase();
  if (s === 'WORKING') return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]';
  if (s.includes('SCAN') || s.includes('QR') || s.includes('PAIRING')) return 'bg-yellow-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]';
  if (s === 'STOPPED' || s === 'FAILED') return 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]';
  return 'bg-slate-500';
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WhatsAppSettings: React.FC = () => {
  // ── Config state ──
  const [config, setConfig] = useState<WahaConfig>({
    waha_url: 'http://waha:3000',
    waha_api_key: null,
    session_name: 'default',
    is_enabled: false,
    alert_severities: ['critical', 'high'],
    alert_types: ['match', 'unknown_face', 'suspicious_activity', 'intrusion', 'system_error'],
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // ── Session state ──
  const [status, setStatus] = useState<WahaStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'qr' | 'code'>('qr');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Recipients state ──
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [groups, setGroups] = useState<WahaGroup[]>([]);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [newRecipient, setNewRecipient] = useState({ chat_id: '', label: '', type: 'person' as 'person' | 'group' });
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // ─── Fetch functions ───────────────────────────────────────────────────────

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch { /* silent */ }
  }, []);

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) setStatus(await res.json());
      else setStatus({ status: 'unreachable' });
    } catch {
      setStatus({ status: 'unreachable', error: 'Cannot reach Waha server' });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchRecipients = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/recipients');
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.items || []);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchStatus();
    fetchRecipients();

    // Poll status every 10s
    statusIntervalRef.current = setInterval(fetchStatus, 10000);
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
    };
  }, [fetchConfig, fetchStatus, fetchRecipients]);

  // ─── QR Code ──────────────────────────────────────────────────────────────

  const fetchQr = useCallback(async () => {
    setQrLoading(true);
    try {
      const res = await fetch('/api/whatsapp/qr');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setQrImageUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Cannot fetch QR — is Waha running and in SCAN_QR_CODE state?');
      }
    } catch {
      toast.error('Cannot connect to Waha server');
    } finally {
      setQrLoading(false);
    }
  }, []);

  const startQrAutoRefresh = useCallback(() => {
    if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    fetchQr();
    qrIntervalRef.current = setInterval(fetchQr, 30000);
  }, [fetchQr]);

  const stopQrAutoRefresh = useCallback(() => {
    if (qrIntervalRef.current) { clearInterval(qrIntervalRef.current); qrIntervalRef.current = null; }
  }, []);

  // ─── Session actions ───────────────────────────────────────────────────────

  const handleStartSession = async () => {
    setSessionStarting(true);
    try {
      const res = await fetch('/api/whatsapp/session/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.error) { toast.error(`Failed: ${data.error}`); }
      else {
        toast.success('Session starting…');
        setTimeout(() => { fetchStatus(); if (loginMethod === 'qr') startQrAutoRefresh(); }, 2000);
      }
    } catch { toast.error('Cannot connect to Waha server'); }
    finally { setSessionStarting(false); }
  };

  const handleLogout = async () => {
    if (!window.confirm('Logout dari WhatsApp? Kamu perlu scan QR atau pairing code lagi.')) return;
    setLoggingOut(true);
    try {
      await fetch('/api/whatsapp/session/logout', { method: 'POST' });
      toast.success('Logged out dari WhatsApp');
      setQrImageUrl(null);
      setPairingCode(null);
      stopQrAutoRefresh();
      fetchStatus();
    } catch { toast.error('Logout gagal'); }
    finally { setLoggingOut(false); }
  };

  const handleRequestPairingCode = async () => {
    if (!phoneNumber.trim()) { toast.error('Masukkan nomor HP terlebih dahulu'); return; }
    setPairingLoading(true);
    try {
      const clean = phoneNumber.replace(/\D/g, '');
      const res = await fetch('/api/whatsapp/pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: clean }),
      });
      const data = await res.json();
      if (data.code) {
        setPairingCode(data.code);
        toast.success('Pairing code berhasil didapat!');
      } else if (data.error) {
        toast.error(`Error: ${data.error}`);
      } else {
        setPairingCode(JSON.stringify(data));
      }
    } catch { toast.error('Gagal request pairing code'); }
    finally { setPairingLoading(false); }
  };

  // ─── Config save ───────────────────────────────────────────────────────────

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) toast.success('Konfigurasi tersimpan!');
      else toast.error('Gagal simpan konfigurasi');
    } catch { toast.error('Network error'); }
    finally { setSavingConfig(false); }
  };

  const toggleSeverity = (sev: string) => {
    setConfig((prev) => {
      const current = prev.alert_severities || [];
      const next = current.includes(sev) ? current.filter((s) => s !== sev) : [...current, sev];
      return { ...prev, alert_severities: next };
    });
  };

  const toggleAlertType = (type: string) => {
    setConfig((prev) => {
      const current = prev.alert_types || [];
      const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
      return { ...prev, alert_types: next };
    });
  };

  // ─── Recipients ────────────────────────────────────────────────────────────

  const fetchGroups = async () => {
    setFetchingGroups(true);
    try {
      const res = await fetch('/api/whatsapp/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
        if (data.groups?.length) toast.success(`${data.groups.length} grup ditemukan`);
        else toast('Tidak ada grup yang ditemukan');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Gagal fetch grup');
      }
    } catch { toast.error('Gagal fetch grup dari Waha'); }
    finally { setFetchingGroups(false); }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.chat_id.trim() || !newRecipient.label.trim()) {
      toast.error('Chat ID dan label harus diisi'); return;
    }
    try {
      const res = await fetch('/api/whatsapp/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipient),
      });
      if (res.status === 409) { toast.error('Chat ID sudah terdaftar'); return; }
      if (res.ok) {
        toast.success(`${newRecipient.label} ditambahkan!`);
        setShowAddModal(false);
        setNewRecipient({ chat_id: '', label: '', type: 'person' });
        setShowGroupDropdown(false);
        fetchRecipients();
      }
    } catch { toast.error('Gagal tambah penerima'); }
  };

  const handleUpdateRecipient = async () => {
    if (!editingRecipient) return;
    try {
      const res = await fetch(`/api/whatsapp/recipients/${editingRecipient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: editingRecipient.chat_id,
          label: editingRecipient.label,
          type: editingRecipient.type,
          is_active: editingRecipient.is_active,
        }),
      });
      if (res.ok) {
        toast.success('Penerima diperbarui!');
        setEditingRecipient(null);
        fetchRecipients();
      }
    } catch { toast.error('Gagal update penerima'); }
  };

  const handleToggleActive = async (r: Recipient) => {
    try {
      await fetch(`/api/whatsapp/recipients/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !r.is_active }),
      });
      fetchRecipients();
    } catch { toast.error('Gagal update status'); }
  };

  const handleDeleteRecipient = async (r: Recipient) => {
    if (!window.confirm(`Hapus penerima "${r.label}"?`)) return;
    try {
      await fetch(`/api/whatsapp/recipients/${r.id}`, { method: 'DELETE' });
      toast.success(`${r.label} dihapus`);
      fetchRecipients();
    } catch { toast.error('Gagal hapus penerima'); }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const res = await fetch('/api/whatsapp/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok) toast.success(`Test dikirim ke ${data.results?.length || 0} penerima`);
      else toast.error(data.detail || 'Gagal kirim test');
    } catch { toast.error('Network error'); }
    finally { setSendingTest(false); }
  };

  const isConnected = status?.status?.toUpperCase() === 'WORKING';
  const needsAuth = status?.status?.toUpperCase().includes('SCAN') || status?.status?.toUpperCase().includes('QR') || status?.status?.toUpperCase().includes('PAIRING');

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Section 1: Connection Status ── */}
      <div className="bg-white border border-slate-300/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Status Koneksi WhatsApp</h3>
              <p className="text-xs text-slate-500 mt-0.5">via Waha WhatsApp Gateway</p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            disabled={statusLoading}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status card */}
        <div className="flex items-center gap-4 p-4 bg-slate-100/50 rounded-xl border border-slate-300/30 mb-5">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 animate-pulse ${statusDot(status?.status)}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${statusColor(status?.status)}`}>
                {status?.status?.toUpperCase() || 'CONNECTING…'}
              </span>
              {status?.engine?.name && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded">
                  {status.engine.name}
                </span>
              )}
            </div>
            {status?.me?.pushName && (
              <p className="text-xs text-slate-500 mt-0.5">
                {status.me.pushName} · {status.me.id?.replace('@c.us', '')}
              </p>
            )}
            {status?.error && !isConnected && (
              <p className="text-xs text-red-400 mt-0.5 truncate">{status.error}</p>
            )}
          </div>
          {(isConnected || status?.status?.toUpperCase() === 'FAILED') && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              {loggingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reset / Logout'}
            </button>
          )}
        </div>

        {/* Auth flow: only show if not connected */}
        {!isConnected && (
          <div className="space-y-4">
            {/* Start session button */}
            <button
              onClick={handleStartSession}
              disabled={sessionStarting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {sessionStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
              {sessionStarting ? 'Memulai session…' : 'Start Session Waha'}
            </button>

            {/* Login method tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => { setLoginMethod('qr'); setPairingCode(null); }}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${loginMethod === 'qr' ? 'bg-slate-200 text-white shadow' : 'text-slate-500 hover:text-slate-600'}`}
              >
                <QrCode className="w-3.5 h-3.5" /> QR Code
              </button>
              <button
                onClick={() => { setLoginMethod('code'); stopQrAutoRefresh(); setQrImageUrl(null); }}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${loginMethod === 'code' ? 'bg-slate-200 text-white shadow' : 'text-slate-500 hover:text-slate-600'}`}
              >
                <Hash className="w-3.5 h-3.5" /> Pairing Code
              </button>
            </div>

            {/* QR method */}
            {loginMethod === 'qr' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  {qrLoading ? (
                    <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                  ) : qrImageUrl ? (
                    <img src={qrImageUrl} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 p-4">
                      <QrCode className="w-10 h-10" />
                      <p className="text-xs text-center text-slate-500">Klik tombol untuk load QR</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startQrAutoRefresh}
                    disabled={qrLoading}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {qrLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {qrImageUrl ? 'Refresh QR' : 'Load QR Code'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Buka WhatsApp → Linked Devices → Scan QR ini. Auto-refresh tiap 30 detik.
                </p>
              </div>
            )}

            {/* Pairing Code method */}
            {loginMethod === 'code' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Nomor HP (format internasional)</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="628123456789"
                      className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={handleRequestPairingCode}
                      disabled={pairingLoading}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {pairingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                      Get Code
                    </button>
                  </div>
                </div>
                {pairingCode && (
                  <div className="p-4 bg-slate-100 rounded-xl border border-yellow-500/20 text-center">
                    <p className="text-xs text-slate-500 mb-2">Masukkan kode ini di WhatsApp:</p>
                    <p className="text-2xl font-mono font-bold tracking-[0.3em] text-yellow-400">{pairingCode}</p>
                    <p className="text-[11px] text-slate-500 mt-2">Settings → Linked Devices → Link a Device → Link with phone number</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 2: Waha Configuration ── */}
      <div className="bg-white border border-slate-300/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Konfigurasi Waha</h3>
            <p className="text-xs text-slate-500 mt-0.5">Server URL, API key, dan filter severity</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-100/50 rounded-xl border border-slate-300/30">
            <div>
              <p className="text-sm font-medium text-white">Aktifkan Notifikasi WhatsApp</p>
              <p className="text-xs text-slate-500 mt-0.5">Kirim alert ke WhatsApp saat ada deteksi</p>
            </div>
            <button
              onClick={() => setConfig((p) => ({ ...p, is_enabled: !p.is_enabled }))}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 ${config.is_enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${config.is_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Waha URL */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Waha Server URL</label>
            <input
              type="url"
              value={config.waha_url}
              onChange={(e) => setConfig((p) => ({ ...p, waha_url: e.target.value }))}
              placeholder="http://waha:3000"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">API Key (opsional)</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.waha_api_key || ''}
                onChange={(e) => setConfig((p) => ({ ...p, waha_api_key: e.target.value || null }))}
                placeholder="Kosongkan jika tidak dikonfigurasi"
                className="w-full px-3 py-2 pr-10 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => setShowApiKey((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Session name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nama Session</label>
            <input
              type="text"
              value={config.session_name}
              onChange={(e) => setConfig((p) => ({ ...p, session_name: e.target.value }))}
              placeholder="default"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Severity filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              <Shield className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              Filter Severity Alert
            </label>
            <p className="text-xs text-slate-500 mb-3">Alert dengan severity yang dicentang akan dikirim ke WhatsApp</p>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_OPTIONS.map((opt) => {
                const active = config.alert_severities?.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleSeverity(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${active ? opt.color : 'bg-slate-100 text-slate-500 border-slate-300 opacity-60'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? opt.dot : 'bg-slate-600'}`} />
                    {opt.label}
                    {active && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Type filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              <AlertCircle className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              Filter Kategori Alert
            </label>
            <p className="text-xs text-slate-500 mb-3">Pilih kategori alert apa saja yang ingin dikirimkan</p>
            <div className="flex flex-wrap gap-2">
              {ALERT_TYPE_OPTIONS.map((opt) => {
                const active = config.alert_types?.includes(opt.value) ?? true;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleAlertType(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${active ? opt.color : 'bg-slate-100 text-slate-500 border-slate-300 opacity-60'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? opt.dot : 'bg-slate-600'}`} />
                    {opt.label}
                    {active && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Konfigurasi
          </button>
        </div>
      </div>

      {/* ── Section 3: Recipients ── */}
      <div className="bg-white border border-slate-300/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Penerima Notifikasi</h3>
              <p className="text-xs text-slate-500 mt-0.5">{recipients.filter((r) => r.is_active).length} aktif dari {recipients.length} penerima</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchGroups}
              disabled={fetchingGroups}
              title="Fetch daftar grup dari WhatsApp yang terhubung"
              className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 hover:border-slate-500 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              {fetchingGroups ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
              Fetch Grup
            </button>
            <button
              onClick={() => { setShowAddModal(true); setNewRecipient({ chat_id: '', label: '', type: 'person' }); }}
              className="px-3 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
        </div>

        {/* Recipients list */}
        {recipients.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada penerima</p>
            <p className="text-xs mt-1">Klik "Tambah" untuk menambahkan grup atau kontak</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {recipients.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${r.is_active ? 'bg-slate-100/50 border-slate-300/30' : 'bg-white/50 border-slate-200/30 opacity-60'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.type === 'group' ? 'bg-blue-500/10' : 'bg-slate-200'}`}>
                  {r.type === 'group'
                    ? <Users className="w-4 h-4 text-blue-600" />
                    : <User className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{r.label}</p>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${r.type === 'group' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                      {r.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{r.chat_id}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Toggle active */}
                  <button
                    onClick={() => handleToggleActive(r)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${r.is_active ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-slate-200 text-slate-500 hover:text-slate-600'}`}
                    title={r.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {r.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setEditingRecipient({ ...r })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 text-slate-500 hover:text-white hover:bg-slate-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecipient(r)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Test message button */}
        <button
          onClick={handleSendTest}
          disabled={sendingTest || recipients.filter((r) => r.is_active).length === 0}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 hover:text-white text-sm font-medium rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Kirim Pesan Test ke Semua Penerima Aktif
        </button>
      </div>

      {/* ── Add Recipient Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Tambah Penerima</h3>
              <button onClick={() => { setShowAddModal(false); setShowGroupDropdown(false); }} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipe Penerima</label>
                <div className="flex gap-2">
                  {(['person', 'group'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setNewRecipient((p) => ({ ...p, type: t })); setShowGroupDropdown(false); }}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${newRecipient.type === t ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' : 'bg-slate-100 text-slate-500 border-slate-300'}`}
                    >
                      {t === 'group' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {t === 'group' ? 'Grup' : 'Personal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-500">Chat ID</label>
                  {newRecipient.type === 'group' && groups.length > 0 && (
                    <button
                      onClick={() => setShowGroupDropdown((p) => !p)}
                      className="text-xs text-blue-600 hover:text-blue-300 flex items-center gap-1"
                    >
                      Pilih dari grup <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Group dropdown */}
                {newRecipient.type === 'group' && showGroupDropdown && groups.length > 0 && (
                  <div className="mb-2 max-h-40 overflow-y-auto bg-slate-100 border border-slate-300 rounded-lg divide-y divide-slate-700/50">
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setNewRecipient((p) => ({ ...p, chat_id: g.id, label: p.label || g.name })); setShowGroupDropdown(false); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-200 transition-colors"
                      >
                        <p className="text-sm font-medium text-white">{g.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{g.id}</p>
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={newRecipient.chat_id}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, chat_id: e.target.value }))}
                  placeholder={newRecipient.type === 'group' ? '120363xxxx@g.us' : '628123456789@c.us'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {newRecipient.type === 'group'
                    ? 'Format: 120363xxxx@g.us · Klik "Fetch Grup" di halaman sebelumnya untuk dapat ID'
                    : 'Format: 628123456789@c.us (nomor internasional tanpa +)'}
                </p>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nama / Label</label>
                <input
                  type="text"
                  value={newRecipient.label}
                  onChange={(e) => setNewRecipient((p) => ({ ...p, label: e.target.value }))}
                  placeholder={newRecipient.type === 'group' ? 'Tim Security' : 'Pak Budi'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowAddModal(false); setShowGroupDropdown(false); }}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 hover:text-white text-sm font-medium rounded-lg border border-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddRecipient}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Recipient Modal ── */}
      {editingRecipient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white">Edit Penerima</h3>
              <button onClick={() => setEditingRecipient(null)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Chat ID</label>
                <input
                  type="text"
                  value={editingRecipient.chat_id}
                  onChange={(e) => setEditingRecipient((p) => p ? { ...p, chat_id: e.target.value } : p)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Label</label>
                <input
                  type="text"
                  value={editingRecipient.label}
                  onChange={(e) => setEditingRecipient((p) => p ? { ...p, label: e.target.value } : p)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-100/50 rounded-xl">
                <span className="text-sm text-slate-600">Aktif</span>
                <button
                  onClick={() => setEditingRecipient((p) => p ? { ...p, is_active: !p.is_active } : p)}
                  className={`relative w-10 h-5 rounded-full transition-all ${editingRecipient.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editingRecipient.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingRecipient(null)}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 hover:text-white text-sm font-medium rounded-lg border border-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateRecipient}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSettings;
