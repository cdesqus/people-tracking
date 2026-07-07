"""Process-wide runtime defaults loaded before application imports.

Python imports `sitecustomize` automatically during interpreter startup when it
is present on `PYTHONPATH`/working directory. Keeping OpenCV/FFmpeg defaults
here makes sure they are applied before any module imports `cv2`.
"""

import os


os.environ.setdefault(
    "OPENCV_FFMPEG_CAPTURE_OPTIONS",
    "rtsp_transport;tcp|timeout;5000000",
)

# FFmpeg log levels use AV_LOG values. -8 is QUIET. CCTV streams with damaged
# H.264 packets can otherwise spam stderr with macroblock/sws scaler warnings
# even when the app is handling bad frames safely.
os.environ.setdefault("OPENCV_FFMPEG_LOGLEVEL", "-8")

# OpenCV's own logger. Keep errors visible only when explicitly overridden.
os.environ.setdefault("OPENCV_LOG_LEVEL", "ERROR")
os.environ.pop("OPENCV_FFMPEG_THREADS", None)
