import cv2
import numpy as np

from app.services.rtsp_service import RTSPService


def test_cached_mjpeg_stream_yields_a_decodable_jpeg():
    camera_id = "test-camera"
    RTSPService.latest_frames[camera_id] = np.full(
        (180, 320, 3), 127, dtype=np.uint8
    )
    RTSPService.latest_frame_times[camera_id] = __import__("time").time()

    stream = RTSPService.generate_mjpeg_stream(
        "rtsp://unused", fps_limit=10, camera_id=camera_id
    )
    try:
        chunk = next(stream)
    finally:
        stream.close()
        RTSPService.latest_frames.pop(camera_id, None)
        RTSPService.latest_frame_times.pop(camera_id, None)

    assert chunk.startswith(b"--frame\r\nContent-Type: image/jpeg\r\n")
    assert b"Content-Length:" in chunk
    jpeg = chunk.split(b"\r\n\r\n", 1)[1][:-2]
    decoded = cv2.imdecode(np.frombuffer(jpeg, dtype=np.uint8), cv2.IMREAD_COLOR)
    assert decoded is not None
    assert decoded.shape[:2] == (180, 320)
