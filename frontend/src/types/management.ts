/**
 * @file Management Types
 * Employee and Visitor management types
 */

export interface Employee {
  id: string;
  name: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  photo_url?: string;
  badge_id?: string;
  contact?: string;
  email?: string;
  last_detected?: string;
  current_location?: string;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: string;
  name: string;
  organization: string;
  purpose: string;
  host: string;
  phone: string;
  email: string;
  photo_url?: string;
  check_in_time: string;
  check_out_time?: string;
  expected_checkout?: string;
  status: 'checked_in' | 'checked_out' | 'expired';
  current_location?: string;
  badge_number?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Detection {
  id: string;
  person_id: string;
  camera_id: string;
  timestamp: string;
  location: string;
  confidence: number;
  image_url?: string;
}

export interface EmployeeTimeline {
  id: string;
  person_id?: string;
  timestamp: string;
  camera_id: string;
  camera_name?: string;
  location: string;
  confidence: number;
  image_url?: string;
  has_image?: boolean;
}

export interface VisitorTimeline {
  id: string;
  visitor_id: string;
  timestamp: string;
  camera: string;
  location: string;
  event: 'check_in' | 'movement' | 'check_out';
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  presentNow: number;
  onLeave: number;
}

export interface VisitorStats {
  totalVisitors: number;
  checkedIn: number;
  checkedOut: number;
  expired: number;
}
