import logging
import os
import threading
import time
from typing import Optional

import cv2

from app.services.frame_quality import has_slicing_artifact
from app.services.rtsp_service import RTSPService

logger = logging.getLogger(__name__)

_threads: dict[str, threading.Thread] = {}
_active: dict[str, bool] = {}
_generations: dict[str, int] = {}
_urls: dict[str, str] = {}


def configure_opencv_ffmpeg_defaults() -> None:
    """Prefer stable RTSP over TCP unless production explicitly overrides it."""
    os.environ.setdefault(
        "OPENCV_FFMPEG_CAPTURE_OPTIONS",
        "rtsp_transport;tcp|timeout;5000000",
    )
    os.environ.setdefault("OPENCV_FFMPEG_LOGLEVEL", "8")
    os.environ.pop("OPENCV_FFMPEG_THREADS", None)


def create_capture(stream_url: str, timeout_ms: int = 3000):
    configure_opencv_ffmpeg_defaults()
    open_timeout_property = getattr(cv2, "CAP_PROP_OPEN_TIMEOUT_MSEC", None)
    read_timeout_property = getattr(cv2, "CAP_PROP_READ_TIMEOUT_MSEC", None)
    params = []
    if open_timeout_property is not None:
        params.extend([open_timeout_property, timeout_ms])
    if read_timeout_property is not None:
        params.extend([read_timeout_property, timeout_ms])

    if params:
        try:
            cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG, params)
        except (TypeError, cv2.error):
            cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
    else:
        cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)

    try:
        buffer_size_property = getattr(cv2, "CAP_PROP_BUFFERSIZE", None)
        if buffer_size_property is not None:
            cap.set(buffer_size_property, 1)
    except Exception:
        pass
    return cap


def _is_structurally_valid(frame, reference_frame) -> bool:
    if frame is None or frame.ndim != 3 or frame.shape[2] != 3:
        return False
    height, width = frame.shape[:2]
    if width < 64 or height < 64:
        return False
    return reference_frame is None or frame.shape == reference_frame.shape


def _worker(stream_key: str, stream_url: str, generation: int):
    cap = create_capture(stream_url)
    logger.info("Started shared frame reader for %s generation %s", stream_key, generation)
    reference_frame = None
    rejected_frames = 0
    slicing_frames = 0
    warmup_frames_remaining = 3

    while _active.get(stream_key, False) and _generations.get(stream_key) == generation:
        if _urls.get(stream_key) != stream_url:
            break

        if not cap.isOpened():
            cap.release()
            time.sleep(1)
            if _generations.get(stream_key) != generation:
                break
            cap = create_capture(stream_url)
            reference_frame = None
            slicing_frames = 0
            warmup_frames_remaining = 3
            continue

        ret, frame = cap.read()
        if _generations.get(stream_key) != generation:
            break
        if not ret or frame is None:
            cap.release()
            time.sleep(1)
            if _generations.get(stream_key) != generation:
                break
            cap = create_capture(stream_url)
            reference_frame = None
            rejected_frames = 0
            slicing_frames = 0
            warmup_frames_remaining = 3
            continue

        try:
            small_current = cv2.resize(frame, (160, 90))
        except cv2.error:
            continue

        if has_slicing_artifact(small_current):
            slicing_frames += 1
            if slicing_frames < 3:
                continue
            logger.warning(
                "Stream %s produced 3 repeated-tile slicing artifacts; reopening decoder",
                stream_key,
            )
            cap.release()
            time.sleep(0.5)
            cap = create_capture(stream_url)
            reference_frame = None
            rejected_frames = 0
            slicing_frames = 0
            warmup_frames_remaining = 3
            continue
        slicing_frames = 0

        if warmup_frames_remaining > 0:
            if reference_frame is not None and frame.shape != reference_frame.shape:
                warmup_frames_remaining = 3
            else:
                warmup_frames_remaining -= 1
            reference_frame = frame
            continue

        if not _is_structurally_valid(frame, reference_frame):
            rejected_frames += 1
            if rejected_frames >= 3:
                logger.warning(
                    "Stream %s produced malformed/resolution-changing frames; reopening decoder",
                    stream_key,
                )
                cap.release()
                time.sleep(0.5)
                cap = create_capture(stream_url)
                reference_frame = None
                rejected_frames = 0
                slicing_frames = 0
                warmup_frames_remaining = 3
            continue

        rejected_frames = 0
        cached_frame = frame.copy()
        RTSPService.latest_frames[stream_key] = cached_frame
        RTSPService.latest_frame_times[stream_key] = time.time()
        reference_frame = cached_frame

    cap.release()
    logger.info("Stopped shared frame reader for %s generation %s", stream_key, generation)


def ensure_reader(stream_key: str, stream_url: str) -> None:
    if not stream_key or not stream_url:
        return

    existing_url = _urls.get(stream_key)
    thread = _threads.get(stream_key)
    alive = bool(thread and thread.is_alive())
    if alive and existing_url == stream_url:
        return

    generation = _generations.get(stream_key, 0) + 1
    _generations[stream_key] = generation
    _active[stream_key] = True
    _urls[stream_key] = stream_url
    RTSPService.latest_frame_times[stream_key] = time.time()

    t = threading.Thread(
        target=_worker,
        args=(stream_key, stream_url, generation),
        daemon=True,
    )
    _threads[stream_key] = t
    t.start()


def get_latest_frame(stream_key: str, stream_url: Optional[str] = None, start: bool = False):
    if start and stream_url:
        ensure_reader(stream_key, stream_url)
    frame = RTSPService.latest_frames.get(stream_key)
    return frame.copy() if frame is not None else None


def stop_reader(stream_key: str) -> None:
    _active[stream_key] = False
    _generations[stream_key] = _generations.get(stream_key, 0) + 1
