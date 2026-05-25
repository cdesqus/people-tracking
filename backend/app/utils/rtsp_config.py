"""
RTSP Configuration for different CCTV brands
Supports Hikvision, Dahua, Uniview, Axis, TP-Link, Reolink, and generic RTSP
"""

from typing import Dict, Any

# RTSP format templates for different CCTV brands
RTSP_FORMATS: Dict[str, Dict[str, Any]] = {
    "hikvision": {
        "label": "Hikvision",
        "template": "rtsp://{user}:{password}@{ip}:{port}/Streaming/Channels/{channel}",
        "default_port": 554,
        "default_channel": "101",
        "channel_format": "101, 102, 103, ...",
        "description": "DS-2CD2xxx series, iDS-2xxx series",
        "example_url": "rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101"
    },
    "dahua": {
        "label": "Dahua",
        "template": "rtsp://{user}:{password}@{ip}:{port}/cam/realmonitor?channel={channel}&subtype=0",
        "default_port": 554,
        "default_channel": "1",
        "channel_format": "1, 2, 3, ... (subtype: 0=main, 1=sub)",
        "description": "IPC-based Dahua cameras",
        "example_url": "rtsp://admin:admin123@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
    },
    "uniview": {
        "label": "Uniview",
        "template": "rtsp://{user}:{password}@{ip}:{port}/video{channel}",
        "default_port": 554,
        "default_channel": "1",
        "channel_format": "1, 2, 3, ...",
        "description": "IPC5xx, IPC6xx series",
        "example_url": "rtsp://admin:password@192.168.1.100:554/video1"
    },
    "axis": {
        "label": "Axis Communications",
        "template": "rtsp://{user}:{password}@{ip}:{port}/axis-media/media.amp",
        "default_port": 554,
        "default_channel": "1",
        "channel_format": "N/A (unified stream)",
        "description": "Axis P3xxx, P5xxx series",
        "example_url": "rtsp://admin:password@192.168.1.100:554/axis-media/media.amp"
    },
    "tp-link": {
        "label": "TP-Link",
        "template": "rtsp://{user}:{password}@{ip}:{port}/stream{channel}",
        "default_port": 554,
        "default_channel": "1",
        "channel_format": "1, 2, 3, ...",
        "description": "VIGI series cameras",
        "example_url": "rtsp://admin:password@192.168.1.100:554/stream1"
    },
    "reolink": {
        "label": "Reolink",
        "template": "rtsp://{user}:{password}@{ip}:{port}/h264Preview_0{channel}_main",
        "default_port": 554,
        "default_channel": "1",
        "channel_format": "1, 2, 3, ...",
        "description": "Reolink RLC, PoE series",
        "example_url": "rtsp://admin:password@192.168.1.100:554/h264Preview_01_main"
    },
    "hikvision_v2": {
        "label": "Hikvision (V2 - Newer)",
        "template": "rtsp://{user}:{password}@{ip}:{port}/ISAPI/Stream/Channels/{channel}/HTTP/Query",
        "default_port": 554,
        "default_channel": "1",
        "channel_format": "1, 2, 3, ...",
        "description": "Newer Hikvision cameras",
        "example_url": "rtsp://admin:password@192.168.1.100:554/ISAPI/Stream/Channels/1/HTTP/Query"
    },
    "generic": {
        "label": "Generic RTSP",
        "template": "rtsp://{user}:{password}@{ip}:{port}{stream_path}",
        "default_port": 554,
        "default_channel": "N/A",
        "channel_format": "Custom stream path",
        "description": "Custom RTSP URLs",
        "example_url": "rtsp://admin:password@192.168.1.100:554/stream"
    }
}

# Supported brands list
SUPPORTED_BRANDS = list(RTSP_FORMATS.keys())

# Brand-to-port mapping
BRAND_DEFAULT_PORTS = {
    brand: config["default_port"] 
    for brand, config in RTSP_FORMATS.items()
}

# Brand-to-channel mapping
BRAND_DEFAULT_CHANNELS = {
    brand: config["default_channel"] 
    for brand, config in RTSP_FORMATS.items()
}


def get_brand_config(brand: str) -> Dict[str, Any]:
    """Get configuration for a specific brand"""
    return RTSP_FORMATS.get(brand.lower(), RTSP_FORMATS["generic"])


def get_supported_brands() -> list[str]:
    """Get list of supported brands"""
    return SUPPORTED_BRANDS


def get_brand_example_url(brand: str) -> str:
    """Get example RTSP URL for a brand"""
    config = get_brand_config(brand)
    return config.get("example_url", "")
