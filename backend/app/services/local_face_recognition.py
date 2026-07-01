"""
Local Face Recognition Service using InsightFace (ArcFace model).

Drop-in replacement for aws_rekognition.py — exposes the exact same
interface so face_processor.py requires zero logic changes.

Face embeddings are stored as JSON in employees.face_encoding column.
Matching is done via cosine similarity (no cloud calls, no per-image cost).
"""
import logging
import io
import uuid
import time
from typing import List, Dict, Any, Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy-load InsightFace so that import errors don't crash the whole app
# if the package isn't installed yet.
# ---------------------------------------------------------------------------
_insight_app = None
_insight_load_error: Optional[str] = None


def _get_insight_app():
    """Return the cached InsightFace FaceAnalysis app, loading it on first call.

    Model selection (set INSIGHTFACE_MODEL env var to override):
      buffalo_sc  — compact ArcFace, ~80ms/frame on CPU  [DEFAULT for CPU servers]
      buffalo_l   — full ArcFace,  ~300ms/frame on CPU  (use when GPU is available)
    """
    global _insight_app, _insight_load_error
    if _insight_app is not None:
        return _insight_app
    if _insight_load_error is not None:
        raise RuntimeError(_insight_load_error)
    try:
        from insightface.app import FaceAnalysis
        import os

        model_name = os.getenv("INSIGHTFACE_MODEL", "buffalo_sc")
        # CPU-optimised detection size: 320x320 is ~4x faster than 640x640
        # with negligible accuracy difference for surveillance camera frames.
        det_size = (320, 320)

        logger.info(f"Loading InsightFace model '{model_name}' (CPU mode, det_size={det_size})...")
        app = FaceAnalysis(
            name=model_name,
            providers=["CPUExecutionProvider"],
        )
        app.prepare(ctx_id=0, det_size=det_size)
        _insight_app = app
        logger.info(f"InsightFace '{model_name}' loaded successfully.")
        return _insight_app
    except Exception as e:
        _insight_load_error = str(e)
        logger.error(f"Failed to load InsightFace: {e}")
        raise


# ---------------------------------------------------------------------------
# Embedding cache — avoids hitting DB on every frame
# ---------------------------------------------------------------------------
class _EmbeddingCache:
    """In-memory cache of employee embeddings, refreshed every 60 seconds."""
    TTL = 60  # seconds

    def __init__(self):
        self._data: Dict[str, np.ndarray] = {}   # employee_id -> embedding
        self._loaded_at: float = 0.0
        self._loading: bool = False

    def is_stale(self) -> bool:
        return (time.time() - self._loaded_at) > self.TTL

    def set(self, embeddings: Dict[str, np.ndarray]):
        self._data = embeddings
        self._loaded_at = time.time()
        logger.info(f"[LocalFR] Embedding cache updated with {len(embeddings)} employee(s).")

    def get_all(self) -> Dict[str, np.ndarray]:
        return self._data


