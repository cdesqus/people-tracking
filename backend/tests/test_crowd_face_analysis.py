import numpy as np
import cv2
import pytest
from types import SimpleNamespace

from app.services import local_face_recognition
from app.services.local_face_recognition import (
    LocalFaceRecognitionService,
    _bbox_iou,
    _deduplicate_candidates,
    _tile_regions,
)


def test_two_tiles_cover_1080p_frame_with_overlap():
    regions = _tile_regions(1920, 1080, overlap_ratio=0.15)

    assert len(regions) == 2
    assert regions[0][0:2] == (0, 0)
    assert regions[-1][2:4] == (1920, 1080)
    assert regions[0][2] > regions[1][0]


def test_iou_detects_overlapping_face_boxes():
    first = np.array([900, 400, 1000, 520], dtype=np.float32)
    duplicate = np.array([910, 405, 1005, 525], dtype=np.float32)

    assert _bbox_iou(first, duplicate) > 0.70


def test_deduplication_keeps_highest_confidence_face():
    candidates = [
        {
            "bbox": np.array([900, 400, 1000, 520], dtype=np.float32),
            "confidence": 0.81,
            "embedding": np.array([1.0]),
        },
        {
            "bbox": np.array([910, 405, 1005, 525], dtype=np.float32),
            "confidence": 0.94,
            "embedding": np.array([2.0]),
        },
    ]

    result = _deduplicate_candidates(candidates)

    assert len(result) == 1
    assert result[0]["confidence"] == 0.94


@pytest.mark.asyncio
async def test_1080p_analysis_uses_two_tiles_and_returns_global_boxes(monkeypatch):
    class FakeApp:
        def __init__(self):
            self.calls = 0

        def get(self, tile):
            self.calls += 1
            height, width = tile.shape[:2]
            return [
                SimpleNamespace(
                    bbox=np.array(
                        [width * 0.2, height * 0.2, width * 0.4, height * 0.5],
                        dtype=np.float32,
                    ),
                    det_score=0.95,
                    normed_embedding=np.array([1.0, 0.0], dtype=np.float32),
                )
            ]

    fake_app = FakeApp()

    async def cache_is_ready():
        return None

    monkeypatch.setattr(local_face_recognition, "_get_insight_app", lambda: fake_app)
    monkeypatch.setattr(
        local_face_recognition, "_ensure_cache_fresh", cache_is_ready
    )
    monkeypatch.setattr(
        local_face_recognition._embedding_cache, "_data", {}
    )
    monkeypatch.setenv("FACE_CROWD_MODE", "auto")

    frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    encoded, jpeg = cv2.imencode(".jpg", frame)
    assert encoded

    results = await LocalFaceRecognitionService().analyze_faces(
        "employees", jpeg.tobytes()
    )

    assert fake_app.calls == 2
    assert len(results) == 2
    assert all(
        0.0 <= result["bbox"]["Left"] <= 1.0
        and 0.0 <= result["bbox"]["Top"] <= 1.0
        for result in results
    )
