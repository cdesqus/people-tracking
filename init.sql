-- Initial database setup for CCTV Face Recognition Dashboard
-- This is run automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create enum types
CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'operator', 'security', 'receptionist', 'viewer');
CREATE TYPE detection_status_enum AS ENUM ('verified', 'pending', 'rejected', 'in_progress');
CREATE TYPE visitor_status_enum AS ENUM ('checked_in', 'checked_out', 'flagged');

-- Create tables (these will be managed by SQLAlchemy ORM, but we add indexes)
-- Indexes for performance optimization

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(emp_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_face_encoding ON employees USING GIN (face_encoding);

-- Detections table indexes
CREATE INDEX IF NOT EXISTS idx_detections_person_id ON detections(person_id);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_detections_status ON detections(status);
CREATE INDEX IF NOT EXISTS idx_detections_confidence ON detections(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_detections_location_id ON detections(location_id);
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp_person ON detections(timestamp DESC, person_id);

-- Visitors table indexes
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_visitors_host_emp_id ON visitors(host_emp_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_check_in_date ON visitors(check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_check_out_date ON visitors(check_out_time);
CREATE INDEX IF NOT EXISTS idx_visitors_organization ON visitors(organization);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);

-- Locations table indexes
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_locations_camera_id ON locations(camera_id);
CREATE INDEX IF NOT EXISTS idx_locations_building ON locations(building);
CREATE INDEX IF NOT EXISTS idx_locations_floor ON locations(floor);

-- Access logs table indexes
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource ON access_logs(resource_type, resource_id);

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_detection_id ON alerts(detection_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(alert_timestamp DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Reports table indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON reports(start_date DESC, end_date DESC);

-- Create materialized view for daily statistics (optional, for performance)
-- This can be used for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_detection_stats AS
SELECT 
  DATE(d.timestamp) as date,
  d.person_id,
  COUNT(*) as detection_count,
  AVG(d.confidence) as avg_confidence,
  MAX(d.confidence) as max_confidence,
  COUNT(DISTINCT d.location_id) as locations_visited
FROM detections d
WHERE d.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(d.timestamp), d.person_id;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_detection_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_person_id ON daily_detection_stats(person_id);

-- Insert sample locations (optional)
INSERT INTO locations (location_id, building, floor, location_name, camera_id, created_at)
VALUES 
  ('loc_001', 'Building A', '1', 'Main Entrance', 'cam_001', NOW()),
  ('loc_002', 'Building A', '2', 'Conference Room', 'cam_002', NOW()),
  ('loc_003', 'Building B', '1', 'Lobby', 'cam_003', NOW()),
  ('loc_004', 'Building B', '3', 'Server Room', 'cam_004', NOW())
ON CONFLICT (location_id) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cctv_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cctv_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO cctv_user;