_embedding_cache = _EmbeddingCache()


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two L2-normalised vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _bytes_to_bgr(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes to a BGR numpy array (OpenCV format)."""
    import cv2
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return frame


async def _load_embeddings_from_db() -> Dict[str, np.ndarray]:
    """
    Fetch all active employees that have a face_encoding stored in the DB.
    Returns a dict: {employee_id: embedding_array}.
    """
    try:
        from sqlalchemy import select
        from app.database import async_session
        from app.models.employee import Employee

        result: Dict[str, np.ndarray] = {}
        async with async_session() as session:
            stmt = select(Employee).where(
                Employee.deleted_at == None,
                Employee.face_encoding != None,
            )
            res = await session.execute(stmt)
            employees = res.scalars().all()
            for emp in employees:
                if emp.face_encoding:
                    try:
                        result[emp.id] = np.array(emp.face_encoding, dtype=np.float32)
                    except Exception as e:
                        logger.warning(f"[LocalFR] Bad encoding for employee {emp.id}: {e}")
        return result
    except Exception as e:
        logger.error(f"[LocalFR] Error loading embeddings from DB: {e}")
        return {}


async def _ensure_cache_fresh():
    """Refresh the embedding cache if it is stale."""
    if _embedding_cache.is_stale():
        embeddings = await _load_embeddings_from_db()
        _embedding_cache.set(embeddings)


# ---------------------------------------------------------------------------
# Exception (mirrors aws_rekognition.NoFacesException)
# ---------------------------------------------------------------------------
class NoFacesException(Exception):
    """Raised when no faces are detected in the image."""
    pass


# ---------------------------------------------------------------------------
# Main service class — same public interface as RekognitionService
# ---------------------------------------------------------------------------
class LocalFaceRecognitionService:
    """
    Self-hosted face recognition using InsightFace (ArcFace / buffalo_l).
    Interface is intentionally identical to RekognitionService so that
    face_processor.py requires no logic changes.
    """

    # ------------------------------------------------------------------
    # detect_faces  — equivalent to rekognition.detect_faces()
    # ------------------------------------------------------------------
    async def detect_faces(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Detect all faces in an image.

        Returns a list of dicts with keys:
            BoundingBox  -> {Left, Top, Width, Height}  (0.0–1.0 normalised)
            Confidence   -> float (0–100)
        Compatible with AWS Rekognition FaceDetails format.
        """
        try:
            app = _get_insight_app()
            frame = _bytes_to_bgr(image_bytes)
            if frame is None:
                return []

            h, w = frame.shape[:2]
            faces = app.get(frame)

            result = []
            for face in faces:
                bbox = face.bbox  # [x1, y1, x2, y2] in pixels
                x1, y1, x2, y2 = bbox
                result.append({
                    "BoundingBox": {
                        "Left":   max(0.0, float(x1) / w),
                        "Top":    max(0.0, float(y1) / h),
                        "Width":  min(1.0, float(x2 - x1) / w),
                        "Height": min(1.0, float(y2 - y1) / h),
                    },
                    "Confidence": float(face.det_score) * 100,
                })
            return result
        except Exception as e:
            logger.error(f"[LocalFR] detect_faces error: {e}")
            return []

    # ------------------------------------------------------------------
    # search_faces_by_image  — equivalent to rekognition.search_faces_by_image()
    # ------------------------------------------------------------------
    async def search_faces_by_image(
        self,
        collection_id: str,   # ignored (local; kept for API compatibility)
        image_bytes: bytes,
        threshold: float = 0.6,
    ) -> Dict[str, Any]:
        """
        Detect the most prominent face in the image, then search for a
        matching employee by cosine similarity of ArcFace embeddings.

        Returns a dict with keys:
            matches                    -> list of match dicts (AWS FaceMatch format)
            searched_face_bounding_box -> {Left, Top, Width, Height} (0.0–1.0)

        Raises NoFacesException if no face is detected.
        """
        app = _get_insight_app()
        frame = _bytes_to_bgr(image_bytes)
        if frame is None:
            raise NoFacesException("Could not decode image")

        h, w = frame.shape[:2]
        faces = app.get(frame)

        if not faces:
            raise NoFacesException("No faces detected in the image")

        # Pick the face with the highest detection confidence
        best_face = max(faces, key=lambda f: f.det_score)
        query_embedding = best_face.normed_embedding  # already L2-normalised

        # Bounding box of the detected face (normalised)
        x1, y1, x2, y2 = best_face.bbox
        searched_bbox = {
            "Left":   max(0.0, float(x1) / w),
            "Top":    max(0.0, float(y1) / h),
            "Width":  min(1.0, float(x2 - x1) / w),
            "Height": min(1.0, float(y2 - y1) / h),
        }

        # Refresh embedding cache if stale
        await _ensure_cache_fresh()
        all_embeddings = _embedding_cache.get_all()

        matches = []
        for emp_id, emp_embedding in all_embeddings.items():
            similarity = _cosine_similarity(query_embedding, emp_embedding)
            # Convert cosine similarity [0,1] to a percentage-like score [0,100]
            # and apply the threshold (threshold is in 0.0–1.0 range from settings)
            similarity_pct = similarity * 100.0
            if similarity >= threshold:
                matches.append({
                    "Similarity": similarity_pct,
                    "Face": {
                        # Use employee ID as ExternalImageId (same as AWS indexing)
                        "ExternalImageId": emp_id,
                        "FaceId": f"local-{emp_id}",
                        "Confidence": similarity_pct,
                    },
                })

        # Sort by best match first
        matches.sort(key=lambda m: m["Similarity"], reverse=True)

        return {
            "matches": matches,
            "searched_face_bounding_box": searched_bbox,
        }

    # ------------------------------------------------------------------
    # index_face  — equivalent to rekognition.index_face()
    # ------------------------------------------------------------------
    async def index_face(
        self,
        collection_id: str,   # ignored (local; kept for API compatibility)
        image_bytes: bytes,
        external_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Generate an ArcFace embedding for the given photo and persist it
        in employees.face_encoding (JSON column).

        Returns a synthetic face_id string if successful, None otherwise.
        """
        try:
            app = _get_insight_app()
            frame = _bytes_to_bgr(image_bytes)
            if frame is None:
                logger.warning("[LocalFR] index_face: could not decode image bytes")
                return None

            faces = app.get(frame)
            if not faces:
                logger.warning(f"[LocalFR] index_face: no face detected in photo for employee {external_id}")
                return None

            # Use the most prominent face
            best_face = max(faces, key=lambda f: f.det_score)
            embedding = best_face.normed_embedding.tolist()   # list of 512 floats

            # Persist to DB
            if external_id:
                try:
                    from sqlalchemy import select
                    from app.database import async_session
                    from app.models.employee import Employee

                    async with async_session() as session:
                        res = await session.execute(
                            select(Employee).where(Employee.id == external_id)
                        )
                        emp = res.scalar_one_or_none()
                        if emp:
                            emp.face_encoding = embedding
                            await session.commit()
                            logger.info(f"[LocalFR] Stored face embedding for employee {emp.name} ({emp.id})")
                        else:
                            logger.warning(f"[LocalFR] index_face: employee {external_id} not found in DB")
                except Exception as db_err:
                    logger.error(f"[LocalFR] index_face DB error: {db_err}")

            # Invalidate embedding cache so the new employee is picked up immediately
            _embedding_cache._loaded_at = 0.0

            face_id = f"local-{external_id or uuid.uuid4()}"
            return face_id

        except Exception as e:
            logger.error(f"[LocalFR] index_face error: {e}")
            return None

    # ------------------------------------------------------------------
    # ensure_collection_exists — no-op for local backend
    # ------------------------------------------------------------------
    def ensure_collection_exists(self, collection_id: str):
        """No-op: local backend doesn't use collections."""
        pass


# Singleton instance
local_face_recognition_service = LocalFaceRecognitionService()
