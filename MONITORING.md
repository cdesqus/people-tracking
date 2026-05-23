# Monitoring and Alerting Guide - CCTV Face Recognition Dashboard

Complete monitoring, logging, and alerting setup for production deployment.

## Table of Contents

1. [Overview](#overview)
2. [Application Metrics](#application-metrics)
3. [Infrastructure Monitoring](#infrastructure-monitoring)
4. [Logging Strategy](#logging-strategy)
5. [Alerting Rules](#alerting-rules)
6. [Dashboards](#dashboards)
7. [Health Checks](#health-checks)
8. [Performance Optimization](#performance-optimization)

---

## Overview

### Monitoring Stack

- **Metrics**: Prometheus
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **APM**: DataDog or Sentry
- **Alerting**: Prometheus AlertManager
- **Visualization**: Grafana

### Key Performance Indicators (KPIs)

```yaml
Availability:
  - Target: 99.9% uptime
  - Alert: < 99.5%

Response Time:
  - p50: < 100ms
  - p95: < 500ms
  - p99: < 1000ms

Error Rate:
  - Target: < 0.1%
  - Alert: > 1%

Resource Usage:
  - CPU: < 70%
  - Memory: < 80%
  - Disk: < 85%
```

---

## Application Metrics

### Backend Metrics

```python
# app/metrics.py - Prometheus metrics

from prometheus_client import Counter, Histogram, Gauge

# Request metrics
request_count = Counter(
    'cctv_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'cctv_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint'],
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0)
)

# Database metrics
db_connections = Gauge(
    'cctv_db_connections',
    'Active database connections'
)

db_query_duration = Histogram(
    'cctv_db_query_duration_seconds',
    'Database query duration',
    ['query_type']
)

# Face detection metrics
detections_processed = Counter(
    'cctv_detections_processed_total',
    'Total face detections processed',
    ['status']
)

detection_confidence = Histogram(
    'cctv_detection_confidence',
    'Face detection confidence scores',
    buckets=(0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99)
)

# Cache metrics
cache_hits = Counter(
    'cctv_cache_hits_total',
    'Cache hits',
    ['cache_type']
)

cache_misses = Counter(
    'cctv_cache_misses_total',
    'Cache misses',
    ['cache_type']
)

# AWS API metrics
aws_api_calls = Counter(
    'cctv_aws_api_calls_total',
    'AWS API calls',
    ['service', 'operation']
)

aws_api_errors = Counter(
    'cctv_aws_api_errors_total',
    'AWS API errors',
    ['service', 'error_type']
)
```

### Middleware Integration

```python
# app/middleware/metrics.py

from prometheus_client import REGISTRY
from starlette.middleware.base import BaseHTTPMiddleware
from time import time

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time()
        
        response = await call_next(request)
        
        duration = time() - start_time
        
        request_count.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        request_duration.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response

# Add to FastAPI app
app.add_middleware(MetricsMiddleware)

# Expose metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(REGISTRY), media_type="text/plain")
```

### Frontend Metrics

```javascript
// frontend/src/lib/metrics.js

class MetricsCollector {
  constructor() {
    this.metrics = {
      pageViews: 0,
      apiCalls: 0,
      errors: 0,
      performanceTiming: {}
    };
  }

  trackPageView(path) {
    this.metrics.pageViews++;
    this.sendMetric('page_view', { path });
  }

  trackAPICall(endpoint, duration, status) {
    this.metrics.apiCalls++;
    this.sendMetric('api_call', { endpoint, duration, status });
  }

  trackError(error) {
    this.metrics.errors++;
    this.sendMetric('error', { message: error.message });
  }

  trackWebSocketMessage(type, duration) {
    this.sendMetric('websocket_message', { type, duration });
  }

  sendMetric(name, data) {
    // Send to backend metrics endpoint
    fetch('/api/v1/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data, timestamp: new Date() })
    });
  }
}

export const metrics = new MetricsCollector();
```

---

## Infrastructure Monitoring

### Docker Container Monitoring

```yaml
# docker-compose.prod.yml additions

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - cctv-network
    restart: always

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - cctv-network
    restart: always

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - cctv-network
    restart: always

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - cctv-network
    restart: always
```

### Prometheus Configuration

```yaml
# prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: production
    service: cctv-dashboard

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'cctv-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

rule_files:
  - '/etc/prometheus/rules/*.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

---

## Logging Strategy

### Log Levels

```
DEBUG   - Detailed troubleshooting information
INFO    - General informational messages
WARNING - Warning messages for potential issues
ERROR   - Error conditions
CRITICAL- Critical errors requiring immediate attention
```

### Structured Logging

```python
# app/logging_config.py

import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)

# Configure logging
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': JSONFormatter
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'json',
            'filename': 'logs/cctv.log',
            'maxBytes': 104857600,  # 100MB
            'backupCount': 10
        }
    },
    'loggers': {
        'app': {
            'handlers': ['console', 'file'],
            'level': 'INFO'
        },
        'sqlalchemy': {
            'handlers': ['console', 'file'],
            'level': 'WARNING'
        }
    }
}
```

### Log Aggregation with ELK

```yaml
# docker-compose.yml additions

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - cctv-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    environment:
      - "LS_JAVA_OPTS=-Xmx256m -Xms256m"
    networks:
      - cctv-network
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - cctv-network
    depends_on:
      - elasticsearch
```

---

## Alerting Rules

### Alert Rules

```yaml
# rules/alerts.yml

groups:
  - name: cctv_alerts
    interval: 1m
    rules:
      # API Availability
      - alert: APIDown
        expr: up{job="cctv-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CCTV Backend API is down"
          description: "Backend service has been unavailable for more than 1 minute"

      # Response Time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, request_duration_seconds) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time > 1s"

      # Error Rate
      - alert: HighErrorRate
        expr: |
          sum(rate(request_count_total{status=~"5.."}[5m])) /
          sum(rate(request_count_total[5m])) > 0.01
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate > 1%"

      # Database
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL database is down"

      - alert: HighDBConnections
        expr: pg_stat_activity_count > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "{{ $value }} connections active"

      # Cache
      - alert: CacheDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Redis cache is down"

      - alert: LowCacheHitRate
        expr: |
          rate(cache_hits_total[5m]) /
          (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) < 0.7
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low cache hit rate"
          description: "Cache hit rate < 70%"

      # Resource Usage
      - alert: HighCPUUsage
        expr: container_cpu_usage_seconds_total > 0.7
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "Container CPU > 70%"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Container memory > 80%"

      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 15
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk usage > 85%"

      # Detection metrics
      - alert: FaceDetectionErrors
        expr: rate(detections_processed_total{status="error"}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High face detection error rate"
          description: "{{ $value }} detections/sec failing"

      # AWS API
      - alert: AWSAPIErrors
        expr: rate(aws_api_errors_total[5m]) > 0.01
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "AWS API errors detected"
          description: "Error rate > 1%"
```

### AlertManager Configuration

```yaml
# alertmanager.yml

global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      group_wait: 0s
      repeat_interval: 5m
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#cctv-alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'

  - name: 'critical'
    slack_configs:
      - channel: '#cctv-critical'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'warning'
    slack_configs:
      - channel: '#cctv-warnings'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
```

---

## Dashboards

### Grafana Dashboard JSON

```json
{
  "dashboard": {
    "title": "CCTV Dashboard - Overview",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(request_count_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(request_count_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))"
          }
        ]
      },
      {
        "title": "Face Detections/sec",
        "targets": [
          {
            "expr": "rate(detections_processed_total[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## Health Checks

### Backend Health Endpoint

```python
# app/routers/health.py

from fastapi import APIRouter
from sqlalchemy.orm import Session
import redis
from app.db.database import get_db

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Basic health check"""
    try:
        # Check database
        db.execute("SELECT 1")
        
        # Check cache
        redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }, 503

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness check for Kubernetes"""
    try:
        db.execute("SELECT 1")
        return {"ready": True}
    except:
        return {"ready": False}, 503
```

---

## Performance Optimization

### Query Performance

```sql
-- Identify slow queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Add indexes
CREATE INDEX idx_detections_timestamp 
ON detections(timestamp DESC);
```

### Caching Strategy

```python
# Implement caching
from functools import lru_cache
from redis import Redis

redis = Redis(host='localhost', port=6379, decode_responses=True)

@app.get("/employees/{emp_id}")
async def get_employee(emp_id: str):
    # Check cache first
    cached = redis.get(f"employee:{emp_id}")
    if cached:
        return json.loads(cached)
    
    # Query database
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    
    # Cache for 1 hour
    redis.setex(f"employee:{emp_id}", 3600, json.dumps(employee))
    
    return employee
```

---

**Last Updated**: May 2026
**Version**: 1.0.0
