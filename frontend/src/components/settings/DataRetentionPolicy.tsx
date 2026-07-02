/**
 * Data Retention Policy Component
 * Configure data retention settings with improved readability
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsError,
} from '@store/slices/settingsSlice';
import {
  Database,
  FileImage,
  ScrollText,
  Film,
  Trash2,
  Save,
  RotateCcw,
  Clock,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDuration = (days: number): string => {
  if (days >= 365) {
    const years = (days / 365).toFixed(1);
    return `${years} tahun`;
  }
  if (days >= 30) {
    const months = (days / 30).toFixed(1);
    return `${months} bulan`;
  }
  return `${days} hari`;
};

// ─── Retention Slider Sub-component ─────────────────────────────────────────

interface RetentionSliderProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  color: string;      // tailwind accent color name e.g. "blue"
  onChange: (value: number) => void;
}

const RetentionSlider: React.FC<RetentionSliderProps> = ({
  label,
  description,
  icon,
  value,
  min,
  max,
  color,
  onChange,
}) => {
  const pct = ((value - min) / (max - min)) * 100;

  // Color maps
  const colorMap: Record<string, { bg: string; border: string; text: string; accent: string; track: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      accent: 'accent-blue-600',
      track: 'from-blue-400 to-blue-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      accent: 'accent-amber-600',
      track: 'from-amber-400 to-amber-600',
    },
    violet: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      accent: 'accent-violet-600',
      track: 'from-violet-400 to-violet-600',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-5 rounded-xl border-2 ${c.border} ${c.bg} transition-all hover:shadow-md`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">{label}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <span className={`text-3xl font-extrabold ${c.text}`}>{value}</span>
          <span className="text-base font-medium text-gray-500 ml-1">hari</span>
          <p className="text-xs text-gray-500 mt-0.5">≈ {formatDuration(value)}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="relative mt-2">
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer ${c.accent}`}
          style={{
            background: `linear-gradient(to right, var(--tw-gradient-from, #60a5fa) 0%, var(--tw-gradient-to, #2563eb) ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs font-medium text-gray-500">{min} hari</span>
          <span className="text-xs font-medium text-gray-500">{max} hari</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const DataRetentionPolicy: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systemSettings, loading } = useAppSelector((state) => state.settings);
  const [settings, setSettings] = useState(systemSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(systemSettings);
  }, [systemSettings]);

  const handleSave = async () => {
    dispatch(updateSettingsStart());
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Gagal menyimpan pengaturan');

      const data = await response.json();
      dispatch(updateSettingsSuccess(data));
      toast.success('Kebijakan retensi berhasil disimpan!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error menyimpan pengaturan';
      dispatch(updateSettingsError(message));
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(systemSettings);
    toast('Perubahan direset ke nilai terakhir', { icon: '↩️' });
  };

  const hasChanges =
    settings.dataRetention.faceImageDays !== systemSettings.dataRetention.faceImageDays ||
    settings.dataRetention.detectionLogDays !== systemSettings.dataRetention.detectionLogDays ||
    settings.dataRetention.videoArchiveDays !== systemSettings.dataRetention.videoArchiveDays ||
    settings.dataRetention.autoDelete !== systemSettings.dataRetention.autoDelete;

  return (
    <div className="space-y-6">

      {/* ── Section 1: Data Retention Settings ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pengaturan Retensi Data</h2>
              <p className="text-sm text-gray-500 mt-0.5">Atur berapa lama data disimpan di sistem</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <RetentionSlider
            label="Retensi Gambar Wajah"
            description="Berapa lama gambar hasil deteksi wajah disimpan"
            icon={<FileImage className="w-5 h-5 text-blue-600" />}
            value={settings.dataRetention.faceImageDays}
            min={7}
            max={365}
            color="blue"
            onChange={(value) =>
              setSettings({
                ...settings,
                dataRetention: { ...settings.dataRetention, faceImageDays: value },
              })
            }
          />

          <RetentionSlider
            label="Retensi Log Deteksi"
            description="Berapa lama catatan log deteksi disimpan"
            icon={<ScrollText className="w-5 h-5 text-amber-600" />}
            value={settings.dataRetention.detectionLogDays}
            min={30}
            max={365}
            color="amber"
            onChange={(value) =>
              setSettings({
                ...settings,
                dataRetention: { ...settings.dataRetention, detectionLogDays: value },
              })
            }
          />

          <RetentionSlider
            label="Retensi Arsip Video"
            description="Berapa lama rekaman video disimpan"
            icon={<Film className="w-5 h-5 text-violet-600" />}
            value={settings.dataRetention.videoArchiveDays}
            min={7}
            max={365}
            color="violet"
            onChange={(value) =>
              setSettings({
                ...settings,
                dataRetention: { ...settings.dataRetention, videoArchiveDays: value },
              })
            }
          />
        </div>
      </div>

      {/* ── Section 2: Automatic Cleanup ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pembersihan Otomatis</h2>
              <p className="text-sm text-gray-500 mt-0.5">Hapus data lama secara otomatis</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-gray-900">Auto-Delete Data Lama</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  File yang sudah melewati masa retensi akan dihapus otomatis
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  dataRetention: {
                    ...settings.dataRetention,
                    autoDelete: !settings.dataRetention.autoDelete,
                  },
                })
              }
              className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${
                settings.dataRetention.autoDelete
                  ? 'bg-emerald-500 shadow-inner'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  settings.dataRetention.autoDelete ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 3: Summary ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ringkasan Retensi</h2>
              <p className="text-sm text-gray-500 mt-0.5">Gambaran keseluruhan kebijakan retensi data</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Face Images */}
            <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
              <FileImage className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                Gambar Wajah
              </p>
              <p className="text-4xl font-extrabold text-blue-700 mt-2">
                {settings.dataRetention.faceImageDays}
              </p>
              <p className="text-base font-medium text-blue-600 mt-0.5">hari</p>
              <p className="text-sm text-blue-500 mt-2">
                ≈ {formatDuration(settings.dataRetention.faceImageDays)}
              </p>
            </div>

            {/* Detection Logs */}
            <div className="p-5 bg-amber-50 rounded-xl border-2 border-amber-200 text-center">
              <ScrollText className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">
                Log Deteksi
              </p>
              <p className="text-4xl font-extrabold text-amber-700 mt-2">
                {settings.dataRetention.detectionLogDays}
              </p>
              <p className="text-base font-medium text-amber-600 mt-0.5">hari</p>
              <p className="text-sm text-amber-500 mt-2">
                ≈ {formatDuration(settings.dataRetention.detectionLogDays)}
              </p>
            </div>

            {/* Video Archive */}
            <div className="p-5 bg-violet-50 rounded-xl border-2 border-violet-200 text-center">
              <Film className="w-8 h-8 text-violet-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-violet-800 uppercase tracking-wide">
                Arsip Video
              </p>
              <p className="text-4xl font-extrabold text-violet-700 mt-2">
                {settings.dataRetention.videoArchiveDays}
              </p>
              <p className="text-base font-medium text-violet-600 mt-0.5">hari</p>
              <p className="text-sm text-violet-500 mt-2">
                ≈ {formatDuration(settings.dataRetention.videoArchiveDays)}
              </p>
            </div>
          </div>

          {/* Auto-delete status badge */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {settings.dataRetention.autoDelete ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Auto-delete aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold border border-gray-200">
                Auto-delete nonaktif
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Kebijakan Retensi
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges || saving}
          className="px-6 py-3 bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        {hasChanges && (
          <span className="text-sm text-amber-600 font-medium ml-2">
            • Ada perubahan yang belum disimpan
          </span>
        )}
      </div>
    </div>
  );
};

export default DataRetentionPolicy;
