import { format, formatDistanceToNow } from 'date-fns';
import { DATE_FORMAT, TIME_FORMAT, DATE_TIME_FORMAT } from './constants';

export const formatDate = (date: Date | string): string => {
  try {
    return format(new Date(date), DATE_FORMAT);
  } catch {
    return 'Invalid date';
  }
};

export const formatTime = (date: Date | string): string => {
  try {
    return format(new Date(date), TIME_FORMAT);
  } catch {
    return 'Invalid time';
  }
};

export const formatDateTime = (date: Date | string): string => {
  try {
    return format(new Date(date), DATE_TIME_FORMAT);
  } catch {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: Date | string): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(1)}%`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };
  return colors[severity] || 'text-gray-500';
};

export const getSeverityBgColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-blue-50',
    medium: 'bg-yellow-50',
    high: 'bg-orange-50',
    critical: 'bg-red-50',
  };
  return colors[severity] || 'bg-gray-50';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'text-green-500',
    inactive: 'text-gray-500',
    error: 'text-red-500',
  };
  return colors[status] || 'text-gray-500';
};

export const getStatusBgColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-50',
    inactive: 'bg-gray-50',
    error: 'bg-red-50',
  };
  return colors[status] || 'bg-gray-50';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const toTitleCase = (text: string): string => {
  return text
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};
